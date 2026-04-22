import { supabase } from "@/integrations/supabase/client";

export async function signUp(email: string, password: string, fullName: string, tanneryName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Signup failed");

  const slug = tanneryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { data: tannery, error: tErr } = await supabase
    .from("tanneries")
    .insert({ name: tanneryName, slug, owner_id: authData.user.id })
    .select("id")
    .single();

  if (tErr) throw tErr;

  await supabase.from("user_roles").insert({
    user_id: authData.user.id,
    tannery_id: tannery.id,
    role: "admin",
  });

  await supabase.from("user_profiles").update({ tannery_id: tannery.id }).eq("id", authData.user.id);

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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
