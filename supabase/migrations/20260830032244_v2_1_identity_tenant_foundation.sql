-- CFO OS v2.1
-- Identity, tenant isolation and finance security foundation
--
-- Live Supabase migration:
-- 20260830032244_v2_1_identity_tenant_foundation
--
-- Security model:
-- authenticated identity
--   -> organization membership
--   -> database role
--   -> RLS
--   -> tenant-bound finance data
--
-- Model output never grants database authority.

begin;

-- ============================================================
-- PRIVATE SECURITY SCHEMA
-- ============================================================

create schema if not exists private;

revoke all
on schema private
from public;

grant usage
on schema private
to authenticated;

-- ============================================================
-- ENUMS
-- ============================================================

create type public.organization_role as enum (
  'owner',
  'cfo',
  'controller',
  'accountant',
  'viewer'
);

create type public.finance_record_status as enum (
  'booked',
  'pending',
  'exception'
);

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid
    primary key
    references auth.users(id)
    on delete cascade,

  display_name text
    check (
      display_name is null
      or (
        char_length(btrim(display_name)) >= 1
        and char_length(btrim(display_name)) <= 120
      )
    ),

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

create table public.organizations (
  id uuid
    primary key
    default gen_random_uuid(),

  name text
    not null
    check (
      char_length(btrim(name)) >= 1
      and char_length(btrim(name)) <= 120
    ),

  created_by uuid
    not null
    default auth.uid()
    references auth.users(id)
    on delete restrict,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);

-- ============================================================
-- ORGANIZATION MEMBERSHIP / RBAC
-- ============================================================

create table public.organization_members (
  organization_id uuid
    not null
    references public.organizations(id)
    on delete cascade,

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  role public.organization_role
    not null
    default 'viewer',

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  primary key (
    organization_id,
    user_id
  )
);

-- ============================================================
-- FINANCE ACCOUNTS
-- ============================================================

create table public.finance_accounts (
  id uuid
    primary key
    default gen_random_uuid(),

  organization_id uuid
    not null
    references public.organizations(id)
    on delete restrict,

  name text
    not null
    check (
      char_length(btrim(name)) >= 1
      and char_length(btrim(name)) <= 160
    ),

  account_code text
    check (
      account_code is null
      or char_length(account_code) <= 80
    ),

  account_type text
    not null
    check (
      char_length(btrim(account_type)) >= 1
      and char_length(btrim(account_type)) <= 80
    ),

  currency char(3)
    not null
    default 'USD'
    check (
      currency::text = upper(currency::text)
    ),

  is_active boolean
    not null
    default true,

  created_by uuid
    not null
    default auth.uid()
    references auth.users(id)
    on delete restrict,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  unique (
    organization_id,
    account_code
  ),

  unique (
    id,
    organization_id
  )
);

-- ============================================================
-- FINANCE RECORDS
-- ============================================================

create table public.finance_records (
  id uuid
    primary key
    default gen_random_uuid(),

  organization_id uuid
    not null
    references public.organizations(id)
    on delete restrict,

  account_id uuid
    not null,

  record_date date
    not null,

  amount numeric(18, 2)
    not null,

  currency char(3)
    not null
    default 'USD'
    check (
      currency::text = upper(currency::text)
    ),

  status public.finance_record_status
    not null
    default 'booked',

  source_system text
    not null
    check (
      char_length(btrim(source_system)) >= 1
      and char_length(btrim(source_system)) <= 120
    ),

  source_reference text
    check (
      source_reference is null
      or char_length(source_reference) <= 200
    ),

  description text
    check (
      description is null
      or char_length(description) <= 1000
    ),

  metadata jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(metadata) = 'object'
    ),

  created_by uuid
    not null
    default auth.uid()
    references auth.users(id)
    on delete restrict,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint finance_records_account_tenant_fk
    foreign key (
      account_id,
      organization_id
    )
    references public.finance_accounts (
      id,
      organization_id
    )
    on delete restrict
);

