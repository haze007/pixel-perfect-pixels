
CREATE OR REPLACE FUNCTION public.provision_tannery(p_name text, p_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tannery_id uuid;
  v_existing uuid;
BEGIN
  -- Check if user already has a tannery
  SELECT tannery_id INTO v_existing FROM public.user_roles WHERE user_id = v_user_id LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Create tannery
  INSERT INTO public.tanneries (name, slug, owner_id)
  VALUES (p_name, p_slug, v_user_id)
  RETURNING id INTO v_tannery_id;

  -- Create admin role
  INSERT INTO public.user_roles (user_id, tannery_id, role)
  VALUES (v_user_id, v_tannery_id, 'admin');

  -- Link profile
  UPDATE public.user_profiles SET tannery_id = v_tannery_id WHERE id = v_user_id;

  RETURN v_tannery_id;
END;
$$;
