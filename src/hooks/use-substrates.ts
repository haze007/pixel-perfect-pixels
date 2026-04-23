import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Substrate = Tables<"substrates">;

export function useSubstrates() {
  return useQuery({
    queryKey: ["substrates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("substrates")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}
