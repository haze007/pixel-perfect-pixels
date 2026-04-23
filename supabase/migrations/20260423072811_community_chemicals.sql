-- Create a system tannery for community/preset chemicals
INSERT INTO public.tanneries (id, name, slug, owner_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'Community Library', 'community', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed community chemicals with Lab* colour data
-- Categories: dye, fatliquor, retanning_agent, surfactant, acid, base, fixing_agent, other
INSERT INTO public.chemicals (tannery_id, name, supplier, category, colour_index, lab_l, lab_a, lab_b, is_community) VALUES

-- Dyes
('00000000-0000-0000-0000-000000000001', 'Black TF Syntan Dye',       'Clariant',  'dye', 'CI Direct Black 22',   12.0,   0.5,   0.8,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Navy Blue BN Dye',          'BASF',      'dye', 'CI Acid Blue 113',     18.0,   2.5, -18.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Brown OB Dye',              'Lanxess',   'dye', 'CI Direct Brown 44',   38.0,   9.5,  22.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Tan RL Dye',                'Clariant',  'dye', 'CI Acid Orange 116',   58.0,  11.0,  32.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Burgundy R Dye',            'BASF',      'dye', 'CI Acid Red 361',      25.0,  28.0,  10.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Forest Green GN Dye',       'Lanxess',   'dye', 'CI Direct Green 28',   35.0, -18.0,  14.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Caramel BN Dye',            'Clariant',  'dye', 'CI Direct Orange 39',  52.0,  15.0,  38.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Cobalt Blue RS Dye',        'BASF',      'dye', 'CI Acid Blue 45',      28.0,   5.0, -30.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Olive Green MT Dye',        'Lanxess',   'dye', 'CI Acid Yellow 49',    48.0,  -5.0,  18.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Russet Red R Dye',          'Clariant',  'dye', 'CI Acid Red 97',       35.0,  32.0,  22.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Ivory White NF Dye',        'BASF',      'dye', 'CI Direct Yellow 50',  88.0,   0.5,  10.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Charcoal Grey BL Dye',      'Lanxess',   'dye', 'CI Acid Black 172',    28.0,   0.2,  -0.5,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Cognac RL Dye',             'Clariant',  'dye', 'CI Acid Brown 75',     45.0,  16.0,  26.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Mustard Yellow GR Dye',     'BASF',      'dye', 'CI Acid Yellow 36',    68.0,   8.0,  45.0,  TRUE),
('00000000-0000-0000-0000-000000000001', 'Bottle Green BN Dye',       'Lanxess',   'dye', 'CI Direct Green 59',   30.0, -20.0,   8.0,  TRUE),

-- Fatliquors
('00000000-0000-0000-0000-000000000001', 'Lipoderm LQF (Sulphited)',  'BASF',      'fatliquor', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Melio SR (Synthetic)',      'Clariant',  'fatliquor', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Densodrin OL (Neatsfoot)',  'Lanxess',   'fatliquor', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Lipsol BM (Blown oil)',     'Stahl',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Truposol GL (Lecithin)',    'TFL',       'fatliquor', NULL, NULL, NULL, NULL, TRUE),

-- Retanning agents
('00000000-0000-0000-0000-000000000001', 'Retanal WB (Syntan)',       'Lanxess',   'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Relugan GT-50 (Glutar.)',   'BASF',      'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Sellatan W (Veg. extract)', 'Lanxess',   'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Chromosal B (Chrome)',      'Lanxess',   'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Tanigan CF (Mimosa)',       'Lanxess',   'retanning_agent', NULL, NULL, NULL, NULL, TRUE),

-- Surfactants
('00000000-0000-0000-0000-000000000001', 'Erional NW (Anionic)',      'Huntsman',  'surfactant', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Avolan IS (Levelling)',     'Lanxess',   'surfactant', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Albigen A (Dispersing)',    'BASF',      'surfactant', NULL, NULL, NULL, NULL, TRUE),

-- Acids / Bases
('00000000-0000-0000-0000-000000000001', 'Formic Acid 85%',           'Generic',   'acid',  NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Sulphuric Acid 98%',        'Generic',   'acid',  NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Sodium Formate',            'Generic',   'base',  NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Sodium Bicarbonate',        'Generic',   'base',  NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Ammonia 25%',               'Generic',   'base',  NULL, NULL, NULL, NULL, TRUE),

-- Fixing agents
('00000000-0000-0000-0000-000000000001', 'Fixogen LS (Dye fixative)', 'Clariant',  'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Leucophor BS (OBA)',        'Clariant',  'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
('00000000-0000-0000-0000-000000000001', 'Baykanol PQ (Cationic)',    'Lanxess',   'fixing_agent', NULL, NULL, NULL, NULL, TRUE)

ON CONFLICT DO NOTHING;
