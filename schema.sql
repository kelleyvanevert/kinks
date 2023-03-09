-- schema

drop table if exists entries;

create table entries(
  uuid uuid primary key default gen_random_uuid(),
  group_code varchar not null,
  code varchar not null,
  kink varchar not null,
  interest int not null check (interest >= 0 and interest <= 100),
  taboo int not null check (taboo >= 0 and taboo <= 100),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  unique (group_code, code, kink)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger entry_modified_at before update on entries for each row execute procedure set_updated_at();


-- fixtures

insert into entries(group_code, code, kink, interest, taboo) values
('test', 'manca', 'test', 5, 12),
('musicz', 'kelley', 'cunnilingus', 90, 10),
('musicz', 'anonypuss', 'light bondage (giving)', 20, 20),
('musicz', 'kelley', 'light bondage (giving)', 52, 17),
('musicz', 'anonypuss', 'cheating', 20, 62)
on conflict (group_code, code, kink) do update set
  interest = excluded.interest,
  taboo = excluded.taboo
returning *;
