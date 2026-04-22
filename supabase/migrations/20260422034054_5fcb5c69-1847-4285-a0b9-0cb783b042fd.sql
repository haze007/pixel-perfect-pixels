
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'viewer');
CREATE TYPE public.chemical_category AS ENUM ('dye','fatliquor','retanning_agent','surfactant','acid','base','fixing_agent','other');
CREATE TYPE public.substrate_type AS ENUM ('bovine','ovine','caprine','exotic','synthetic');

-- Tanneries
CREATE TABLE public.tanneries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tanneries ENABLE ROW LEVEL SECURITY;

-- User roles (separate table per security requirement)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'operator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tannery_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _tannery_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND tannery_id = _tannery_id AND role = _role
  )
$$;

-- Helper: get user's tannery_id
CREATE OR REPLACE FUNCTION public.get_user_tannery_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tannery_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- User profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Chemicals
CREATE TABLE public.chemicals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  supplier TEXT,
  category chemical_category NOT NULL DEFAULT 'other',
  colour_index TEXT,
  lab_l REAL, lab_a REAL, lab_b REAL,
  properties JSONB DEFAULT '{}',
  is_community BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chemicals ENABLE ROW LEVEL SECURITY;

-- Substrates
CREATE TABLE public.substrates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type substrate_type NOT NULL,
  base_lab_l REAL NOT NULL DEFAULT 70,
  base_lab_a REAL NOT NULL DEFAULT 0,
  base_lab_b REAL NOT NULL DEFAULT 10,
  roughness REAL NOT NULL DEFAULT 0.6,
  thickness_mm REAL NOT NULL DEFAULT 1.2,
  is_default BOOLEAN DEFAULT FALSE,
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrates ENABLE ROW LEVEL SECURITY;

-- Recipes
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  substrate_id UUID REFERENCES public.substrates(id),
  steps JSONB DEFAULT '[]',
  target_lab_l REAL, target_lab_a REAL, target_lab_b REAL,
  predicted_lab_l REAL, predicted_lab_a REAL, predicted_lab_b REAL,
  delta_e REAL,
  status TEXT DEFAULT 'draft',
  version INT DEFAULT 1,
  parent_id UUID REFERENCES public.recipes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Calibrations
CREATE TABLE public.calibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  chemical_id UUID REFERENCES public.chemicals(id) ON DELETE CASCADE NOT NULL,
  substrate_id UUID REFERENCES public.substrates(id),
  measured_lab_l REAL NOT NULL,
  measured_lab_a REAL NOT NULL,
  measured_lab_b REAL NOT NULL,
  concentration REAL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calibrations ENABLE ROW LEVEL SECURITY;

-- 3D Models
CREATE TABLE public.models_3d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;

-- Catalogue imports
CREATE TABLE public.catalogue_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  row_count INT DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.catalogue_imports ENABLE ROW LEVEL SECURITY;

-- LLM logs
CREATE TABLE public.llm_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  model TEXT,
  tokens_used INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.llm_logs ENABLE ROW LEVEL SECURITY;

-- Collections
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tannery_id UUID REFERENCES public.tanneries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Collection recipes
CREATE TABLE public.collection_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE(collection_id, recipe_id)
);
ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (tannery-scoped)
-- Tanneries: members can read their own tannery
CREATE POLICY "Users can read own tannery" ON public.tanneries
  FOR SELECT TO authenticated
  USING (id = public.get_user_tannery_id(auth.uid()));

-- User roles: users can read their own role
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- User profiles: users can read/update own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Chemicals: tannery members can CRUD
CREATE POLICY "Tannery members can read chemicals" ON public.chemicals
  FOR SELECT TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()) OR is_community = TRUE);
CREATE POLICY "Tannery members can insert chemicals" ON public.chemicals
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Tannery members can update chemicals" ON public.chemicals
  FOR UPDATE TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Tannery members can delete chemicals" ON public.chemicals
  FOR DELETE TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));

-- Substrates: tannery members + defaults
CREATE POLICY "Read substrates" ON public.substrates
  FOR SELECT TO authenticated
  USING (is_default = TRUE OR tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Insert substrates" ON public.substrates
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));

-- Recipes: tannery-scoped
CREATE POLICY "Tannery members can read recipes" ON public.recipes
  FOR SELECT TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Tannery members can insert recipes" ON public.recipes
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Tannery members can update recipes" ON public.recipes
  FOR UPDATE TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Tannery members can delete recipes" ON public.recipes
  FOR DELETE TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));

-- Calibrations: tannery-scoped
CREATE POLICY "Read calibrations" ON public.calibrations
  FOR SELECT TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Insert calibrations" ON public.calibrations
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));

-- Models: tannery + defaults
CREATE POLICY "Read models" ON public.models_3d
  FOR SELECT TO authenticated
  USING (is_default = TRUE OR tannery_id = public.get_user_tannery_id(auth.uid()));

-- Catalogue imports: tannery-scoped
CREATE POLICY "Read imports" ON public.catalogue_imports
  FOR SELECT TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Insert imports" ON public.catalogue_imports
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));

-- LLM logs: tannery-scoped
CREATE POLICY "Read llm logs" ON public.llm_logs
  FOR SELECT TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Insert llm logs" ON public.llm_logs
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));

-- Collections: tannery-scoped
CREATE POLICY "Read collections" ON public.collections
  FOR SELECT TO authenticated
  USING (tannery_id = public.get_user_tannery_id(auth.uid()));
CREATE POLICY "Insert collections" ON public.collections
  FOR INSERT TO authenticated
  WITH CHECK (tannery_id = public.get_user_tannery_id(auth.uid()));

-- Collection recipes: via collection's tannery
CREATE POLICY "Read collection recipes" ON public.collection_recipes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_id AND c.tannery_id = public.get_user_tannery_id(auth.uid())
  ));
CREATE POLICY "Insert collection recipes" ON public.collection_recipes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_id AND c.tannery_id = public.get_user_tannery_id(auth.uid())
  ));

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default substrates
INSERT INTO public.substrates (name, type, base_lab_l, base_lab_a, base_lab_b, roughness, thickness_mm, is_default) VALUES
  ('Goat Chrome', 'caprine', 75, -1, 8, 0.45, 0.8, TRUE),
  ('Goat Veg-Tan', 'caprine', 68, 2, 15, 0.55, 0.9, TRUE),
  ('Cow Chrome', 'bovine', 72, -2, 6, 0.5, 1.4, TRUE),
  ('Cow Veg-Tan', 'bovine', 65, 3, 18, 0.65, 1.6, TRUE),
  ('Sheep Chrome', 'ovine', 78, -1, 5, 0.4, 0.7, TRUE),
  ('Sheep Veg-Tan', 'ovine', 70, 1, 12, 0.5, 0.8, TRUE),
  ('Buffalo Chrome', 'bovine', 60, 0, 10, 0.7, 2.0, TRUE),
  ('Calf Chrome', 'bovine', 76, -1, 7, 0.42, 1.0, TRUE),
  ('Ostrich', 'exotic', 72, 0, 9, 0.55, 1.1, TRUE),
  ('Crocodile', 'exotic', 68, 1, 11, 0.6, 1.3, TRUE);
