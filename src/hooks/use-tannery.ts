import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTanneryId() {
  return useQuery({
    queryKey: ["tannery-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("get_user_tannery_id", { _user_id: user.id });
      if (error) throw error;
      return data as string;
    },
    staleTime: Infinity,
  });
}

export function useTannery() {
  const { data: tanneryId } = useTanneryId();
  return useQuery({
    queryKey: ["tannery", tanneryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tanneries")
        .select("*")
        .eq("id", tanneryId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tanneryId,
  });
}
