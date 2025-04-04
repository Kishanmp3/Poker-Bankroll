import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { DbSession, DbStakingArrangement } from "../lib/supabase";

export const useSessions = () => {
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (
    session: Omit<DbSession, "id" | "created_at" | "user_id">
  ) => {
    try {
      const { error } = await supabase.from("sessions").insert([session]);
      if (error) throw error;
      await fetchSessions();
    } catch (err) {
      throw err;
    }
  };

  return { sessions, loading, error, addSession };
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
      const { data, error } = await supabase
        .from("staking_arrangements")
        .select("*")
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
      const { error } = await supabase
        .from("staking_arrangements")
        .insert([arrangement]);
      if (error) throw error;
      await fetchArrangements();
    } catch (err) {
      throw err;
    }
  };

  const toggleArrangementStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("staking_arrangements")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
      await fetchArrangements();
    } catch (err) {
      throw err;
    }
  };

  return {
    arrangements,
    loading,
    error,
    addArrangement,
    toggleArrangementStatus,
  };
};