-- ============================================================
-- DURABLE AUDIT FOUNDATION
-- ============================================================

create table public.audit_events (
  id uuid
    primary key
    default gen_random_uuid(),

  sequence bigint
    not null,

  organization_id uuid
    not null
    references public.organizations(id)
    on delete restrict,

  actor_user_id uuid
    references auth.users(id)
    on delete restrict,

  event_type text
    not null
    check (
      char_length(btrim(event_type)) >= 1
      and char_length(btrim(event_type)) <= 120
    ),

  resource_type text
    check (
      resource_type is null
      or char_length(resource_type) <= 120
    ),

  resource_id uuid,

  request_id uuid,

  payload jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(payload) = 'object'
    ),

  previous_hash text,

  event_hash text
    not null
    unique,

  created_at timestamptz
    not null
    default now(),

  unique (
    organization_id,
    sequence
  )
);

-- ============================================================
-- INDEXES
-- ============================================================

create index organization_members_user_idx
  on public.organization_members (
    user_id,
    organization_id
  );

create index finance_accounts_org_idx
  on public.finance_accounts (
    organization_id,
    is_active
  );

create index finance_records_org_date_idx
  on public.finance_records (
    organization_id,
    record_date desc
  );

create index finance_records_account_date_idx
  on public.finance_records (
    account_id,
    record_date desc
  );

create index finance_records_status_idx
  on public.finance_records (
    organization_id,
    status
  );

create index audit_events_org_sequence_idx
  on public.audit_events (
    organization_id,
    sequence desc
  );

create index audit_events_request_idx
  on public.audit_events (
    request_id
  )
  where request_id is not null;

-- ============================================================
-- UPDATED-AT TRIGGER
-- ============================================================

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update
on public.profiles
for each row
execute function private.set_updated_at();

create trigger organizations_set_updated_at
before update
on public.organizations
for each row
execute function private.set_updated_at();

create trigger organization_members_set_updated_at
before update
on public.organization_members
for each row
execute function private.set_updated_at();

create trigger finance_accounts_set_updated_at
before update
on public.finance_accounts
for each row
execute function private.set_updated_at();

create trigger finance_records_set_updated_at
before update
on public.finance_records
for each row
execute function private.set_updated_at();

-- ============================================================
-- TENANT SECURITY HELPERS
-- ============================================================

create or replace function private.is_org_member(
  target_org uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
  );
$$;

create or replace function private.has_org_role(
  target_org uuid,
  allowed_roles public.organization_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
      and om.role = any(allowed_roles)
  );
$$;

revoke all
on function private.is_org_member(uuid)
from public;

grant execute
on function private.is_org_member(uuid)
to authenticated;

revoke all
on function private.has_org_role(
  uuid,
  public.organization_role[]
)
from public;

grant execute
on function private.has_org_role(
  uuid,
  public.organization_role[]
)
to authenticated;

-- ============================================================
-- ORGANIZATION OWNER BOOTSTRAP
-- ============================================================

create or replace function private.bootstrap_organization_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is distinct from auth.uid() then
    raise exception
      'organization creator must match authenticated user';
  end if;

  insert into public.organization_members (
    organization_id,
    user_id,
    role
  )
  values (
    new.id,
    new.created_by,
    'owner'::public.organization_role
  );

  return new;
end;
$$;

create trigger organizations_bootstrap_owner
after insert
on public.organizations
for each row
execute function private.bootstrap_organization_owner();

-- ============================================================
-- APPEND-ONLY AUDIT PROTECTION
-- ============================================================

create or replace function private.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'audit events are append-only';
end;
$$;

create trigger audit_events_no_update
before update
on public.audit_events
for each row
execute function private.prevent_audit_mutation();

create trigger audit_events_no_delete
before delete
on public.audit_events
for each row
execute function private.prevent_audit_mutation();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
  enable row level security;

alter table public.profiles
  force row level security;

alter table public.organizations
  enable row level security;

alter table public.organizations
  force row level security;

alter table public.organization_members
  enable row level security;

