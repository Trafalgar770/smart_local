-- ==============================================================================
-- SMART LOCAL SERVICE (LocalHelp AI) - Production PostgreSQL / Supabase Schema
-- Strict Invariants: PostGIS Enabled, Strict RLS Policies, 17 Allowed Categories
-- ABSOLUTE REMOVAL OF CLEANING / CLEANER: Completely Purged
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enum Definitions
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE input_type_enum AS ENUM ('TEXT', 'VOICE', 'VISION');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE checklist_answer_enum AS ENUM ('CHECKED', 'UNCHECKED', 'DONT_KNOW');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE service_category_enum AS ENUM (
    'PLUMBER', 'ELECTRICIAN', 'PAINTER', 'LABOUR', 'FUEL_DELIVERY',
    'BIKE_MECHANIC', 'CAR_MECHANIC', 'PUNCTURE_REPAIR', 'BATTERY_JUMPSTART',
    'TOWING', 'CARPENTER', 'AC_REPAIR', 'WELDER', 'MASON', 'MOVERS',
    'APPLIANCE_REPAIR', 'OTHER_SERVICES'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Provider Details Table
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  categories service_category_enum[] NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  completed_jobs INT DEFAULT 0,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  current_location GEOGRAPHY(POINT, 4326),
  service_radius_km NUMERIC(5, 2) DEFAULT 15.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Diagnostics Sessions Table
CREATE TABLE IF NOT EXISTS ai_diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  raw_input TEXT NOT NULL,
  input_type input_type_enum DEFAULT 'TEXT',
  identified_issue TEXT NOT NULL,
  primary_category service_category_enum NOT NULL,
  alternative_categories service_category_enum[],
  confidence_level VARCHAR(20) CHECK (confidence_level IN ('HIGH', 'MODERATE', 'LOW')),
  safety_hazard_detected BOOLEAN DEFAULT FALSE,
  safety_warning_text TEXT,
  checklist_schema JSONB DEFAULT '[]'::jsonb,
  checklist_responses JSONB DEFAULT '{}'::jsonb,
  final_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  diagnostic_id UUID REFERENCES ai_diagnostics(id),
  category service_category_enum NOT NULL,
  problem_summary TEXT NOT NULL,
  status request_status DEFAULT 'PENDING',
  estimated_cost_min NUMERIC(10, 2),
  estimated_cost_max NUMERIC(10, 2),
  
  -- Location Sharing Protocol Fields (Explicit Permission Invariant)
  location_sharing_approved BOOLEAN DEFAULT FALSE,
  customer_location GEOGRAPHY(POINT, 4326),
  customer_address_text TEXT,
  location_shared_at TIMESTAMPTZ,
  location_revoked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Provider Live Tracking Stream Table
CREATE TABLE IF NOT EXISTS provider_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  current_location GEOGRAPHY(POINT, 4326) NOT NULL,
  heading NUMERIC(5, 2),
  speed_kmh NUMERIC(5, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Indexing for Fast Geospatial & AI Queries
CREATE INDEX IF NOT EXISTS idx_providers_geo ON providers USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_tracking_geo ON provider_tracking USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_customer ON service_requests (customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_provider ON service_requests (provider_id);

-- 9. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
  CREATE POLICY "Public profiles visible to all" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Providers Policies
DO $$ BEGIN
  CREATE POLICY "Providers visible to all" ON providers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Provider owner update self" ON providers FOR UPDATE USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AI Diagnostics Policies
DO $$ BEGIN
  CREATE POLICY "Customers view own diagnostics" ON ai_diagnostics FOR SELECT USING (auth.uid() = customer_id OR customer_id IS NULL);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers insert own diagnostics" ON ai_diagnostics FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Service Requests Policies (Strict Privacy Boundaries)
DO $$ BEGIN
  CREATE POLICY "Customers view own requests" ON service_requests FOR SELECT USING (auth.uid() = customer_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers view assigned requests" ON service_requests FOR SELECT USING (
    auth.uid() IN (SELECT profile_id FROM providers WHERE id = provider_id)
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers insert requests" ON service_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Parties update request state" ON service_requests FOR UPDATE USING (
    auth.uid() = customer_id OR auth.uid() IN (SELECT profile_id FROM providers WHERE id = provider_id)
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Provider Tracking Policies
DO $$ BEGIN
  CREATE POLICY "Tracking viewable only by active customer and provider" ON provider_tracking
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM service_requests sr
        WHERE sr.id = request_id
        AND sr.location_sharing_approved = TRUE
        AND sr.status IN ('ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')
        AND (sr.customer_id = auth.uid() OR sr.provider_id IN (SELECT id FROM providers WHERE profile_id = auth.uid()))
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;
