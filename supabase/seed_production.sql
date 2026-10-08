-- ==============================================================================
-- SMART LOCAL SERVICE (LocalHelp AI) - Production Seed Data for India
-- Realistic Providers across Bangalore, Delhi NCR, Mumbai, Hyderabad, Pune, Chennai
-- STRICT INVARIANT: ABSOLUTE REMOVAL OF CLEANING / CLEANER
-- ==============================================================================

-- 1. Insert Demo Profiles
INSERT INTO profiles (id, role, full_name, phone_number, avatar_url) VALUES
  ('a0000001-0001-0001-0001-000000000001', 'PROVIDER', 'Rajesh Sharma', '+919876543210', 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'),
  ('a0000001-0001-0001-0001-000000000002', 'PROVIDER', 'Vikram Singh', '+919876543211', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
  ('a0000001-0001-0001-0001-000000000003', 'PROVIDER', 'Karthik Raman', '+919876543212', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('a0000001-0001-0001-0001-000000000004', 'PROVIDER', 'Amit Patel', '+919876543213', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('a0000001-0001-0001-0001-000000000005', 'PROVIDER', 'Mohammad Imran', '+919876543214', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('a0000001-0001-0001-0001-000000000006', 'PROVIDER', 'Suresh Kumar', '+919876543215', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
  ('a0000001-0001-0001-0001-000000000007', 'PROVIDER', 'Arun Reddy', '+919876543216', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('a0000001-0001-0001-0001-000000000008', 'PROVIDER', 'Pradeep Deshmukh', '+919876543217', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'),
  ('a0000001-0001-0001-0001-000000000009', 'CUSTOMER', 'Pooja Hegde', '+919811122233', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 2. Insert Demo Providers across Indian Metro Areas
INSERT INTO providers (
  id, profile_id, business_name, categories, is_available, is_demo, rating, completed_jobs, min_price, max_price, current_location, service_radius_km
) VALUES
  -- 1. Bangalore Central: Bike Mechanic & Battery Jumpstart
  ('b0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', 'Bangalore Quick Bike Doctor',
   ARRAY['BIKE_MECHANIC', 'BATTERY_JUMPSTART', 'PUNCTURE_REPAIR']::service_category_enum[],
   TRUE, TRUE, 4.9, 142, 299, 799,
   ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326), 18.0),

  -- 2. Bangalore Koramangala / Indiranagar: Electrician & AC Repair
  ('b0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000002', 'VoltCare Electrical & AC Experts',
   ARRAY['ELECTRICIAN', 'AC_REPAIR', 'APPLIANCE_REPAIR']::service_category_enum[],
   TRUE, TRUE, 4.8, 210, 349, 1299,
   ST_SetSRID(ST_MakePoint(77.6245, 12.9352), 4326), 15.0),

  -- 3. Delhi NCR (Connaught Place / South Delhi): Plumber & Mason
  ('b0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000003', 'Capital Express Plumbing & Masonry',
   ARRAY['PLUMBER', 'MASON', 'LABOUR']::service_category_enum[],
   TRUE, TRUE, 4.7, 185, 299, 999,
   ST_SetSRID(ST_MakePoint(77.2167, 28.6315), 4326), 20.0),

  -- 4. Delhi Highway / Noida / Gurgaon: Towing & Fuel Delivery & Car Mechanic
  ('b0000001-0001-0001-0001-000000000004', 'a0000001-0001-0001-0001-000000000004', 'NCR Rapid Highway Rescue & Towing',
   ARRAY['TOWING', 'FUEL_DELIVERY', 'CAR_MECHANIC', 'BATTERY_JUMPSTART']::service_category_enum[],
   TRUE, TRUE, 4.9, 310, 599, 2499,
   ST_SetSRID(ST_MakePoint(77.0878, 28.4595), 4326), 35.0),

  -- 5. Mumbai (Andheri / Bandra): Carpenter, Welder & Painter
  ('b0000001-0001-0001-0001-000000000005', 'a0000001-0001-0001-0001-000000000005', 'Mumbai Craft Wood & Metal Works',
   ARRAY['CARPENTER', 'WELDER', 'PAINTER']::service_category_enum[],
   TRUE, TRUE, 4.6, 98, 399, 1499,
   ST_SetSRID(ST_MakePoint(72.8347, 19.1136), 4326), 15.0),

  -- 6. Mumbai (Navi Mumbai / Thane): Movers & Labour
  ('b0000001-0001-0001-0001-000000000006', 'a0000001-0001-0001-0001-000000000006', 'SafeShift Relocations & Labour',
   ARRAY['MOVERS', 'LABOUR']::service_category_enum[],
   TRUE, TRUE, 4.8, 160, 799, 4500,
   ST_SetSRID(ST_MakePoint(72.9982, 19.0330), 4326), 25.0),

  -- 7. Hyderabad (HITEC City): Appliance Repair & Electrician
  ('b0000001-0001-0001-0001-000000000007', 'a0000001-0001-0001-0001-000000000007', 'Cyberabad Appliance Care',
   ARRAY['APPLIANCE_REPAIR', 'ELECTRICIAN', 'OTHER_SERVICES']::service_category_enum[],
   TRUE, TRUE, 4.9, 275, 299, 1199,
   ST_SetSRID(ST_MakePoint(78.3826, 17.4474), 4326), 15.0),

  -- 8. Pune (Kothrud / Hinjawadi): Car & Bike Roadside Assistance
  ('b0000001-0001-0001-0001-000000000008', 'a0000001-0001-0001-0001-000000000008', 'Pune Express Roadside Assistance',
   ARRAY['CAR_MECHANIC', 'BIKE_MECHANIC', 'PUNCTURE_REPAIR', 'FUEL_DELIVERY']::service_category_enum[],
   TRUE, TRUE, 4.8, 192, 299, 1499,
   ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 20.0)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  rating = EXCLUDED.rating;
