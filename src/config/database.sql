-- Create sessions table
create table public.sessions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    date date not null,
    location text not null,
    buy_in numeric not null,
    cash_out numeric not null,
    duration numeric not null,
    game text not null,
    notes text
);

-- Create locations table
create table public.locations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    name text not null,
    unique(user_id, name)
);

-- Create staking_arrangements table
create table public.staking_arrangements (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    friend text not null,
    percent numeric not null,
    active boolean default true not null
);

-- Set up Row Level Security (RLS)
alter table public.sessions enable row level security;
alter table public.locations enable row level security;
alter table public.staking_arrangements enable row level security;

-- Create policies
create policy "Users can view their own sessions"
    on public.sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
    on public.sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own locations"
    on public.locations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own locations"
    on public.locations for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own staking arrangements"
    on public.staking_arrangements for select
    using (auth.uid() = user_id);

create policy "Users can insert their own staking arrangements"
    on public.staking_arrangements for insert
    with check (auth.uid() = user_id);

-- Create indexes for better performance
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_date_idx on public.sessions(date);
create index locations_user_id_idx on public.locations(user_id);
create index staking_arrangements_user_id_idx on public.staking_arrangements(user_id); 