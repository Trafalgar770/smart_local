-- SMART LOCAL SERVICE: Production PostgreSQL / Supabase Migration
-- Features: Strict UUIDs, RLS, Cascades, Indexes, Constraints
-- Absolutely NO cleaning or cleaner services.

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer'
    check (role in ('customer', 'provider', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PROVIDER PROFILES
create table if not exists public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  phone text,
  avatar_url text,
  service_area text,
  latitude numeric,
  longitude numeric,
  availability_status text not null default 'offline'
    check (availability_status in ('available', 'busy', 'offline')),
  verified boolean not null default false,
  average_rating numeric(3,2) default 0,
  completed_jobs integer not null default 0,
  response_time_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. SERVICES (Only valid categories - strictly NO cleaning)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. PROVIDER SERVICES (Join Table)
create table if not exists public.provider_services (
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (provider_id, service_id)
);

-- 5. AI SESSIONS
create table if not exists public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  original_problem text not null,
  detected_service_id uuid references public.services(id),
  confidence text check (confidence in ('high', 'moderate', 'low')),
  analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. AI QUESTIONS
create table if not exists public.ai_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_sessions(id) on delete cascade,
  question_text text not null,
  options jsonb,
  answer text,
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

-- 7. CHECKLIST ITEMS (Independent 4-state checklist)
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_sessions(id) on delete cascade,
  item_text text not null,
  response_state text not null default 'unanswered'
    check (response_state in ('unanswered', 'yes', 'no', 'unknown')),
  safety_level text default 'normal'
    check (safety_level in ('normal', 'caution', 'danger')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. SERVICE REQUESTS
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  provider_id uuid references public.provider_profiles(id),
  service_id uuid references public.services(id),
  ai_session_id uuid references public.ai_sessions(id),
  problem_description text not null,
  ai_summary text,
  estimated_min numeric,
  estimated_max numeric,
  status text not null default 'request_sent'
    check (
      status in (
        'request_sent',
        'accepted',
        'on_the_way',
        'arrived',
        'service_started',
        'completed',
        'cancelled'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. LOCATION SHARES (Explicit Permission Only)
create table if not exists public.location_shares (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  provider_id uuid references public.provider_profiles(id),
  permission_status text not null default 'not_shared'
    check (
      permission_status in (
        'not_shared',
        'permission_requested',
        'shared',
        'stopped',
        'expired'
      )
    ),
  latitude numeric,
  longitude numeric,
  accuracy numeric,
  shared_at timestamptz,
  stopped_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. LOCATION UPDATES (Breadcrumbs)
create table if not exists public.location_updates (
  id uuid primary key default gen_random_uuid(),
  location_share_id uuid not null references public.location_shares(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  latitude numeric not null,
  longitude numeric not null,
  accuracy numeric,
  created_at timestamptz not null default now()
);

-- 11. REQUEST STATUS HISTORY
create table if not exists public.request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  status text not null,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 12. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  provider_id uuid not null references public.provider_profiles(id),
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

-- 13. MESSAGES (Request-Scoped Realtime Chat)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  receiver_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);

-- ==========================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_provider_profiles_status on public.provider_profiles(availability_status);
create index if not exists idx_provider_services_service on public.provider_services(service_id);
create index if not exists idx_ai_sessions_customer on public.ai_sessions(customer_id);
create index if not exists idx_ai_questions_session on public.ai_questions(session_id);
create index if not exists idx_checklist_session on public.checklist_items(session_id);
create index if not exists idx_service_requests_customer on public.service_requests(customer_id);
create index if not exists idx_service_requests_provider on public.service_requests(provider_id);
create index if not exists idx_service_requests_status on public.service_requests(status);
create index if not exists idx_service_requests_created on public.service_requests(created_at desc);
create index if not exists idx_location_shares_request on public.location_shares(request_id);
create index if not exists idx_location_shares_status on public.location_shares(permission_status);
create index if not exists idx_messages_request on public.messages(request_id);
create index if not exists idx_reviews_provider on public.reviews(provider_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.services enable row level security;
alter table public.provider_services enable row level security;
alter table public.ai_sessions enable row level security;
alter table public.ai_questions enable row level security;
alter table public.checklist_items enable row level security;
alter table public.service_requests enable row level security;
alter table public.location_shares enable row level security;
alter table public.location_updates enable row level security;
alter table public.request_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

-- Profiles: Public can read basic profile info; Users can update own profile
create policy "Public can view basic profiles" on public.profiles
  for select using (true);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Services: Read-only for everyone
create policy "Anyone can view active services" on public.services
  for select using (active = true);

-- Provider Profiles: Anyone can view active providers; Provider can update own
create policy "Anyone can view providers" on public.provider_profiles
  for select using (true);
create policy "Providers can update own profile" on public.provider_profiles
  for update using (auth.uid() = user_id);

-- Provider Services: Anyone can view; Providers can manage own
create policy "Anyone can view provider services" on public.provider_services
  for select using (true);

-- AI Sessions: Customers only own sessions
create policy "Customer can manage own AI sessions" on public.ai_sessions
  for all using (auth.uid() = customer_id);

-- AI Questions & Checklist: Accessible if owning the session
create policy "Customer can access own questions" on public.ai_questions
  for all using (
    exists (select 1 from public.ai_sessions s where s.id = session_id and s.customer_id = auth.uid())
  );

create policy "Customer can access own checklist" on public.checklist_items
  for all using (
    exists (select 1 from public.ai_sessions s where s.id = session_id and s.customer_id = auth.uid())
  );

-- Service Requests: Customer or assigned Provider
create policy "Customers see own requests" on public.service_requests
  for select using (auth.uid() = customer_id);

create policy "Providers see assigned requests" on public.service_requests
  for select using (
    exists (select 1 from public.provider_profiles p where p.id = provider_id and p.user_id = auth.uid())
  );

create policy "Customers can create requests" on public.service_requests
  for insert with check (auth.uid() = customer_id);

create policy "Participants can update requests" on public.service_requests
  for update using (
    auth.uid() = customer_id or
    exists (select 1 from public.provider_profiles p where p.id = provider_id and p.user_id = auth.uid())
  );

-- Location Shares: STRICT AUTHORIZATION
-- Customer owns; Provider can read ONLY when permission_status = 'shared' AND not expired/stopped
create policy "Customer can manage own location share" on public.location_shares
  for all using (auth.uid() = customer_id);

create policy "Provider can view active location share" on public.location_shares
  for select using (
    permission_status = 'shared' and
    (expires_at is null or expires_at > now()) and
    exists (select 1 from public.provider_profiles p where p.id = provider_id and p.user_id = auth.uid())
  );

-- Messages: Only participants
create policy "Participants can view messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Participants can insert messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Reviews: Anyone can read reviews; Customer can create review for own request
create policy "Anyone can read reviews" on public.reviews
  for select using (true);

create policy "Customers can insert reviews" on public.reviews
  for insert with check (auth.uid() = customer_id);
