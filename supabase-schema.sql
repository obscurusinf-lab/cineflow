-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Profiles are viewable by authenticated users" on profiles for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure handle_new_user();

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('film','series','commercial','clip')),
  status text not null default 'pre_production' check (status in ('pre_production','production','post_production','completed')),
  start_date date,
  production_company text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table projects enable row level security;

-- Project members
create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null check (role in ('admin','director','cinematographer','script_supervisor','costume','makeup','props','lighting')),
  created_at timestamptz default now(),
  unique(project_id, user_id)
);
alter table project_members enable row level security;

-- RLS: project access via membership
create policy "Members can view projects" on projects for select using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid())
  or created_by = auth.uid()
);
create policy "Admins can manage projects" on projects for all using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid() and role = 'admin')
  or created_by = auth.uid()
);
create policy "Members can view memberships" on project_members for select using (
  exists (select 1 from project_members pm2 where pm2.project_id = project_members.project_id and pm2.user_id = auth.uid())
);
create policy "Admins can manage members" on project_members for all using (
  exists (select 1 from project_members where project_id = project_members.project_id and user_id = auth.uid() and role = 'admin')
);

-- Scenes
create table scenes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  scene_number text not null,
  subscene text,
  title text,
  description text,
  game_day integer,
  game_date date,
  shoot_day integer,
  location text,
  interior_exterior text check (interior_exterior in ('interior','exterior')),
  day_night text check (day_night in ('day','night')),
  status text not null default 'not_shot' check (status in ('not_shot','shot')),
  chronological_order integer not null default 0,
  duration interval,
  comments text,
  created_at timestamptz default now()
);
alter table scenes enable row level security;
create policy "Project members can view scenes" on scenes for select using (
  exists (select 1 from project_members where project_id = scenes.project_id and user_id = auth.uid())
);
create policy "Script supervisors and admins can manage scenes" on scenes for all using (
  exists (select 1 from project_members where project_id = scenes.project_id and user_id = auth.uid() and role in ('admin','script_supervisor','director'))
);

-- Stills
create table stills (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references scenes(id) on delete cascade,
  url text not null,
  description text,
  angle text,
  timecode text,
  comment text,
  is_key boolean default false,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table stills enable row level security;
create policy "Members can view stills" on stills for select using (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = stills.scene_id and pm.user_id = auth.uid()
  )
);
create policy "Members can upload stills" on stills for insert with check (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = stills.scene_id and pm.user_id = auth.uid()
  )
);
create policy "Uploader or admin can delete stills" on stills for delete using (
  uploaded_by = auth.uid()
);

-- Tags
create table tags (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  type text not null check (type in ('character','costume','makeup','props','location')),
  name text not null,
  created_at timestamptz default now(),
  unique(project_id, type, name)
);
alter table tags enable row level security;
create policy "Members can view tags" on tags for select using (
  exists (select 1 from project_members where project_id = tags.project_id and user_id = auth.uid())
);
create policy "Members can manage tags" on tags for all using (
  exists (select 1 from project_members where project_id = tags.project_id and user_id = auth.uid())
);

-- Scene-tag relations
create table scene_tags (
  scene_id uuid references scenes(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (scene_id, tag_id)
);
alter table scene_tags enable row level security;
create policy "Members can view scene tags" on scene_tags for select using (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = scene_tags.scene_id and pm.user_id = auth.uid()
  )
);
create policy "Members can manage scene tags" on scene_tags for all using (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = scene_tags.scene_id and pm.user_id = auth.uid()
  )
);

-- Camera data
create table camera_data (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references scenes(id) on delete cascade unique,
  camera text,
  lens text,
  focal_length text,
  aperture text,
  iso text,
  fps text,
  white_balance text,
  lut text,
  filters text,
  camera_height text,
  camera_movement text
);
alter table camera_data enable row level security;
create policy "Members can view camera data" on camera_data for select using (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = camera_data.scene_id and pm.user_id = auth.uid()
  )
);
create policy "Members can manage camera data" on camera_data for all using (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = camera_data.scene_id and pm.user_id = auth.uid()
  )
);

-- Comments
create table comments (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references scenes(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  text text not null,
  created_at timestamptz default now()
);
alter table comments enable row level security;
create policy "Members can view comments" on comments for select using (
  exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = comments.scene_id and pm.user_id = auth.uid()
  )
);
create policy "Members can add comments" on comments for insert with check (
  user_id = auth.uid() and exists (
    select 1 from scenes s
    join project_members pm on pm.project_id = s.project_id
    where s.id = comments.scene_id and pm.user_id = auth.uid()
  )
);
create policy "Author can delete own comments" on comments for delete using (user_id = auth.uid());

-- Storage bucket for stills
insert into storage.buckets (id, name, public) values ('stills', 'stills', true);
create policy "Members can upload stills" on storage.objects for insert with check (bucket_id = 'stills' and auth.role() = 'authenticated');
create policy "Stills are publicly readable" on storage.objects for select using (bucket_id = 'stills');
create policy "Uploader can delete own stills" on storage.objects for delete using (bucket_id = 'stills' and auth.uid()::text = (storage.foldername(name))[1]);
