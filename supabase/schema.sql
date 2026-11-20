-- BAK Supabase Complete Secure Schema & Robust Trigger
-- Run this script in your Supabase Project -> SQL Editor

create extension if not exists pgcrypto;

-- 1. User & Donor Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  blood_group text not null default 'O+' check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  wilaya text not null default 'Alger',
  birth_date text default '',
  phone text default '',
  avatar text not null default 'me',
  is_donor boolean not null default true,
  lat double precision not null default 36.7538,
  lng double precision not null default 3.0588,
  notifications_enabled boolean not null default true,
  gender text not null default 'male' check (gender in ('male', 'female')),
  pregnant_or_breastfeeding boolean not null default false,
  weight_over_50 boolean not null default true,
  has_chronic_illness boolean not null default false,
  illness_details text default '',
  recent_surgery_or_tattoo boolean not null default false,
  taking_medication boolean not null default false,
  last_donation_date text default '',
  eligibility_status text not null default 'eligible' check (eligibility_status in ('eligible', 'review', 'deferred')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migrations for existing tables
alter table public.profiles add column if not exists gender text not null default 'male';
alter table public.profiles add column if not exists pregnant_or_breastfeeding boolean not null default false;
alter table public.profiles add column if not exists weight_over_50 boolean not null default true;
alter table public.profiles add column if not exists has_chronic_illness boolean not null default false;
alter table public.profiles add column if not exists illness_details text default '';
alter table public.profiles add column if not exists recent_surgery_or_tattoo boolean not null default false;
alter table public.profiles add column if not exists taking_medication boolean not null default false;
alter table public.profiles add column if not exists last_donation_date text default '';
alter table public.profiles add column if not exists eligibility_status text not null default 'eligible';

-- 2. Blood Donations Table
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hospital text not null,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  donation_date date not null,
  status text not null default 'completed' check (status in ('completed', 'scheduled')),
  notes text default '',
  created_at timestamptz not null default now()
);

-- 3. Blood Requests & Notifications Table
create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete set null,
  donor_id uuid references public.profiles(id) on delete cascade,
  requester_name text not null,
  requester_phone text default '',
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  wilaya text not null default 'Alger',
  message text default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Secure Public Donors View with security_invoker = true (Fixes Security Definer View warning)
drop view if exists public.public_donors;
create view public.public_donors with (security_invoker = true) as
  select id, full_name, blood_group, wilaya, avatar, lat, lng, updated_at
  from public.profiles
  where is_donor = true;

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.donations enable row level security;
alter table public.blood_requests enable row level security;

-- Profiles Policies (Optimized with (select auth.uid()) to fix Auth RLS Initialization Plan warning)
drop policy if exists "Public donor profiles are viewable" on public.profiles;
create policy "Public donor profiles are viewable"
  on public.profiles for select
  using (is_donor = true or id = (select auth.uid()));

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = (select auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Donations Policies
drop policy if exists "Users can view own donations" on public.donations;
create policy "Users can view own donations"
  on public.donations for select
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own donations" on public.donations;
create policy "Users can insert own donations"
  on public.donations for insert
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own donations" on public.donations;
create policy "Users can update own donations"
  on public.donations for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own donations" on public.donations;
create policy "Users can delete own donations"
  on public.donations for delete
  using (user_id = (select auth.uid()));

-- Blood Requests Policies
drop policy if exists "Users can view related blood requests" on public.blood_requests;
create policy "Users can view related blood requests"
  on public.blood_requests for select
  using (donor_id = (select auth.uid()) or requester_id = (select auth.uid()));

drop policy if exists "Authenticated users can send blood requests" on public.blood_requests;
create policy "Authenticated users can send blood requests"
  on public.blood_requests for insert
  with check (requester_id = (select auth.uid()));

drop policy if exists "Donors can mark requests as read" on public.blood_requests;
create policy "Donors can mark requests as read"
  on public.blood_requests for update
  using (donor_id = (select auth.uid()))
  with check (donor_id = (select auth.uid()));

-- 5. Robust & Secure Automatic Profile Creation Trigger on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    blood_group,
    wilaya,
    birth_date,
    phone,
    is_donor,
    lat,
    lng,
    gender,
    pregnant_or_breastfeeding,
    weight_over_50,
    has_chronic_illness,
    illness_details,
    recent_surgery_or_tattoo,
    taking_medication,
    last_donation_date,
    eligibility_status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'blood_group', 'O+'),
    coalesce(new.raw_user_meta_data->>'wilaya', 'Alger'),
    coalesce(new.raw_user_meta_data->>'birth_date', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce((new.raw_user_meta_data->>'is_donor')::boolean, true),
    coalesce((new.raw_user_meta_data->>'lat')::double precision, 36.7538),
    coalesce((new.raw_user_meta_data->>'lng')::double precision, 3.0588),
    coalesce(new.raw_user_meta_data->>'gender', 'male'),
    coalesce((new.raw_user_meta_data->>'pregnant_or_breastfeeding')::boolean, false),
    coalesce((new.raw_user_meta_data->>'weight_over_50')::boolean, true),
    coalesce((new.raw_user_meta_data->>'has_chronic_illness')::boolean, false),
    coalesce(new.raw_user_meta_data->>'illness_details', ''),
    coalesce((new.raw_user_meta_data->>'recent_surgery_or_tattoo')::boolean, false),
    coalesce((new.raw_user_meta_data->>'taking_medication')::boolean, false),
    coalesce(new.raw_user_meta_data->>'last_donation_date', ''),
    coalesce(new.raw_user_meta_data->>'eligibility_status', 'eligible')
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  -- Fail-safe exception handler ensures Supabase Auth user creation never aborts with database error
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
