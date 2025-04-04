import { createClient } from "@supabase/supabase-js";
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env";

// Initialize the Supabase client
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbSession {
  id: string;
  created_at: string;
  user_id: string;
  date: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  buy_in: number;
  cash_out: number;
  duration: number;
  game: string;
  notes?: string;
}

export interface DbLocation {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
}

export interface DbStakingArrangement {
  id: string;
  created_at: string;
  user_id: string;
  friend: string;
  percent: number;
  active: boolean;
}
