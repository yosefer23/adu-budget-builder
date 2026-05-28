create table if not exists public.budget_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contract_value numeric not null default 0,
  rows jsonb not null default '[]'::jsonb,
  hidden_columns jsonb not null default '[]'::jsonb,
  expanded jsonb not null default '{}'::jsonb,
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.budget_projects enable row level security;

create policy "Users can read their own budget projects"
on public.budget_projects
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own budget projects"
on public.budget_projects
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own budget projects"
on public.budget_projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own budget projects"
on public.budget_projects
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_budget_projects_updated_at on public.budget_projects;

create trigger set_budget_projects_updated_at
before update on public.budget_projects
for each row
execute function public.set_updated_at();
