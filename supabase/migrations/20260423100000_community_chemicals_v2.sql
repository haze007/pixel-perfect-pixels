-- =============================================================================
-- Community Chemicals v2 — full production catalogue (150+ entries)
-- Also creates seed_community_chemicals() RPC callable from the app UI
-- =============================================================================

-- Ensure community tannery exists
INSERT INTO public.tanneries (id, name, slug, owner_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'Community Library', 'community', NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- RPC: seed_community_chemicals()
-- SECURITY DEFINER lets authenticated users trigger seeding without needing
-- write access to the community tannery row directly.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.seed_community_chemicals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted INTEGER;
BEGIN
  WITH ins AS (
    INSERT INTO public.chemicals
      (tannery_id, name, supplier, category, colour_index, lab_l, lab_a, lab_b, is_community)
    VALUES

    -- =========================================================
    -- DYES — Blacks & Dark Neutrals
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Derma Black NR',          'Clariant',  'dye','CI Direct Black 22',    9.0,   0.5,   0.8, TRUE),
    ('00000000-0000-0000-0000-000000000001','Jet Black BL Conc.',      'BASF',      'dye','CI Acid Black 52',      7.5,   0.3,  -0.5, TRUE),
    ('00000000-0000-0000-0000-000000000001','Carbon Black TF',         'Lanxess',   'dye','CI Acid Black 210',    10.0,   0.2,   0.4, TRUE),
    ('00000000-0000-0000-0000-000000000001','Graphite Grey BN',        'Clariant',  'dye','CI Acid Black 172',    22.0,   0.1,  -0.3, TRUE),
    ('00000000-0000-0000-0000-000000000001','Charcoal Dark BL',        'BASF',      'dye','CI Direct Black 168',  18.0,   0.4,   0.6, TRUE),
    ('00000000-0000-0000-0000-000000000001','Slate Grey NW',           'Lanxess',   'dye','CI Acid Black 60',     32.0,  -0.5,  -1.2, TRUE),
    ('00000000-0000-0000-0000-000000000001','Ink Black RL',            'Huntsman',  'dye','CI Direct Black 80',    8.0,   1.0,   1.5, TRUE),
    ('00000000-0000-0000-0000-000000000001','Warm Black BM',           'Stahl',     'dye','CI Acid Black 194',    11.0,   1.8,   2.2, TRUE),

    -- =========================================================
    -- DYES — Blues
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Navy Blue BN',            'BASF',      'dye','CI Acid Blue 113',     17.0,   2.5, -18.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Cobalt Blue RS',          'Clariant',  'dye','CI Acid Blue 45',      26.0,   5.0, -30.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Royal Blue BRN',          'Lanxess',   'dye','CI Acid Blue 40',      22.0,   8.5, -32.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Denim Blue RL',           'BASF',      'dye','CI Reactive Blue 19',  34.0,  -2.0, -22.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sky Blue NF',             'Clariant',  'dye','CI Acid Blue 74',      52.0,  -5.0, -28.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Teal BL Conc.',           'Huntsman',  'dye','CI Direct Blue 86',    38.0, -10.0, -18.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Petrol Blue GN',          'Stahl',     'dye','CI Acid Blue 158',     30.0,  -4.0, -20.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Indigo Navy BL',          'Lanxess',   'dye','CI Vat Blue 1',        20.0,   1.5, -24.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Steel Blue MW',           'BASF',      'dye','CI Acid Blue 185',     40.0,  -1.0, -14.0, TRUE),

    -- =========================================================
    -- DYES — Reds, Pinks & Burgundy
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Burgundy R Conc.',        'BASF',      'dye','CI Acid Red 361',      24.0,  28.0,   9.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Cherry Red RL',           'Clariant',  'dye','CI Acid Red 57',       38.0,  42.0,  15.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Brick Red BN',            'Lanxess',   'dye','CI Direct Red 80',     36.0,  35.0,  22.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Wine Red 2R',             'BASF',      'dye','CI Acid Red 4',        28.0,  32.0,   8.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Russet Red R',            'Clariant',  'dye','CI Acid Red 97',       35.0,  32.0,  22.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Terracotta RL',           'Huntsman',  'dye','CI Direct Red 75',     42.0,  28.0,  26.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Coral Rose MW',           'Stahl',     'dye','CI Acid Red 337',      52.0,  30.0,  18.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tomato Red RN',           'Lanxess',   'dye','CI Acid Red 249',      44.0,  40.0,  28.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Magenta BL',              'BASF',      'dye','CI Acid Red 52',       44.0,  50.0, -12.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Salmon Pink NF',          'Clariant',  'dye','CI Acid Red 138',      60.0,  28.0,  14.0, TRUE),

    -- =========================================================
    -- DYES — Browns, Tans & Leathers
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Cognac RL',               'Clariant',  'dye','CI Acid Brown 75',     45.0,  16.0,  26.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Chocolate BN',            'BASF',      'dye','CI Direct Brown 44',   28.0,   9.5,  14.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tan RL',                  'Lanxess',   'dye','CI Acid Orange 116',   58.0,  11.0,  32.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Caramel BN',              'Clariant',  'dye','CI Direct Orange 39',  52.0,  15.0,  38.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Saddle Brown 2R',         'BASF',      'dye','CI Acid Brown 165',    38.0,  14.0,  20.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Walnut BM',               'Huntsman',  'dye','CI Direct Brown 2',    30.0,   8.0,  12.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Havana Brown GL',         'Stahl',     'dye','CI Acid Brown 282',    34.0,  12.0,  16.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Hazel Nut RL',            'Lanxess',   'dye','CI Acid Orange 67',    48.0,  14.0,  30.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Fawn BL',                 'BASF',      'dye','CI Acid Yellow 79',    62.0,  10.0,  28.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Chestnut R',              'Clariant',  'dye','CI Direct Brown 95',   36.0,  13.0,  18.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Espresso BN Conc.',       'Huntsman',  'dye','CI Direct Brown 223',  20.0,   6.5,   8.0, TRUE),

    -- =========================================================
    -- DYES — Greens
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Forest Green GN',         'Lanxess',   'dye','CI Direct Green 28',   30.0, -18.0,  12.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Bottle Green BN',         'BASF',      'dye','CI Direct Green 59',   25.0, -20.0,   6.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Olive Green MT',          'Clariant',  'dye','CI Acid Yellow 49',    46.0,  -5.5,  16.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Khaki BL',                'Lanxess',   'dye','CI Acid Green 25',     50.0,  -4.0,  18.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sage Green NW',           'BASF',      'dye','CI Direct Green 6',    54.0,  -8.0,  12.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Military Green 3G',       'Huntsman',  'dye','CI Acid Green 16',     40.0, -12.0,  14.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Emerald GN',              'Stahl',     'dye','CI Acid Green 50',     44.0, -22.0,  10.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Jungle Green BL',         'Lanxess',   'dye','CI Acid Green 28',     35.0, -18.0,  18.0, TRUE),

    -- =========================================================
    -- DYES — Yellows & Oranges
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Mustard Yellow GR',       'BASF',      'dye','CI Acid Yellow 36',    65.0,   8.0,  45.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Golden Yellow BN',        'Clariant',  'dye','CI Acid Yellow 17',    74.0,   5.0,  52.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Amber RLN',               'Lanxess',   'dye','CI Acid Orange 7',     60.0,  14.0,  48.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sunflower Yellow MG',     'BASF',      'dye','CI Acid Yellow 23',    78.0,   2.0,  58.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Orange GN Conc.',         'Clariant',  'dye','CI Acid Orange 56',    55.0,  30.0,  48.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Apricot BL',              'Huntsman',  'dye','CI Acid Orange 116',   65.0,  22.0,  38.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Saffron RL',              'Stahl',     'dye','CI Acid Yellow 11',    68.0,  20.0,  50.0, TRUE),

    -- =========================================================
    -- DYES — Whites, Creams & Neutrals
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Ivory White NF',          'BASF',      'dye','CI Direct Yellow 50',  88.0,   0.5,  10.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Cream BL',                'Clariant',  'dye','CI Acid Yellow 9',     84.0,   1.0,  14.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Beige NW',                'Lanxess',   'dye','CI Direct Yellow 28',  74.0,   3.5,  16.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Nude RL',                 'BASF',      'dye','CI Acid Orange 10',    70.0,   6.0,  18.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Natural RLN',             'Clariant',  'dye','CI Direct Orange 26',  66.0,   5.5,  20.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Off-White SF',            'Huntsman',  'dye','CI Direct White 3',    90.0,  -0.5,   6.0, TRUE),

    -- =========================================================
    -- DYES — Purples & Violets
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Violet BL Conc.',         'Lanxess',   'dye','CI Acid Violet 17',    32.0,  22.0, -20.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Plum 2R',                 'BASF',      'dye','CI Acid Red 299',      28.0,  20.0, -12.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Aubergine BN',            'Clariant',  'dye','CI Acid Violet 7',     22.0,  16.0, -10.0, TRUE),
    ('00000000-0000-0000-0000-000000000001','Lavender MT',             'Huntsman',  'dye','CI Acid Violet 48',    52.0,  14.0, -16.0, TRUE),

    -- =========================================================
    -- FATLIQUORS
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Lipoderm LQF (Sulphited fish)', 'BASF',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Densodrin OL (Neatsfoot)',      'Lanxess',  'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Melio SR (Synthetic ester)',    'Clariant', 'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Lipsol BM (Blown castor)',      'Stahl',    'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Truposol GL (Lecithin)',        'TFL',      'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Coripol BF (Oxidised fish)',    'BASF',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Lanolin Oil S (Wool grease)',   'Clariant', 'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Silicol SF (Silicone softener)','Stahl',    'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Parachol BE (Paraffin blend)',  'Lanxess',  'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Aqualen BNM (Anionic softener)','BASF',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Fatliquor ML (Sperm subs.)',    'TFL',      'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Coripol KN (Chrome compat.)',   'BASF',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Densodrin NK (Combined oil)',   'Lanxess',  'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Elaspan SP (Polyurethane)',     'Stahl',    'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Melio OL (Oxidised neatsfoot)', 'Clariant', 'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Lipoderm TL (Tallowamine)',     'BASF',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Stantex ER (Emulsified fat)',   'TFL',      'fatliquor', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Coripol WT (Wax/oil blend)',    'BASF',     'fatliquor', NULL, NULL, NULL, NULL, TRUE),

    -- =========================================================
    -- RETANNING AGENTS
    -- =========================================================
    -- Syntans
    ('00000000-0000-0000-0000-000000000001','Retanal WB (Anionic syntan)',   'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tamol NNA (Naphthalene syntan)','Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Leukotan K (Phenol syntan)',    'BASF',     'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Basyntan SW (Filling syntan)',  'BASF',     'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Coriagen M (Melamine syntan)',  'Clariant', 'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Mesitol NBS (Phenol syntan)',   'Huntsman', 'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Blancorol AA (Acrylic retan)',  'Clariant', 'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Leukotan 970 (Acrylic/methacry)','BASF',   'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sellasol SL (Acrylic–syntan)',  'Stahl',    'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    -- Vegetable extracts
    ('00000000-0000-0000-0000-000000000001','Tanigan CF (Mimosa extract)',   'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tanigan OL (Quebracho)',        'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tanigan BN (Chestnut)',         'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sellatan W (Veg. blend)',       'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tara Extract PR (Tara pods)',   'Generic',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Gambier Extract RL',            'Generic',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sumac Extract GN',              'Generic',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    -- Chrome / mineral
    ('00000000-0000-0000-0000-000000000001','Chromosal B (Basic chrome)',    'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Chromosal B33 (High basicity)', 'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Relugan GT-50 (Glutaraldehyde)','BASF',     'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tanigan PAK (Aldehyde free)',   'Lanxess',  'retanning_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Relugan SER (Zeolite mineral)', 'BASF',     'retanning_agent', NULL, NULL, NULL, NULL, TRUE),

    -- =========================================================
    -- SURFACTANTS & AUXILIARIES
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Avolan IS (Levelling agent)',   'Lanxess',  'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Erional NW (Anionic surfact.)', 'Huntsman', 'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Albigen A (Dispersant)',        'BASF',     'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Leophen M (Penetrator)',        'Lanxess',  'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Miranol C2M (Amphoteric)',      'Clariant', 'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tanaterge CR (Degreaser)',      'TFL',      'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Lyogen DFT (Retarding agent)',  'Huntsman', 'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Defoamer LD-40 (Silicone)',     'Stahl',    'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sandozin NIE (Wetting agent)',  'Clariant', 'surfactant', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tinovetin JUN (Dye assistant)', 'Huntsman', 'surfactant', NULL, NULL, NULL, NULL, TRUE),

    -- =========================================================
    -- ACIDS
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Formic Acid 85%',              'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sulphuric Acid 98%',           'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Acetic Acid Glacial',          'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Lactic Acid 80%',              'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Citric Acid Monohydrate',      'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Oxalic Acid',                  'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Phosphoric Acid 85%',          'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tartaric Acid',                'Generic',  'acid', NULL, NULL, NULL, NULL, TRUE),

    -- =========================================================
    -- BASES / ALKALIS
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Sodium Formate',               'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Bicarbonate',           'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Carbonate (Soda Ash)',  'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Ammonia Solution 25%',         'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Magnesium Oxide',              'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Calcium Hydroxide (Lime)',     'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Hydroxide 50%',         'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Hexamethylenetetramine',       'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Acetate',               'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Disodium Phosphate',           'Generic',  'base', NULL, NULL, NULL, NULL, TRUE),

    -- =========================================================
    -- FIXING AGENTS & FINISHING
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Fixogen LS (Dye fixative)',    'Clariant', 'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Baykanol PQ (Cationic fixer)', 'Lanxess',  'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Leucophor BS (Optical bright)','Clariant', 'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tanfix CF (Chrome fixer)',     'TFL',      'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Rewin OS (Cationic polymer)',  'Huntsman', 'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sandofix EC (Polyamine)',      'Clariant', 'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Luganil NBO (Metal mordant)',  'BASF',     'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Tanfix BN (Basifying fixer)',  'Lanxess',  'fixing_agent', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Leucophor WS (White OBA)',     'Clariant', 'fixing_agent', NULL, NULL, NULL, NULL, TRUE),

    -- =========================================================
    -- OTHER / SPECIALITY
    -- =========================================================
    ('00000000-0000-0000-0000-000000000001','Salt (NaCl Pickling)',         'Generic',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Chloride (Float salt)', 'Generic',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Bactericide TB-18',            'Lanxess',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Preventol R80 (Biocide)',      'Lanxess',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Fungicide NF (In-drum)',       'Stahl',    'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Supranil A (Degreaser drum)',  'BASF',     'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Enzyme Bating ES (Pancreatic)','Novozymes','other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Oropon G (Bating enzyme)',     'Lanxess',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Borron G (Wetting enzyme)',    'Lanxess',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Sulphide (Unhairing)',  'Generic',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Calcium Sulphide (Unhairing)', 'Generic',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Masking Agent DB (Syntan mask)','BASF',    'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sellasol ON (Oxidant bleach)', 'Stahl',    'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Sodium Metabisulphite',        'Generic',  'other', NULL, NULL, NULL, NULL, TRUE),
    ('00000000-0000-0000-0000-000000000001','Aluminium Sulphate',           'Generic',  'other', NULL, NULL, NULL, NULL, TRUE)

    ON CONFLICT DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*) INTO inserted FROM ins;

  RETURN inserted;
END;
$$;

-- Grant execute to authenticated users (SECURITY DEFINER handles the actual insert)
GRANT EXECUTE ON FUNCTION public.seed_community_chemicals() TO authenticated;
