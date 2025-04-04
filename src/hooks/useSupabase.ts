import { useState, useEffect } from "react";
import {
  supabase,
  DbSession,
  DbLocation,
  DbStakingArrangement,
} from "../lib/supabase";

interface AddSessionParams {
  date: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  buy_in: number;
  cash_out: number;
  duration: number;
  game: string;
  notes?: string;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("sessions")
        .select("*")
        .order("date", { ascending: false });

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (sessionData: AddSessionParams) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: insertError } = await supabase
        .from("sessions")
        .insert([{ ...sessionData, user_id: userData.user.id }]);

      if (insertError) throw insertError;
      await fetchSessions();
    } catch (err) {
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (deleteError) throw deleteError;
      await fetchSessions();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    addSession,
    deleteSession,
    refreshSessions: fetchSessions,
  };
};

export const useLocations = () => {
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (name: string) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("locations")
        .insert([{ name, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      setLocations((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  return { locations, loading, error, fetchLocations, addLocation };
};

export const useStakingArrangements = () => {
  const [arrangements, setArrangements] = useState<DbStakingArrangement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArrangements();
  }, []);

  const fetchArrangements = async () => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("staking_arrangements")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArrangements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addArrangement = async (
    arrangement: Omit<DbStakingArrangement, "id" | "created_at" | "user_id">
  ) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("staking_arrangements")
        .insert([{ ...arrangement, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      setArrangements((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteStakingArrangement = async (id: string) => {
    try {
      const { error } = await supabase
        .from("staking_arrangements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setArrangements((prev) => prev.filter((arr) => arr.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const toggleArrangementStatus = async (id: string, active: boolean) => {
    try {
      const { data, error } = await supabase
        .from("staking_arrangements")
        .update({ active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setArrangements((prev) =>
        prev.map((arr) => (arr.id === id ? data : arr))
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  return {
    arrangements,
    loading,
    error,
    fetchArrangements,
    addArrangement,
    deleteStakingArrangement,
    toggleArrangementStatus,
  };
};
