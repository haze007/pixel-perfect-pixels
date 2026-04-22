
CREATE POLICY "Allow profile insert" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Allow tannery insert" ON public.tanneries
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Allow role insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
