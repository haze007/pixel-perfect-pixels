
# TannerySim — Sprint 1: Foundation

Build the foundational layer: dark-themed app shell, authentication, Supabase database schema, and a basic 3D leather swatch viewer.

---

## 1. Design System Setup
- Replace the default light theme with TannerySim's dark palette (background `#0A0A0B`, surfaces `#111113`/`#1A1A1D`, accent purple `#7B5EA7`, text `#F2F2F3`)
- Configure Inter as the body font and JetBrains Mono as the monospace font
- Install Solar Duotone icon pack (`@solar-icons/react`)
- Set up all CSS custom properties from the PRD's design tokens

## 2. Database Schema (Supabase)
- Create all tables from the PRD: `tanneries`, `user_profiles`, `chemicals`, `substrates`, `recipes`, `calibrations`, `models_3d`, `catalogue_imports`, `llm_logs`, `collections`, `collection_recipes`
- Create a proper `user_roles` table (not roles on profiles — security requirement)
- Set up Row Level Security on all tables with tannery-scoped policies
- Seed 10 default substrates (goat chrome, cow veg, etc.)
- Create database trigger to auto-create user profile on signup

## 3. Authentication Flow
- Sign up page (email + password, tannery name creation)
- Sign in page (email + password)
- Password reset flow with `/reset-password` page
- Auth guard on protected routes using `_authenticated` layout
- Redirect to app shell after login

## 4. App Shell Layout
- **TopBar** (48px fixed): Logo, tannery name, LLM selector placeholder, user avatar dropdown
- **LeftSidebar** (240px, collapsible): Navigation with Solar Duotone icons — Dashboard, Recipe Library, My Catalogue, Community Catalogue, Calibration, Settings
- **MainCanvas** (flex-1): Primary content area where the 3D viewer will live
- **RightPanel** (320px, collapsible): Context-sensitive panel (simulation results, etc.)
- All panels styled with the dark theme surfaces and borders

## 5. Basic 3D Leather Viewer
- Install Three.js and mount a canvas in the MainCanvas area
- Load a simple flat leather swatch geometry (procedural quad or basic GLTF)
- Apply `MeshPhysicalMaterial` with configurable color from LAB input
- Install `culori` for LAB→RGB conversion
- Add one HDRI environment map for realistic lighting
- Orbit controls for rotating/zooming the swatch
- Simple color input (L*, a*, b* sliders) to test the pipeline — changing values updates the swatch in real-time

## 6. Route Structure
- `/` — Landing/marketing page (or redirect to dashboard if authenticated)
- `/login` — Sign in
- `/signup` — Sign up
- `/reset-password` — Password reset
- `/_authenticated/dashboard` — Dashboard (placeholder for Sprint 2+)
- `/_authenticated/recipes` — Recipe library (placeholder)
- `/_authenticated/catalogue` — Chemical catalogue (placeholder)
- `/_authenticated/studio` — Recipe studio with 3D viewer

---

**Deliverable**: A logged-in user sees the dark-themed app shell with a rotating leather swatch. They can adjust L*a*b* sliders and watch the swatch color change in real-time.

*After this sprint, we'll proceed to Sprint 2 (Catalogue Engine) and continue through the full PRD.*