alter table public.organization_members
  force row level security;

alter table public.finance_accounts
  enable row level security;

alter table public.finance_accounts
  force row level security;

alter table public.finance_records
  enable row level security;

alter table public.finance_records
  force row level security;

alter table public.audit_events
  enable row level security;

alter table public.audit_events
  force row level security;

-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

-- ============================================================
-- ORGANIZATION POLICIES
-- ============================================================

create policy organizations_select_member
on public.organizations
for select
to authenticated
using (
  private.is_org_member(id)
);

create policy organizations_insert_self
on public.organizations
for insert
to authenticated
with check (
  created_by = auth.uid()
);

create policy organizations_update_owner
on public.organizations
for update
to authenticated
using (
  private.has_org_role(
    id,
    array[
      'owner'::public.organization_role
    ]
  )
)
with check (
  private.has_org_role(
    id,
    array[
      'owner'::public.organization_role
    ]
  )
  and created_by = (
    select o.created_by
    from public.organizations o
    where o.id = organizations.id
  )
);

create policy organizations_delete_owner
on public.organizations
for delete
to authenticated
using (
  private.has_org_role(
    id,
    array[
      'owner'::public.organization_role
    ]
  )
);

-- ============================================================
-- MEMBERSHIP POLICIES
-- ============================================================

create policy organization_members_select_member
on public.organization_members
for select
to authenticated
using (
  private.is_org_member(
    organization_id
  )
);

create policy organization_members_insert_owner
on public.organization_members
for insert
to authenticated
with check (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role
    ]
  )
);

create policy organization_members_update_owner
on public.organization_members
for update
to authenticated
using (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role
    ]
  )
)
with check (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role
    ]
  )
);

create policy organization_members_delete_owner
on public.organization_members
for delete
to authenticated
using (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role
    ]
  )
  and user_id <> auth.uid()
);

-- ============================================================
-- FINANCE ACCOUNT POLICIES
-- ============================================================

create policy finance_accounts_select_member
on public.finance_accounts
for select
to authenticated
using (
  private.is_org_member(
    organization_id
  )
);

create policy finance_accounts_insert_finance
on public.finance_accounts
for insert
to authenticated
with check (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role,
      'accountant'::public.organization_role
    ]
  )
  and created_by = auth.uid()
);

create policy finance_accounts_update_finance
on public.finance_accounts
for update
to authenticated
using (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role,
      'accountant'::public.organization_role
    ]
  )
)
with check (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role,
      'accountant'::public.organization_role
    ]
  )
);

create policy finance_accounts_delete_controller
on public.finance_accounts
for delete
to authenticated
using (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role
    ]
  )
);

-- ============================================================
-- FINANCE RECORD POLICIES
-- ============================================================

create policy finance_records_select_member
on public.finance_records
for select
to authenticated
using (
  private.is_org_member(
    organization_id
  )
);

create policy finance_records_insert_finance
on public.finance_records
for insert
to authenticated
with check (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role,
      'accountant'::public.organization_role
    ]
  )
  and created_by = auth.uid()
);

create policy finance_records_update_finance
on public.finance_records
for update
to authenticated
using (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role,
      'accountant'::public.organization_role
    ]
  )
)
with check (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role,
      'accountant'::public.organization_role
    ]
  )
);

create policy finance_records_delete_controller
on public.finance_records
for delete
to authenticated
using (
  private.has_org_role(
    organization_id,
    array[
      'owner'::public.organization_role,
      'cfo'::public.organization_role,
      'controller'::public.organization_role
    ]
  )
);

-- ============================================================
-- AUDIT POLICIES
-- ============================================================

-- Authenticated organization members may read their own
-- organization's audit evidence.
--
-- There is intentionally NO authenticated INSERT, UPDATE,
-- or DELETE policy.
--
-- Trusted server code will later append audit records.

create policy audit_events_select_member
on public.audit_events
for select
to authenticated
using (
  private.is_org_member(
    organization_id
  )
);

commit;