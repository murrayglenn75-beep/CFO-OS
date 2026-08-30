-- CFO OS v2.1
-- Least-privilege table grants
--
-- RLS controls row access, while these grants constrain
-- which SQL operations browser-facing roles can attempt.

begin;

revoke all privileges on table
  public.profiles,
  public.organizations,
  public.organization_members,
  public.finance_accounts,
  public.finance_records,
  public.audit_events
from anon;

revoke all privileges on table
  public.profiles,
  public.organizations,
  public.organization_members,
  public.finance_accounts,
  public.finance_records,
  public.audit_events
from authenticated;

grant select, insert, update
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table public.organizations
to authenticated;

grant select, insert, update, delete
on table public.organization_members
to authenticated;

grant select, insert, update, delete
on table public.finance_accounts
to authenticated;

grant select, insert, update, delete
on table public.finance_records
to authenticated;

grant select
on table public.audit_events
to authenticated;

commit;