import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbSession {
  id: string;
  created_at: string;
  user_id: string;
  date: string;
  location: string;
  game: string;
  buy_in: number;
  cash_out: number;
  duration: number;
}

export interface DbStakingArrangement {
  id: string;
  created_at: string;
  user_id: string;
  friend: string;
  percent: number;
  active: boolean;
}
