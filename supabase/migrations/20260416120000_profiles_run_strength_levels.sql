-- Niveaus 1 (licht) t/m 3 (zwaar) voor gepersonaliseerde trainingsinhoud
alter table public.profiles
  add column if not exists run_level smallint check (run_level is null or run_level between 1 and 3),
  add column if not exists strength_level smallint check (strength_level is null or strength_level between 1 and 3);

comment on column public.profiles.run_level is '1=beginner loop, 2=gemiddeld, 3=sterk loopvolume/tempo';
comment on column public.profiles.strength_level is '1=beginner kracht, 2=gemiddeld, 3=meer volume/intensiteit kracht';
