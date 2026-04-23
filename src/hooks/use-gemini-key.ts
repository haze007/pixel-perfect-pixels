import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

/**
 * Read and persist the Gemini / Imagen 3 API key via Supabase Auth user metadata.
 * The key is stored encrypted at rest by Supabase — never written to any table.
 */
export function useGeminiKey() {
  const { user } = useAuth();
  const key = (user?.user_metadata?.gemini_api_key as string | undefined) ?? "";

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const save = async (newKey: string): Promise<boolean> => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({
      data: { gemini_api_key: newKey.trim() },
    });
    setSaving(false);
    if (err) { setError(err.message); return false; }
    return true;
  };

  return { key, save, saving, error };
}
