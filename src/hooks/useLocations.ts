import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface Location {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLocations(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch locations")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, isLoading, error };
};
