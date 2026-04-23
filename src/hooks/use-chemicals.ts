import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Chemical = Tables<"chemicals">;
export type ChemicalInsert = TablesInsert<"chemicals">;
export type ChemicalUpdate = TablesUpdate<"chemicals">;

export function useChemicals() {
  return useQuery({
    queryKey: ["chemicals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chemicals")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateChemical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (chemical: ChemicalInsert) => {
      const { data, error } = await supabase
        .from("chemicals")
        .insert(chemical)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicals"] }),
  });
}

export function useUpdateChemical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ChemicalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("chemicals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicals"] }),
  });
}

export function useDeleteChemical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chemicals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicals"] }),
  });
}

export function useBulkCreateChemicals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (chemicals: ChemicalInsert[]) => {
      const { data, error } = await supabase
        .from("chemicals")
        .insert(chemicals)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicals"] }),
  });
}
