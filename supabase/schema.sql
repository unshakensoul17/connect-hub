-- Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  role text default 'student',
  college_id text,
  department text,
  semester int,
  points int default 0,
  avatar_url text,
  created_at timestamptz default now()
);

-- Access Policies for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Notes Table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  subject text,
  file_url text not null,
  author_id uuid references public.profiles(id) not null,
  tags text[],
  downloads int default 0,
  rating_avg float default 0,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- Access Policies for Notes
alter table public.notes enable row level security;

create policy "Notes are viewable by everyone."
  on notes for select
  using ( true );

create policy "Authenticated users can upload notes."
  on notes for insert
  with check ( auth.uid() = author_id );

create policy "Authors can update own notes."
  on notes for update
  using ( auth.uid() = author_id );

-- Create Questions Table
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  author_id uuid references public.profiles(id) not null,
  tags text[],
  upvotes int default 0,
  is_solved boolean default false,
  created_at timestamptz default now()
);

-- Access Policies for Questions
alter table public.questions enable row level security;

create policy "Everyone can view questions."
  on questions for select
  using ( true );

create policy "Authenticated users can ask questions."
  on questions for insert
  with check ( auth.uid() = author_id );

-- Create Answers Table
create table public.answers (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  question_id uuid references public.questions(id) not null,
  author_id uuid references public.profiles(id) not null,
  upvotes int default 0,
  is_accepted boolean default false,
  created_at timestamptz default now()
);

-- Access Policies for Answers
alter table public.answers enable row level security;

create policy "Everyone can view answers."
  on answers for select
  using ( true );

create policy "Authenticated users can answer."
  on answers for insert
  with check ( auth.uid() = author_id );

create policy "Author can update answer"
  on answers for update
  using ( auth.uid() = author_id );

-- Create Storage Bucket for Notes
insert into storage.buckets (id, name, public) values ('notes-files', 'notes-files', true);

create policy "Notes are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'notes-files' );

create policy "Seniors can upload notes files."
  on storage.objects for insert
  with check ( 
    bucket_id = 'notes-files' and 
    auth.role() = 'authenticated'
  );
