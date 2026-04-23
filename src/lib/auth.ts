import { supabase } from "@/integrations/supabase/client";

export async function signUp(email: string, password: string, fullName: string, tanneryName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, tannery_name: tanneryName },
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Signup failed");

  return authData;
}

/** Call after login to ensure the user has a tannery provisioned */
export async function ensureTannery() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if already provisioned
  const { data: existingId } = await supabase.rpc("get_user_tannery_id", { _user_id: user.id });
  if (existingId) return;

  // Provision from metadata
  const tanneryName = user.user_metadata?.tannery_name;
  if (!tanneryName) return;

  const slug = tanneryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await supabase.rpc("provision_tannery", { p_name: tanneryName, p_slug: slug });
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Provision tannery on first login after email confirmation
  await ensureTannery();

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
