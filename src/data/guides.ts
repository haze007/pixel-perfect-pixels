export interface GuideSection {
  heading: string;
  body: string;
  tip?: string;
  warning?: string;
}

export interface ExternalResource {
  title: string;
  url: string;
  type: "course" | "article" | "video" | "reference";
  free: boolean;
}

export interface Guide {
  id: string;
  category: string;
  title: string;
  description: string;
  readTime: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  sections: GuideSection[];
  resources: ExternalResource[];
  relatedIds: string[];
}

export interface GuideCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
}

/* ── Categories ────────────────────────────────────────────────────── */

export const CATEGORIES: GuideCategory[] = [
  { id: "start",      label: "Getting Started",       icon: "Rocket",    color: "#2563EB", bg: "#EFF6FF", description: "Set up your workspace and build your first recipe" },
  { id: "chemistry",  label: "Leather Chemistry",      icon: "Atom",      color: "#16A34A", bg: "#F0FDF4", description: "Understand the science behind tanning and dyeing" },
  { id: "colour",     label: "Colour Science",         icon: "Palette",   color: "#D97706", bg: "#FFFBEB", description: "Master Lab* colour space, ΔE, and colour prediction" },
  { id: "studio",     label: "Recipe Studio",          icon: "Flask",     color: "#7C3AED", bg: "#F5F3FF", description: "Build, simulate, and refine recipes step by step" },
  { id: "catalogue",  label: "Chemical Catalogue",     icon: "Book",      color: "#0891B2", bg: "#ECFEFF", description: "Manage your chemical library and import data" },
  { id: "viewer",     label: "3D Viewer",              icon: "Cube",      color: "#059669", bg: "#ECFDF5", description: "Navigate the 3D viewer and product mockups" },
  { id: "advanced",   label: "Advanced Topics",        icon: "Chart",     color: "#DC2626", bg: "#FEF2F2", description: "Calibration, optimisation, and industry standards" },
  { id: "trouble",    label: "Troubleshooting",        icon: "Wrench",    color: "#6B7280", bg: "#F4F4F5", description: "Diagnose and fix common issues" },
];

/* ── Guides ────────────────────────────────────────────────────────── */

export const GUIDES: Guide[] = [

  /* ── Getting Started ─────────────────────────────────────────────── */
  {
    id: "gs-welcome",
    category: "start",
    title: "Welcome to TannerySim",
    description: "An overview of what TannerySim is, who it's for, and what you can accomplish with it.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "What is TannerySim?",
        body: "TannerySim is a leather chemistry simulation platform that lets tanners, colourists, and product developers predict the outcome of dyeing and finishing recipes before committing to a physical trial. By encoding chemical properties as CIE L*a*b* colour coordinates and applying a scientifically grounded blending model, the system estimates the predicted colour of your leather — saving time, material, and cost.",
      },
      {
        heading: "Who is it for?",
        body: "TannerySim is designed for wet-end chemists, colour labs, leather goods brands, and students learning the craft. Whether you are formulating a new black for a luxury shoe upper or trying to match a seasonal Pantone, the platform gives you a digital workspace to experiment without waste.",
      },
      {
        heading: "Core concepts",
        body: "Everything in TannerySim revolves around three ideas: Substrates (the raw leather you start with), Chemicals (dyes, fatliquors, retans, and auxiliaries with measured Lab* values), and Recipes (ordered sequences of chemical steps applied to a substrate). The 3D viewer renders a hyperrealistic preview of your predicted leather colour on various product shapes in real time.",
      },
      {
        heading: "What TannerySim is not",
        body: "TannerySim is a simulation aid, not a replacement for physical trials. The colour prediction model is based on weighted Lab* blending which is a simplification of the complex physical chemistry involved. Always validate predictions on actual production trials before committing to a specification.",
        warning: "Predictions are approximations. Environmental factors (pH, temperature, float ratio, drum speed) affect real-world outcomes in ways the model cannot fully capture.",
      },
    ],
    resources: [
      { title: "Introduction to Leather Technology (SLTC)", url: "https://www.sltc.org/education", type: "reference", free: true },
      { title: "Leather Working Group — Industry Basics", url: "https://www.leatherworkinggroup.com/resources", type: "article", free: true },
    ],
    relatedIds: ["gs-workspace", "gs-first-recipe", "gs-interface"],
  },

  {
    id: "gs-workspace",
    category: "start",
    title: "Setting Up Your Workspace",
    description: "Create your account, provision your tannery, and import your first chemicals.",
    readTime: 5,
    difficulty: "beginner",
    sections: [
      {
        heading: "Sign up and confirm your email",
        body: "Navigate to the sign-up page and enter your full name, tannery name, email, and a strong password. After submitting, check your inbox for a confirmation link. Click it — this step provisions your tannery database automatically. Until you confirm, your tannery will not have data.",
        tip: "Use your work email so the tannery slug is recognisable (e.g. 'acme-leather').",
      },
      {
        heading: "Your tannery is auto-created on first login",
        body: "When you confirm your email and sign in for the first time, TannerySim automatically calls provision_tannery() behind the scenes. This creates your tannery record and grants you admin access. You will immediately see the 10 default substrates in the Recipe Studio.",
      },
      {
        heading: "Add your first chemical",
        body: "Go to the Chemical Catalogue and click 'Add Chemical'. At minimum, give it a name and category. If you have spectrophotometer data, enter the L*, a*, and b* values — these are what drive colour prediction. Without Lab* values, the chemical will still appear in recipe steps but will not influence the predicted colour.",
      },
      {
        heading: "Import from CSV",
        body: "If you already have a spreadsheet of chemicals, use 'Import CSV'. The required columns are: name, category. Optional columns include: supplier, colour_index, lab_l, lab_a, lab_b. Download the sample template from the import dialog to get the correct column headers.",
        tip: "Community chemicals (30+ real dyes, fatliquors, and auxiliaries) are pre-loaded and visible to all users. Start with those before entering your own.",
      },
    ],
    resources: [
      { title: "Supabase Auth Documentation", url: "https://supabase.com/docs/guides/auth", type: "reference", free: true },
    ],
    relatedIds: ["cat-adding", "gs-first-recipe"],
  },

  {
    id: "gs-first-recipe",
    category: "start",
    title: "Your First Recipe in 5 Minutes",
    description: "A step-by-step walkthrough for creating, simulating, and saving your first leather recipe.",
    readTime: 5,
    difficulty: "beginner",
    sections: [
      {
        heading: "Open the Recipe Studio",
        body: "From the Dashboard, click 'New Recipe' or navigate to the Recipe Library and click the 'New Recipe' button. You will be taken to the Recipe Studio with a fresh canvas.",
      },
      {
        heading: "Name your recipe and select a substrate",
        body: "Click the recipe name field at the top (it starts as 'Untitled Recipe') and type a descriptive name such as 'Navy Chrome Calf — Trial 1'. Then select a substrate from the dropdown. The substrate defines your starting colour — e.g. 'Cow Chrome' starts at a near-white L*72.",
      },
      {
        heading: "Add chemical steps",
        body: "Click the 'Steps' toggle in the header to expand the steps panel on the left. Click 'Add Step' to add your first chemical. Select a dye from the dropdown (e.g. 'Navy Blue BN Dye'), set a percentage weight (e.g. 3%), a temperature (e.g. 60°C), and duration (e.g. 60 min). Add more steps for any auxiliaries or retanning agents.",
        tip: "Add steps in process order: retan → dyeing → fatliquoring. The sequence matters for real processing but currently all steps contribute equally to the colour model.",
      },
      {
        heading: "Read the 3D preview",
        body: "The centre panel shows a live 3D render of your predicted colour on a leather swatch. As you add steps and chemicals, the colour updates in real time. Use the product dropdown (bottom-left of the viewer) to switch between a flat swatch, wallet, belt, or tote bag mockup.",
      },
      {
        heading: "Set a target and measure ΔE",
        body: "In the right Properties panel, turn 'Target Colour' on. Use the L*, a*, b* sliders to dial in your target (e.g. the exact Lab* values from your Pantone or customer spec). The Colour Prediction panel will show the predicted colour versus target and the Delta E (ΔE) — a number that indicates how far apart they are. A ΔE below 2 is excellent.",
      },
      {
        heading: "Save your recipe",
        body: "Click 'Save' in the header. The recipe is stored in your tannery library with its predicted colour, steps, and ΔE. You can find it in the Recipe Library and re-open it for editing at any time.",
      },
    ],
    resources: [
      { title: "Pantone to Lab* Converter", url: "https://www.colorcodehex.com/pantone-to-lab.html", type: "reference", free: true },
    ],
    relatedIds: ["gs-interface", "studio-steps", "colour-deltae"],
  },

  {
    id: "gs-interface",
    category: "start",
    title: "Navigating the Interface",
    description: "A full tour of every panel, button, and section in TannerySim.",
    readTime: 6,
    difficulty: "beginner",
    sections: [
      {
        heading: "Sidebar navigation",
        body: "The left sidebar contains four sections: Dashboard (overview and stats), Recipes (your full recipe library), Catalogue (chemical database), and Settings (profile and tannery info). Each section has its own accent colour. Click the collapse arrow at the bottom to hide the sidebar and give more room to the content area.",
      },
      {
        heading: "Dashboard",
        body: "The Dashboard shows four stat cards (recipe count, chemical count, substrate count, average ΔE), a Quick Actions row for common tasks, and a Recent Recipes list. Click any stat card to navigate directly to that section.",
      },
      {
        heading: "Recipe Library",
        body: "The Recipe Library shows all your saved recipes as cards. Each card shows the predicted colour swatch, recipe name, number of steps, version, status badge, and ΔE. Click a card to open it in the Recipe Studio for editing. The trash icon deletes the recipe after confirmation.",
      },
      {
        heading: "Recipe Studio — three-pane layout",
        body: "The Studio has three zones: a collapsible Steps panel on the left (toggle with the 'Steps' button), the 3D Viewer in the centre, and a fixed Properties panel on the right. The header contains the recipe name, substrate selector, and save button.",
      },
      {
        heading: "Chemical Catalogue",
        body: "The Catalogue lists all chemicals in your tannery plus the shared community library. Use the search bar and category filter to find chemicals quickly. Click the edit pencil to update a chemical's Lab* values. Click the trash icon to delete it (community chemicals cannot be deleted).",
      },
      {
        heading: "AI Chat panel",
        body: "Click the chat bubble icon in the top-right header to open the AI Assistant. It is aware of your chemical library and can answer questions about leather chemistry, colour matching, and troubleshooting. On mobile, it opens as a bottom sheet.",
      },
    ],
    resources: [],
    relatedIds: ["gs-welcome", "gs-first-recipe", "viewer-controls"],
  },

  /* ── Leather Chemistry ──────────────────────────────────────────── */
  {
    id: "chem-intro",
    category: "chemistry",
    title: "Introduction to Leather Tanning",
    description: "Understand what tanning is, why it exists, and the key stages of the process.",
    readTime: 8,
    difficulty: "beginner",
    sections: [
      {
        heading: "What is leather tanning?",
        body: "Tanning is the conversion of raw animal hide into leather — a stable, durable material that does not putrefy. Raw hides are mostly collagen protein, which is susceptible to bacterial degradation. Tanning agents crosslink the collagen fibres, making them resistant to heat, water, and microbial attack.",
      },
      {
        heading: "The beamhouse",
        body: "Before tanning, hides go through the beamhouse: soaking (rehydrating dried/salted hides), liming (removing hair and epidermis with calcium hydroxide), deliming, and bating (enzyme treatment to soften the grain). The quality of beamhouse work directly affects dye penetration and final colour uniformity.",
      },
      {
        heading: "Main tanning methods",
        body: "Chrome tanning (using chromium III sulphate) is the dominant industrial method — it produces a soft, flexible leather in hours. Vegetable tanning uses plant-derived polyphenols (tannins from oak bark, mimosa, quebracho) and takes weeks; it produces firmer, thicker leather used for saddlery and belts. Aldehyde, synthetic, and combination tannages are also used for specialist applications.",
      },
      {
        heading: "Wet finishing: retan, colour, fat",
        body: "After tanning, the wet-blue (chrome-tanned) or wet-white leather enters wet finishing: retanning (improving fullness, softness, and colour uniformity), dyeing (colouring), and fatliquoring (lubricating the fibres to restore suppleness). This is the stage TannerySim primarily simulates.",
      },
      {
        heading: "Drying and finishing",
        body: "After wet work, leather is dried (toggling, vacuum drying, or hang drying), staked (softened mechanically), and surface-finished with coatings, lacquers, and embossing. Surface finishes affect gloss, handle, and fastness but are not currently modelled in TannerySim.",
      },
    ],
    resources: [
      { title: "SLTC — Leather Technology Basics", url: "https://www.sltc.org/education", type: "reference", free: true },
      { title: "Leather Dictionary (IULTCS)", url: "https://iultcs.org", type: "reference", free: true },
      { title: "Introduction to Leather Manufacturing (YouTube)", url: "https://www.youtube.com/results?search_query=leather+tanning+process", type: "video", free: true },
    ],
    relatedIds: ["chem-chrome", "chem-veg", "chem-dye"],
  },

  {
    id: "chem-chrome",
    category: "chemistry",
    title: "Chrome Tanning Process",
    description: "A deep dive into chromium III sulphate tanning — the world's dominant leather-making method.",
    readTime: 7,
    difficulty: "intermediate",
    sections: [
      {
        heading: "How chrome tanning works",
        body: "Chromium III sulphate [Cr2(SO4)3] forms coordinate bonds with the carboxyl groups of collagen. These crosslinks stabilise the protein structure at a shrinkage temperature (Ts) above 100°C (compared to ~65°C for raw hide). The process takes 4–8 hours in a rotating drum.",
      },
      {
        heading: "The pickling step",
        body: "Before chrome addition, hides are pickled in a salt-acid bath (typically NaCl + sulphuric or formic acid) to suppress swelling and open up the collagen structure for penetration. Pickle pH is usually 2.8–3.2.",
      },
      {
        heading: "Chrome offer and basification",
        body: "Chrome is added at 6–8% Cr2O3 on shaved weight. Basification (raising pH to 3.8–4.0 with sodium formate or bicarbonate) promotes exhaustion of chrome onto the hide. Incorrect basification leads to poor penetration (blue-green core) or surface precipitation.",
        warning: "Chromium VI is a carcinogen. Well-run tanneries use Cr(III) and maintain conditions that prevent oxidation to Cr(VI). Always test finished leather per ISO 17075.",
      },
      {
        heading: "Wet-blue characteristics",
        body: "Fresh chrome-tanned leather is called 'wet-blue' due to its characteristic blue-green colour from the chrome complex. It has a Ts >100°C, is very receptive to dyes, and has open fibre structure ideal for retanning.",
      },
      {
        heading: "Chrome tanning and colour",
        body: "The blue-green substrate colour of wet-blue must be considered when predicting final dye shades. In TannerySim, chrome-tanned substrates have slightly negative a* and near-neutral b* values to reflect this. Warm shades (red, orange, tan) require heavier dye loads to overcome the blue undertone.",
      },
    ],
    resources: [
      { title: "UNIDO — Chrome Tanning Environmental Guide", url: "https://www.unido.org/resources/publications", type: "reference", free: true },
      { title: "Journal of the American Leather Chemists Association (JALCA)", url: "https://www.leatherchemists.org/journal", type: "reference", free: false },
    ],
    relatedIds: ["chem-intro", "chem-veg", "chem-retan"],
  },

  {
    id: "chem-veg",
    category: "chemistry",
    title: "Vegetable Tanning Process",
    description: "Learn how plant-derived tannins produce the firm, rich leather used in fine goods and saddlery.",
    readTime: 7,
    difficulty: "intermediate",
    sections: [
      {
        heading: "What are vegetable tannins?",
        body: "Vegetable tannins are polyphenolic compounds extracted from bark, wood, fruit, or leaves. They bind to collagen via hydrogen bonding and hydrophobic interactions. Common sources: quebracho (South America), mimosa/wattle (Africa/Australia), oak bark (Europe), chestnut (Europe), tara (Peru).",
      },
      {
        heading: "Pit vs drum tanning",
        body: "Traditional pit tanning submerges hides in progressively stronger tannin liquors over weeks or months, building up tannin concentration from outside inward. Modern drum tanning using concentrated extracts can produce veg-tanned leather in 1–3 days but may sacrifice some of the depth and character of pit-tanned leather.",
      },
      {
        heading: "Colour characteristics",
        body: "Vegetable-tanned leather has a warm beige-to-tan colour before any dyeing — typically L*65–75, with positive a* (1–5) and b* (12–20). This warm base makes veg-tanned leather ideal for natural, cognac, and tan shades, and gives it a characteristic pull-up effect when bent.",
      },
      {
        heading: "Dyeing veg-tanned leather",
        body: "Veg-tanned leather is more acidic (pH 3.5–4.5) and has less affinity for anionic dyes than chrome-tanned leather. Direct dyes and cationic fixatives are often preferred. The tannin matrix also affects shade — the same dye will appear warmer on veg-tan than on wet-blue.",
        tip: "When simulating veg-tanned recipes in TannerySim, select one of the veg-tan substrates (e.g. 'Cow Veg-Tan') to get the correct warm starting Lab* values.",
      },
    ],
    resources: [
      { title: "Vegetable Tanning — Leather UK", url: "https://www.leather.uk.com", type: "article", free: true },
      { title: "Consorzio Vera Pelle Italiana Conciata al Vegetale", url: "https://www.pellealvegetale.it/en", type: "reference", free: true },
    ],
    relatedIds: ["chem-intro", "chem-chrome", "chem-dye"],
  },

  {
    id: "chem-dye",
    category: "chemistry",
    title: "Dyeing Chemistry Fundamentals",
    description: "Understand how dyes interact with leather, the role of pH, and key dye classes.",
    readTime: 9,
    difficulty: "intermediate",
    sections: [
      {
        heading: "How dyes bond to leather",
        body: "Leather is an amphoteric substrate — it carries both positive and negative charges depending on pH. Below its isoelectric point (IEP, ~pH 5–6), leather is net positive and attracts anionic dyes. Above IEP, it attracts cationic dyes. Most commercial leather dyes are anionic (acid or direct dyes) applied at pH 3.5–5.0.",
      },
      {
        heading: "Dye classes used in leather",
        body: "Acid dyes: sulphonic acid groups give strong affinity for chromium-crosslinked collagen. Good brightness. Direct dyes: larger molecular weight, better penetration. Metallised (pre-metallised and 1:2 metal-complex) dyes: exceptional lightfastness, excellent for automotive and upholstery. Reactive dyes: covalent bonding, outstanding washfastness but require alkaline conditions incompatible with chrome.",
      },
      {
        heading: "The role of pH in dyeing",
        body: "Dyeing is typically conducted at pH 4.0–5.5. Lowering pH (e.g. formic acid) increases dye uptake ('fixes' the dye) but reduces levelness. Raising pH improves penetration but risks dye migration to the surface. A common protocol is to dye at neutral pH for penetration, then drop pH to fix.",
        tip: "In TannerySim, temperature and pH are recorded per step but currently affect only the process notes, not the colour model. Future versions will incorporate pH-dependent dye affinity.",
      },
      {
        heading: "Dye exhaustion and levelness",
        body: "Exhaustion is the percentage of dye taken up by the leather. High exhaustion = less dye in the waste float but can mean uneven application if done too fast. Levelness (uniformity of colour) is promoted by levelling agents (anionic surfactants), warm temperatures, and controlled pH.",
      },
      {
        heading: "Colour Index numbers",
        body: "Every commercial dye has a Colour Index (CI) number assigned by the Society of Dyers and Colourists. For example, CI Acid Blue 113 is a specific chemical structure regardless of trade name. TannerySim stores CI numbers alongside each chemical — use them to cross-reference dyes from different suppliers.",
      },
    ],
    resources: [
      { title: "Society of Dyers and Colourists — Colour Index", url: "https://colour-index.com", type: "reference", free: false },
      { title: "Leather Chemistry (IULTCS training)", url: "https://iultcs.org/education", type: "course", free: true },
    ],
    relatedIds: ["chem-intro", "colour-lab", "chem-fat", "chem-ph"],
  },

  {
    id: "chem-fat",
    category: "chemistry",
    title: "Fatliquoring and Softening",
    description: "Why leather needs fatliquors, how they work, and how they interact with colour.",
    readTime: 6,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Why leather needs fatliquoring",
        body: "During wet processing, natural fats are removed from the hide. Without replacement, dried leather becomes stiff and brittle as fibres bond together. Fatliquors (emulsified oils) lubricate the fibre network, restore suppleness, and improve tensile strength.",
      },
      {
        heading: "Types of fatliquors",
        body: "Sulphited fish/vegetable oils: classic, cost-effective, good softness. Sulphated castor oil (Turkey Red Oil): self-emulsifying, good exhaustion. Synthetic esters: consistent, excellent stability. Lecithin-based: natural origin, popular for sustainable leathers. Lanolin-based: exceptional handle and waxy feel.",
      },
      {
        heading: "Fatliquoring and colour",
        body: "Fatliquors themselves are near-colourless but their application can affect colour by: (1) filling surface pores, creating a slight lightening effect, (2) altering gloss, which changes how colour appears visually, (3) migrating dye if applied before proper fixation. Always fix dye before heavy fatliquoring.",
        warning: "Adding fatliquors before acid fixation can cause dye to migrate to the flesh side, giving a pale, uneven surface colour.",
      },
      {
        heading: "Fatliquor percentage and softness",
        body: "Standard fatliquor offers are 4–10% on shaved weight. Higher percentages give softer leather but may reduce tensile strength and cause greasiness. Premium garment leathers may carry 8–12% fatliquor. Shoe upper leathers typically 4–6%.",
      },
    ],
    resources: [
      { title: "BASF Leather Chemicals Guide", url: "https://www.basf.com/global/en/industries/chemicals/leather.html", type: "reference", free: true },
    ],
    relatedIds: ["chem-dye", "chem-retan", "chem-ph"],
  },

  {
    id: "chem-retan",
    category: "chemistry",
    title: "Retanning Agents",
    description: "Syntans, vegetable extracts, resins, and polymers — what they do and when to use them.",
    readTime: 7,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Purpose of retanning",
        body: "After primary tanning, leather often needs additional tanning agents to: improve fullness (fill loose fibres), improve fibre opening for wet-white, equalise dye uptake, improve grain tightness, or modify temper (stiffness/softness). Retanning is applied in the drum at 40–50°C.",
      },
      {
        heading: "Synthetic tannins (syntans)",
        body: "Syntans are synthetic polyphenols or sulphonated aromatics. They penetrate well, improve levelness of dyeing, and can replace some chrome in combination tannages. White syntans (dispersing syntans) open the fibre and promote even dye uptake — very useful before dyeing dark shades.",
      },
      {
        heading: "Resin retans",
        body: "Acrylic, melamine, and dicyandiamide resins deposit in the loose fibre areas and improve fullness without excessive stiffening. Melamine resins also improve water resistance. Glutaraldehyde (Relugan GT) reacts with amino groups and is popular for wet-white tannage.",
      },
      {
        heading: "Vegetable extract retans",
        body: "Mimosa, quebracho, and tara extracts used as retans add warmth to the colour (slight brown/red shift) and improve mellow temper. They reduce chrome staining on uppers and improve embossing properties.",
      },
      {
        heading: "Order of application",
        body: "A typical drum sequence: wash → syntan (dispersing) → retan (polymeric) → dyeing → fatliquoring → fixation → wash out. Order matters — applying a filling retan before dye can block dye penetration.",
        tip: "Use a dispersing syntan before your dye step to open fibre and promote levelness. Use a filling retan after dyeing to lock in colour and add body.",
      },
    ],
    resources: [
      { title: "Lanxess Leather Chemicals Portfolio", url: "https://lanxess.com/en/industries/leather", type: "reference", free: true },
    ],
    relatedIds: ["chem-dye", "chem-chrome", "chem-intro"],
  },

  {
    id: "chem-ph",
    category: "chemistry",
    title: "pH Effects on Leather",
    description: "How pH controls dye uptake, chrome fixation, and overall leather quality.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Leather's isoelectric point",
        body: "Chrome-tanned leather has an isoelectric point (IEP) around pH 5–6. Below IEP, leather carries a net positive charge and has strong affinity for anionic dyes. The operating pH during dyeing therefore determines dye uptake rate, penetration depth, and fixation.",
      },
      {
        heading: "Acid fixation",
        body: "After dyeing at moderate pH (4.5–5.5) for penetration, formic acid is added to drop pH to 3.5–4.0. This increases ionic attraction between the dye and leather, forcing exhaustion. Typical acid addition: 0.5–2% formic acid (85%). Over-acidification can cause dye aggregation and uneven fixation.",
      },
      {
        heading: "pH and shade",
        body: "pH affects metachromasy — some dyes shift shade when pH changes. Acid-sensitive dyes may look brown at low pH and purple at high pH. Always check the dye supplier's technical sheet for pH sensitivity before designing a recipe.",
        warning: "Never mix acid directly onto dry leather. Always dilute acids 1:10 with water before adding to the drum float.",
      },
      {
        heading: "Monitoring pH",
        body: "Use a calibrated pH meter on the drum float, not pH paper (too imprecise for leather work). Check at the start, after dyeing, after fatliquoring, and after fixation. Log pH values alongside Lab* measurements in your recipe notes for reproducibility.",
      },
    ],
    resources: [
      { title: "pH and Leather Chemistry (JALCA article)", url: "https://www.leatherchemists.org", type: "reference", free: false },
    ],
    relatedIds: ["chem-dye", "chem-chrome", "chem-fat"],
  },

  {
    id: "chem-safety",
    category: "chemistry",
    title: "Chemical Safety Basics",
    description: "Essential safety practices for handling tannery chemicals in the lab and on the production floor.",
    readTime: 5,
    difficulty: "beginner",
    sections: [
      {
        heading: "Read the SDS first",
        body: "Every chemical in a tannery must have a Safety Data Sheet (SDS) on file. Before using any new chemical, read sections 2 (hazards), 4 (first aid), 8 (exposure controls/PPE), and 15 (regulatory information). In TannerySim, the supplier field helps you locate the correct SDS on the supplier's website.",
      },
      {
        heading: "PPE for leather chemicals",
        body: "Minimum PPE: nitrile gloves, safety glasses, and an apron when handling concentrated acids, alkalis, or dye powders. Dye powders are particularly hazardous — use a dust mask (FFP2 or N95) and work in a ventilated area or fume cupboard.",
      },
      {
        heading: "Chromium VI vigilance",
        body: "Chrome III used in tanning can oxidise to carcinogenic Chrome VI under certain conditions (strong oxidants, high pH, heat). Test finished leather per ISO 17075-2. Limit is 3 mg/kg in most markets. Store chrome chemicals separately from oxidants.",
        warning: "Never dispose of chrome waste liquor in drains. Chrome waste must be treated and disposed of per local hazardous waste regulations.",
      },
      {
        heading: "Acid and alkali handling",
        body: "Always add acid to water, never water to acid (exothermic splash risk). Concentrated formic acid (85%) and sulphuric acid are highly corrosive. Keep neutralising agent (sodium bicarbonate) nearby when working with acids. Lime (calcium hydroxide) is strongly alkaline — handle dry lime with respiratory protection.",
      },
    ],
    resources: [
      { title: "COSHH Essentials — UK HSE", url: "https://www.hse.gov.uk/coshh", type: "reference", free: true },
      { title: "Tannery Waste Management — UNIDO", url: "https://www.unido.org/resources/publications", type: "reference", free: true },
    ],
    relatedIds: ["chem-intro", "chem-chrome", "chem-ph"],
  },

  /* ── Colour Science ──────────────────────────────────────────────── */
  {
    id: "colour-lab",
    category: "colour",
    title: "CIE L*a*b* Colour Space",
    description: "Master the three-dimensional colour model that drives everything in TannerySim.",
    readTime: 7,
    difficulty: "beginner",
    sections: [
      {
        heading: "Why Lab* exists",
        body: "RGB and hex colours are device-dependent — the same hex code looks different on different screens. The CIE L*a*b* colour space was designed to be perceptually uniform and device-independent, meaning equal numerical differences correspond to equal perceived colour differences. It is the international standard for colour specification in manufacturing.",
      },
      {
        heading: "L* — Lightness",
        body: "L* ranges from 0 (perfect black) to 100 (perfect white). A value of 50 is a medium grey. For leather, most production colours fall between L*15 (deep black) and L*80 (near-white crust). Lightness is the strongest predictor of perceived colour quality — even small L* errors are visible to the eye.",
      },
      {
        heading: "a* — Red/Green axis",
        body: "a* ranges from approximately -128 (pure green) to +128 (pure red). For leather: warm browns, tans, and reds have positive a* (typically +5 to +30). Blues and greys have negative a* (typically -2 to -15). Neutral greys and blacks hover near a*=0.",
      },
      {
        heading: "b* — Blue/Yellow axis",
        body: "b* ranges from approximately -128 (pure blue) to +128 (pure yellow). Leather colours with warm undertones (tan, cognac, orange) have high positive b* (15–45). Cool blues and blacks have negative b* (-5 to -25). Vegetable-tanned leather substrates start with high b* due to their natural yellow-tan colour.",
      },
      {
        heading: "Measuring Lab* values",
        body: "Lab* values are measured with a spectrophotometer (e.g. Datacolor or X-Rite). Measure samples under D65 illuminant, 10° observer, specular excluded. Take measurements on the finished leather surface (not the flesh side). Average 3 readings from different points for accuracy.",
        tip: "When entering chemical Lab* values in TannerySim, measure a draw-down or test strip of the pure dye applied at 100% concentration on a standard substrate, not the shade as part of a recipe.",
      },
    ],
    resources: [
      { title: "Colour Appearance Models — University of Leeds", url: "https://eps.leeds.ac.uk/colour-science", type: "course", free: true },
      { title: "X-Rite Lab* Tutorial", url: "https://www.xrite.com/learning/educational-resources", type: "video", free: true },
      { title: "Bruce Lindbloom's Colour Calculator", url: "http://www.brucelindbloom.com", type: "reference", free: true },
    ],
    relatedIds: ["colour-deltae", "colour-predict", "colour-meta"],
  },

  {
    id: "colour-deltae",
    category: "colour",
    title: "Understanding Delta E (ΔE)",
    description: "What ΔE means, how to interpret it, and which formula TannerySim uses.",
    readTime: 6,
    difficulty: "beginner",
    sections: [
      {
        heading: "What is Delta E?",
        body: "Delta E (ΔE) is a single number expressing the total colour difference between two samples in Lab* space. It is the Euclidean distance between two Lab* coordinates. A ΔE of 0 means identical colours. A ΔE of 1 is just barely perceptible under ideal conditions to a trained observer.",
      },
      {
        heading: "ΔE76 — the simple formula",
        body: "TannerySim uses ΔE76 (also called CIE76): ΔE = √[(ΔL*)² + (Δa*)² + (Δb*)²]. It is simple, fast, and well understood, but it treats all directions in Lab* space equally which does not perfectly match human perception — we are more sensitive to hue shifts than lightness shifts in some colour regions.",
      },
      {
        heading: "Interpreting ΔE values",
        body: "ΔE < 1.0: Imperceptible difference. ΔE 1.0–2.0: Perceptible to trained observers — excellent for most applications. ΔE 2.0–3.5: Acceptable for most production, barely noticeable to consumers. ΔE 3.5–5.0: Noticeable difference, borderline acceptable. ΔE > 5.0: Clearly different — typically rejected in quality control.",
        tip: "Most automotive and luxury goods specifications require ΔE ≤ 1.5. Fashion footwear typically accepts ΔE ≤ 2.5. Mass-market goods may accept ΔE ≤ 3.5.",
      },
      {
        heading: "ΔE and the TannerySim prediction model",
        body: "The ΔE displayed in TannerySim is the distance between your predicted Lab* (from the recipe) and your entered target Lab*. Because the prediction model is a simplified blending model, the actual ΔE measured on real leather will differ from the simulated ΔE. Use the simulated ΔE as a directional guide, not an absolute spec.",
      },
    ],
    resources: [
      { title: "ΔE Calculator — EasyRGB", url: "https://www.easyrgb.com/en/math.php", type: "reference", free: true },
      { title: "Understanding ΔE — X-Rite", url: "https://www.xrite.com/learning", type: "article", free: true },
    ],
    relatedIds: ["colour-lab", "colour-de2000", "colour-predict"],
  },

  {
    id: "colour-de2000",
    category: "colour",
    title: "ΔE76 vs ΔE2000",
    description: "When to use each formula and why the more complex ΔE2000 was developed.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Limitations of ΔE76",
        body: "ΔE76 treats all Lab* directions equally, but human vision is not isotropic. We are more sensitive to chroma differences in blues than in yellows. We are more tolerant of lightness differences in near-neutral colours. These perceptual irregularities mean ΔE76 sometimes passes colours that look wrong and fails colours that look fine.",
      },
      {
        heading: "ΔE2000 — a perceptually uniform formula",
        body: "ΔE2000 (CIEDE2000) adds correction terms for lightness, chroma, and hue weighting, plus a rotation term for blue-purple colours. It is significantly more accurate in predicting perceived colour differences but is mathematically complex. It is the preferred formula for automotive, aerospace, and luxury goods colour specifications.",
      },
      {
        heading: "Which should you use?",
        body: "For general leather colour work and the TannerySim simulation model, ΔE76 is sufficient — the prediction uncertainty of the blending model is larger than the difference between ΔE76 and ΔE2000 anyway. For instrument-based QC (spectrophotometer measurements of production batches), use ΔE2000 as specified in ISO 11664-6.",
      },
    ],
    resources: [
      { title: "CIEDE2000 — Wikipedia overview", url: "https://en.wikipedia.org/wiki/Color_difference#CIEDE2000", type: "article", free: true },
      { title: "Measuring Colour — Hunt & Pointer (textbook)", url: "https://www.wiley.com", type: "reference", free: false },
    ],
    relatedIds: ["colour-deltae", "colour-lab", "adv-calibration"],
  },

  {
    id: "colour-predict",
    category: "colour",
    title: "How Colour Prediction Works",
    description: "The science behind TannerySim's recipe-to-colour prediction engine.",
    readTime: 6,
    difficulty: "intermediate",
    sections: [
      {
        heading: "The blending model",
        body: "TannerySim uses a weighted Lab* blending model. Each chemical step contributes its Lab* colour in proportion to its percentage concentration. Steps are accumulated iteratively, and the total chemical influence is blended with the substrate base colour based on a total concentration factor (clamped to 0–100%).",
      },
      {
        heading: "Influence factor",
        body: "The influence factor (I) = min(totalPercentage / 100, 1). When I=0, the result is the pure substrate colour. When I=1, the result is the weighted average of all chemical Lab* values. This models the intuitive idea that more chemical = more colour change, with diminishing returns above saturation.",
      },
      {
        heading: "Limitations of the model",
        body: "Real leather dyeing is far more complex. The actual colour depends on: pH during fixation, drum speed and float ratio, fibre type and tannage, dye-to-dye interactions (metachromasy, antagonism), penetration depth, and surface finish. The blending model captures the first-order colour direction but not second-order interactions.",
        warning: "Never use TannerySim predictions as a substitute for a physical trial. Always verify on production substrate with your actual chemicals.",
      },
      {
        heading: "Improving prediction accuracy",
        body: "Accuracy improves when: (1) Lab* values are measured on your specific substrate, not a generic one, (2) chemical Lab* values are measured at the concentrations you actually use, not at 100%, (3) you calibrate the model by running trials and adjusting the chemical Lab* to match actual measured outcomes.",
      },
    ],
    resources: [],
    relatedIds: ["colour-lab", "colour-deltae", "adv-calibration", "adv-optimise"],
  },

  {
    id: "colour-meta",
    category: "colour",
    title: "Metamerism in Leather",
    description: "Why two leathers can match under one light and look different under another.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "What is metamerism?",
        body: "Metamerism occurs when two colour samples match under one illuminant but differ under another. This happens because their spectral reflectance curves cross — they reflect different wavelengths but in combinations that produce the same Lab* under specific lighting conditions.",
      },
      {
        heading: "Why it matters in leather",
        body: "A shoe upper and lining that match in the factory (under D65 fluorescent light) may look very different in sunlight (D50) or incandescent light (A). This is a major quality issue in fashion goods where colour matching across components (leather, synthetic linings, threads) is critical.",
        warning: "Metameric pairs are especially common when matching chrome-tanned leather to synthetic materials — their spectral signatures are fundamentally different.",
      },
      {
        heading: "Measuring metamerism",
        body: "Calculate Metamerism Index (MI) per ISO 23603 / ASTM E2160: measure Lab* under D65 and A illuminants. ΔE between the two sets reveals the MI. MI < 0.5 is imperceptible. MI > 1.5 is commercially significant.",
      },
      {
        heading: "Minimising metamerism",
        body: "Match using dyes with similar spectral curves to the reference (same dye chemistry family). Avoid mixing many dye classes in one recipe when matching to a synthetic. Use a light booth with multiple illuminants to check matches during development.",
      },
    ],
    resources: [
      { title: "GTI Graphic Technology — Light Booth Guide", url: "https://www.gtigraphictechnology.com", type: "reference", free: true },
      { title: "ISO 23603 — Metamerism Index", url: "https://www.iso.org", type: "reference", free: false },
    ],
    relatedIds: ["colour-lab", "colour-illuminant", "colour-fastness"],
  },

  {
    id: "colour-illuminant",
    category: "colour",
    title: "Standard Illuminants and Light Booths",
    description: "D65, D50, A, F2, TL84 — what they are and how to use them in colour assessment.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Standard illuminants",
        body: "A standard illuminant is a mathematical description of a light source used for colour measurement. D65 (daylight, 6500K) is the most common in colour measurement — it is the default for spectrophotometer measurements and for the Lab* values in TannerySim. D50 (5000K daylight) is used in graphic arts. Illuminant A (2856K tungsten) represents incandescent light. F2 and TL84 are common store fluorescent lights.",
      },
      {
        heading: "The light booth",
        body: "A standardised light booth (e.g. Verivide CAC 120) provides controlled illumination for visual colour assessment. It contains multiple illuminant sources you can switch between. Always assess leather colour matches in a light booth — judgement under ceiling fluorescents is unreliable.",
      },
      {
        heading: "Colour assessment protocol",
        body: "1. Condition samples (23°C, 50% RH for 24h). 2. Place sample and standard side by side, same area. 3. Assess at 45° viewing angle. 4. Check under D65 first, then A, then TL84. 5. Record your assessment on a grey scale (ISO 105-A02) for standardisation.",
      },
    ],
    resources: [
      { title: "Verivide CAC Light Booths", url: "https://verivide.com", type: "reference", free: true },
      { title: "ISO 3668 — Visual Assessment of Colour", url: "https://www.iso.org", type: "reference", free: false },
    ],
    relatedIds: ["colour-meta", "colour-fastness", "colour-lab"],
  },

  {
    id: "colour-fastness",
    category: "colour",
    title: "Colour Fastness Testing",
    description: "The main colour fastness tests for leather and what the results mean.",
    readTime: 6,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Why colour fastness matters",
        body: "A beautifully matched colour is useless if it fades in sunlight, rubs off on clothing, or bleeds when wet. Colour fastness tests simulate end-use conditions to predict how a leather will perform in the field.",
      },
      {
        heading: "Rub fastness (ISO 11640)",
        body: "A felt pad rubs the leather surface under defined load (dry and wet). The felt is rated on a grey scale (1–5) for staining. Grade 4–5 is acceptable for most uses. Poor rub fastness usually indicates insufficient dye fixation or a too-light surface finish coat.",
      },
      {
        heading: "Light fastness (ISO 105-B02)",
        body: "Samples are exposed to a xenon arc lamp (simulating D65 daylight) in a Xenotest chamber. Rated on a blue wool scale (1–8): 8 = no fade. Most leather applications require grade 4–5 minimum. Metallised dyes have the highest lightfastness; some direct dyes are poor.",
      },
      {
        heading: "Migration and bleeding",
        body: "ISO 15700 tests migration of dye to PVC or fabric. Critical for shoe linings and upholstery. Use fixing agents (e.g. Fixogen LS) and avoid over-application of dye to minimise migration.",
      },
    ],
    resources: [
      { title: "SATRA Colour Fastness Testing Guide", url: "https://www.satra.com/colour", type: "reference", free: true },
      { title: "ISO 11640 Test Method", url: "https://www.iso.org", type: "reference", free: false },
    ],
    relatedIds: ["colour-meta", "colour-illuminant", "adv-standards"],
  },

  /* ── Recipe Studio ───────────────────────────────────────────────── */
  {
    id: "studio-steps",
    category: "studio",
    title: "Building Chemical Steps",
    description: "How to structure recipe steps, choose chemicals, and set process parameters.",
    readTime: 6,
    difficulty: "beginner",
    sections: [
      {
        heading: "Opening the steps panel",
        body: "In the Recipe Studio, click the 'Steps' button in the top-left of the header to expand the left panel. Each recipe step represents one chemical application in the drum.",
      },
      {
        heading: "Selecting a chemical",
        body: "Click 'Add Step' then select a chemical from the dropdown. The dropdown shows all chemicals in your catalogue plus community chemicals. If you don't see a chemical, go to the Chemical Catalogue and add it first.",
      },
      {
        heading: "Process parameters",
        body: "For each step set: % Weight (percentage of shaved weight — e.g. 3% dye), Temperature (°C — e.g. 60°C for dyeing, 50°C for fatliquoring), Duration (minutes — e.g. 60 min drum run). These parameters are stored with the recipe and printed in the process sheet but currently only % weight affects the colour prediction.",
      },
      {
        heading: "Step order and process logic",
        body: "Order your steps to match your actual drum sequence. A typical wet finishing sequence: 1. Wash, 2. Dispersing syntan, 3. Polymeric retan, 4. Auxiliary dye (pre-dyeing), 5. Main dye(s), 6. Levelling time, 7. Acid fixation, 8. Fatliquor, 9. Second fixation, 10. Wash out.",
        tip: "Even though step order does not change the current colour prediction, keeping it accurate makes the recipe useful as a process instruction sheet.",
      },
    ],
    resources: [],
    relatedIds: ["gs-first-recipe", "studio-target", "studio-save"],
  },

  {
    id: "studio-target",
    category: "studio",
    title: "Setting and Matching Target Colours",
    description: "Use the target colour panel to measure ΔE against your specification.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Enabling target colour",
        body: "In the Properties panel (right side of Studio), find the 'Target Colour' section and click 'On'. Three sliders appear for L*, a*, and b*.",
      },
      {
        heading: "Entering your target Lab*",
        body: "If you have spectrophotometer data, enter the L*, a*, b* values directly using the sliders or by clicking the numeric readout. If you are matching a Pantone, use an online converter or spectrophotometer reading to get the Lab* equivalent.",
      },
      {
        heading: "Reading the ΔE",
        body: "The Colour Prediction panel shows two swatches side by side — predicted vs target — along with the ΔE value and a quality rating (Excellent/Good/Acceptable/Poor). Adjust your recipe steps and concentrations to drive the ΔE down.",
      },
      {
        heading: "Interpreting the swatches",
        body: "The colour swatches are rendered in sRGB from the Lab* values, so they are approximate — monitor calibration, ambient light, and screen settings all affect perception. Use the swatches for direction only, not for absolute colour judgement.",
        warning: "Do not approve a colour match based on screen swatches alone. Always measure physical trials on a spectrophotometer.",
      },
    ],
    resources: [],
    relatedIds: ["colour-deltae", "studio-steps", "gs-first-recipe"],
  },

  {
    id: "studio-save",
    category: "studio",
    title: "Saving, Versioning, and Managing Recipes",
    description: "How recipes are stored, how versioning works, and how to find and edit saved recipes.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Saving a recipe",
        body: "Click 'Save' in the Studio header. The recipe is saved with: name, substrate, all steps, target Lab* (if set), predicted Lab*, and ΔE. Saving is instant — there is no auto-save, so save regularly during development.",
      },
      {
        heading: "Versioning",
        body: "Each save increments the recipe version number (v1, v2, etc.). This gives you a version history trail visible in the Recipe Library. Future versions of TannerySim will support full version comparison and rollback.",
        tip: "Use descriptive names like 'Navy Chrome Calf — Trial 3 (acid increased)' to make version history meaningful.",
      },
      {
        heading: "Finding and editing saved recipes",
        body: "Navigate to the Recipe Library. Click any recipe card to open it in the Studio in edit mode. All previous settings (steps, substrate, target) are restored. Make changes and click Save to update the recipe.",
      },
      {
        heading: "Recipe status",
        body: "Recipes are created with status 'draft'. Future status options will include 'in-trial', 'approved', and 'archived' to support production workflows.",
      },
    ],
    resources: [],
    relatedIds: ["gs-first-recipe", "studio-steps", "adv-optimise"],
  },

  {
    id: "studio-3d",
    category: "studio",
    title: "Reading the 3D Preview",
    description: "What the 3D viewer shows, how to interact with it, and how to interpret the render.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Real-time colour update",
        body: "The 3D viewer updates in real time as you add or modify recipe steps. The leather colour interpolates smoothly to the new predicted colour using a lerp (linear interpolation) at 8% per frame — so you see a smooth transition rather than a sudden jump.",
      },
      {
        heading: "Product mockup selector",
        body: "Use the bottom-left dropdown to switch between: Leather Swatch, Bifold Wallet, Card Holder, Belt, Tote Bag, and Notebook Cover. Each product uses the same hyperrealistic leather material — PBR roughness, normal maps, and ambient occlusion — so the colour reads correctly in context.",
      },
      {
        heading: "Environment lighting",
        body: "The bottom-right dropdown selects the HDRI environment: Studio (neutral, good for colour assessment), Warehouse (industrial), Sunset (warm), Dawn (cool), Forest (green ambient), Lobby (warm interior). Different environments will make the same colour appear different — this is realistic and expected.",
      },
    ],
    resources: [],
    relatedIds: ["viewer-controls", "viewer-products", "studio-steps"],
  },

  /* ── Chemical Catalogue ─────────────────────────────────────────── */
  {
    id: "cat-adding",
    category: "catalogue",
    title: "Adding Chemicals Manually",
    description: "How to add individual chemicals with full Lab* colour data.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Opening the form",
        body: "Go to the Chemical Catalogue and click 'Add Chemical'. The form requires: name, category. All other fields are optional but strongly recommended for colour prediction.",
      },
      {
        heading: "Essential fields",
        body: "Name: the commercial trade name (e.g. 'Erionyl Blue A-R'). Supplier: manufacturer name. Category: select from the dropdown (dye, fatliquor, retanning agent, surfactant, acid, base, fixing agent, other). Colour Index: the CI number from the supplier TDS (e.g. 'CI Acid Blue 113'). This lets you identify the chemistry across suppliers.",
      },
      {
        heading: "Entering Lab* values",
        body: "Lab* values are the most important data for colour prediction. Measure them on a standard draw-down: apply the pure dye at 1% concentration on your standard white chrome substrate, dry, measure with a spectrophotometer under D65. Enter L*, a*, b* in the three fields. Without these values, the chemical contributes to process steps but not to colour prediction.",
        tip: "Create a reference library of Lab* values for your core chemicals — this is the most valuable thing you can do to improve prediction accuracy.",
      },
    ],
    resources: [],
    relatedIds: ["cat-lab", "cat-csv", "cat-ci"],
  },

  {
    id: "cat-lab",
    category: "catalogue",
    title: "Understanding Lab* Chemical Data",
    description: "What Lab* values mean for chemicals, how to measure them correctly, and how they drive prediction.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Chemical Lab* vs substrate Lab*",
        body: "A chemical's Lab* value represents the colour that chemical contributes when applied in isolation. For dyes: the Lab* of the resulting leather colour at a defined concentration (typically 1% or 2%) on a standard white substrate. For fatliquors and syntans with no colour: leave Lab* blank — they will not affect colour prediction.",
      },
      {
        heading: "Concentration effects",
        body: "The same dye at 1% may give L*=65 while at 5% it gives L*=25. TannerySim's current model treats Lab* as fixed per chemical, not concentration-dependent. For best accuracy, measure your Lab* at the typical concentration you use that chemical, not at 1%.",
      },
      {
        heading: "Substrate dependency",
        body: "A navy dye measured on white chrome-tan substrate (L*72, near-neutral) will have different Lab* than the same dye measured on goat veg-tan (L*68, warm yellow). Ideally, measure and store Lab* values per substrate type.",
      },
    ],
    resources: [
      { title: "Datacolor Spectrophotometers — Learning Centre", url: "https://www.datacolor.com/learning-center", type: "reference", free: true },
    ],
    relatedIds: ["cat-adding", "colour-lab", "colour-predict"],
  },

  {
    id: "cat-ci",
    category: "catalogue",
    title: "Colour Index Numbers Explained",
    description: "How CI numbers classify dye chemistry and why they matter for cross-supplier matching.",
    readTime: 4,
    difficulty: "intermediate",
    sections: [
      {
        heading: "What is a Colour Index number?",
        body: "The Colour Index (CI) is an international classification system managed by the Society of Dyers and Colourists (SDC) and the American Association of Textile Chemists and Colorists (AATCC). Every commercial dye is assigned a CI Generic Name (e.g. CI Acid Blue 113) and a CI Number (e.g. 26360).",
      },
      {
        heading: "CI name structure",
        body: "CI Generic Name = [Dye class] [Hue] [Serial number]. Examples: 'CI Acid Red 361' = acid dye class, red hue, number 361. 'CI Direct Black 22' = direct dye, black, number 22. The CI class corresponds to the application class (Acid, Direct, Reactive, etc.).",
      },
      {
        heading: "Using CI numbers in TannerySim",
        body: "Entering the CI number for a chemical lets you identify equivalent products from different suppliers. For example, Clariant's 'Erionyl Blue 2 GLW' and BASF's 'Lurazol Blue 2GL' may share the same CI number, meaning they are the same chromophore and will behave identically in a recipe.",
        tip: "Always verify CI numbers on the technical data sheet, not just the product name. Trade names can be misleading.",
      },
    ],
    resources: [
      { title: "Colour Index International", url: "https://colour-index.com", type: "reference", free: false },
    ],
    relatedIds: ["cat-adding", "chem-dye"],
  },

  {
    id: "cat-csv",
    category: "catalogue",
    title: "Importing Chemicals via CSV",
    description: "How to prepare and import a bulk chemical spreadsheet into TannerySim.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Required CSV format",
        body: "The import expects columns: name (required), category (required — must be one of: dye, fatliquor, retanning_agent, surfactant, acid, base, fixing_agent, other), supplier, colour_index, lab_l, lab_a, lab_b. Column headers must match exactly.",
      },
      {
        heading: "Preparing your spreadsheet",
        body: "Export your existing chemical inventory from Excel or Google Sheets. Rename columns to match the required headers. Set category values to the exact enum strings (e.g. 'retanning_agent' not 'retan' or 'Retanning Agent'). Lab* values should be decimal numbers with one or two decimal places.",
        tip: "Download the sample template from the import dialog to get a pre-formatted CSV with example data.",
      },
      {
        heading: "Running the import",
        body: "Click 'Import CSV' in the Catalogue header, select your file, and review the preview. The importer shows how many rows it detected and any format errors. Click 'Import' to bulk-insert all valid rows. Failed rows are skipped and listed in the error log.",
      },
    ],
    resources: [],
    relatedIds: ["cat-adding", "cat-lab", "trouble-csv"],
  },

  /* ── 3D Viewer ───────────────────────────────────────────────────── */
  {
    id: "viewer-controls",
    category: "viewer",
    title: "3D Viewer Navigation Controls",
    description: "Every mouse, touch, and keyboard control for navigating the 3D leather viewer.",
    readTime: 3,
    difficulty: "beginner",
    sections: [
      {
        heading: "Orbit (rotate)",
        body: "Left-click and drag to rotate around the leather object. On touch devices, use one finger to orbit. The camera orbits around the object centre — the leather stays fixed.",
      },
      {
        heading: "Zoom",
        body: "Scroll the mouse wheel to zoom in and out. On touch, pinch to zoom. Minimum distance is 1.2 units; maximum is 7 units. The camera has damping enabled — movement slows down smoothly after you release.",
      },
      {
        heading: "Pan",
        body: "Right-click and drag to pan (translate the view). On a trackpad, use two-finger drag. Pan moves the camera laterally without rotating.",
      },
      {
        heading: "Reset view",
        body: "Double-click the leather object to reset the camera to its default position. Alternatively, refresh the page to fully reset the viewer state.",
      },
      {
        heading: "Environment and product selectors",
        body: "The bottom-left dropdown switches the product mockup shape (Swatch, Wallet, Card Holder, Belt, Tote Bag, Notebook). The bottom-right dropdown changes the HDRI environment lighting. Both update instantly without resetting the camera position.",
      },
    ],
    resources: [],
    relatedIds: ["viewer-products", "viewer-lighting", "studio-3d"],
  },

  {
    id: "viewer-products",
    category: "viewer",
    title: "Product Mockups Guide",
    description: "What each product mockup represents, its geometry, and how to use it effectively.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Leather Swatch",
        body: "A flat panel of leather with subtle drape (displacement mapped surface). Best for pure colour assessment — eliminates shape shadows that may confuse colour perception. Use this as your baseline colour reference.",
      },
      {
        heading: "Bifold Wallet",
        body: "A thin box representing a folded leather wallet. Shows how the colour reads on a structured, angled surface. The fold seam creates a shadow line that reveals the leather's depth and gloss level.",
      },
      {
        heading: "Card Holder",
        body: "A very slim, flat card case. Good for checking how the colour appears on precision-cut edges and tight grain areas. The slot detail adds visual interest.",
      },
      {
        heading: "Belt",
        body: "A curved leather strip with metal buckle. The curve demonstrates how the leather reacts to highlights and shadows across a non-flat surface. The metallic buckle provides a useful contrast reference.",
      },
      {
        heading: "Tote Bag",
        body: "A structured tote with handle tubes. Most complex shape — shows the colour across multiple planes, curves, and the handle cross-section. Best for visualising how a colour will read in a finished goods context.",
      },
      {
        heading: "Notebook Cover",
        body: "A slightly curved cover showing texture across a wider surface. The spine element adds a structural detail. Good for stationery, portfolio, and document holder applications.",
      },
    ],
    resources: [],
    relatedIds: ["viewer-controls", "viewer-lighting", "studio-3d"],
  },

  {
    id: "viewer-lighting",
    category: "viewer",
    title: "Environment Lighting Presets",
    description: "How HDRI lighting affects colour perception and which preset to use for different purposes.",
    readTime: 3,
    difficulty: "beginner",
    sections: [
      {
        heading: "Why lighting matters",
        body: "The same leather colour can look dramatically different under different light sources. This is the same principle as light booth assessment — the 3D viewer lets you preview this digitally across six environments.",
      },
      {
        heading: "Studio",
        body: "Neutral white light from multiple directions. Best for colour assessment — minimises coloured ambient light that could skew your perception. Use Studio when making decisions about whether a shade matches your spec.",
      },
      {
        heading: "Warehouse and Lobby",
        body: "Industrial fluorescent and warm interior environments. Use these to simulate how the product will look in retail and storage contexts.",
      },
      {
        heading: "Sunset and Dawn",
        body: "Warm orange and cool blue ambient light respectively. Use these to check how your colour reads in extreme lighting conditions — important for fashion and automotive products that will be seen outdoors.",
      },
      {
        heading: "Forest",
        body: "Strong green ambient light from foliage. Useful for checking colour neutrality — neutrals should stay neutral. Colours with strong complementary red/green content may look very different here.",
      },
    ],
    resources: [],
    relatedIds: ["viewer-controls", "viewer-products", "colour-illuminant"],
  },

  /* ── Advanced Topics ─────────────────────────────────────────────── */
  {
    id: "adv-calibration",
    category: "advanced",
    title: "Calibration Workflows",
    description: "How to calibrate TannerySim predictions against your actual production results.",
    readTime: 8,
    difficulty: "advanced",
    sections: [
      {
        heading: "Why calibration is essential",
        body: "The default prediction model uses nominal Lab* values that may not reflect your specific chemicals, substrate, or process conditions. Calibration closes the gap between predicted and measured ΔE by adjusting the chemical Lab* values to match your real-world outcomes.",
      },
      {
        heading: "Run calibration trials",
        body: "For each key dye in your library: (1) Create a single-chemical recipe in TannerySim using your standard substrate. (2) Run a physical trial at the same concentration and process conditions. (3) Measure the resulting leather Lab* on a spectrophotometer. (4) Note the difference between predicted and measured Lab*.",
      },
      {
        heading: "Adjust chemical Lab* values",
        body: "In the Chemical Catalogue, edit the chemical and update its Lab* to the measured value from your trial. Now when that chemical is used in a recipe, the prediction will be based on your actual measured data, not the nominal value.",
      },
      {
        heading: "Multi-chemical calibration",
        body: "For recipes with multiple dyes, calibrate each dye individually first, then run combination trials to check the blending model accuracy. If the combined prediction still diverges significantly, consider adding correction factors by adjusting individual dye Lab* values empirically.",
        tip: "Build a calibration spreadsheet: for each dye, record nominal Lab*, trial-measured Lab*, and the difference. Use these deltas to track drift over time (e.g. if a dye batch changes).",
      },
      {
        heading: "Batch-to-batch variation",
        body: "Dye batches from the same supplier can vary. When a new batch arrives, run a standard calibration trial and update the Lab* value in TannerySim. This keeps your predictions current.",
      },
    ],
    resources: [
      { title: "Colour Management in Leather (AISBL publication)", url: "https://iultcs.org", type: "reference", free: true },
    ],
    relatedIds: ["colour-predict", "colour-lab", "adv-optimise"],
  },

  {
    id: "adv-optimise",
    category: "advanced",
    title: "Recipe Optimisation Strategies",
    description: "Systematic approaches to reduce ΔE, cost, and chemical load in your recipes.",
    readTime: 7,
    difficulty: "advanced",
    sections: [
      {
        heading: "Start with the substrate, not the chemistry",
        body: "Before adding chemicals, ask whether a different substrate gets you closer to your target. If you're trying to hit L*45 brown and your current substrate is L*72 white chrome, consider a pre-tanned or browned substrate that starts closer. Less chemistry = better fastness, lower cost, fewer process steps.",
      },
      {
        heading: "Use the dominant dye principle",
        body: "In most recipes, one dye drives the shade and others adjust it. Identify your dominant dye (closest Lab* to target) and set it first. Use secondary dyes only for hue correction (a* or b* adjustment) and a black if depth is needed. Avoid overcomplicating with more than 3–4 dyes.",
      },
      {
        heading: "Adjust one variable at a time",
        body: "When optimising, change only one parameter per trial. If you change both dye concentration and fixation pH simultaneously, you cannot know which change improved the ΔE. Systematic single-variable experimentation is slower but more informative.",
      },
      {
        heading: "Use TannerySim for rapid in-silico iteration",
        body: "Before running physical trials, use TannerySim to explore the effect of different dye combinations and concentrations. Narrow down from 10 possible recipes to 2–3 candidates in-silico, then trial only those. This can halve the number of physical trials needed.",
      },
      {
        heading: "Cost optimisation",
        body: "Once you have a recipe that achieves the target ΔE, consider cost optimisation: replace premium dyes with lower-cost equivalents that have the same CI number. Use the minimum effective concentration — run trials at 80% and 60% of your initial offer to find the minimum that still hits ΔE < 2.0.",
      },
    ],
    resources: [],
    relatedIds: ["adv-calibration", "colour-predict", "studio-steps"],
  },

  {
    id: "adv-standards",
    category: "advanced",
    title: "Industry Standards Overview",
    description: "The key ISO, ASTM, and AATCC standards relevant to leather colour and chemistry.",
    readTime: 7,
    difficulty: "advanced",
    sections: [
      {
        heading: "Why standards matter",
        body: "Colour and chemistry specifications in commercial contracts reference specific test standards. Knowing which standard applies to your market (footwear, automotive, luxury goods, furniture) tells you exactly how samples will be tested and what pass/fail criteria apply.",
      },
      {
        heading: "Colour measurement standards",
        body: "ISO 11664-4: CIE L*a*b* colour space definition. ISO 11664-6: CIEDE2000 formula. ASTM E308: computing colorimetric values. All these underlie spectrophotometer measurement. Ensure your instrument software is set to the correct standard for your specification.",
      },
      {
        heading: "Leather-specific colour tests",
        body: "ISO 11640: rub fastness (Crockmeter). ISO 105-B02: light fastness (xenon arc). ISO 15700: dye migration to PVC. ISO 17075: Chrome VI determination. SATRA TM174: colour fastness to perspiration. These are the most commonly cited in footwear and leather goods specifications.",
      },
      {
        heading: "Automotive leather standards",
        body: "Automotive OEMs have internal standards that are stricter than ISO: VDA 621-415 (Mercedes), PSA B15-5000, Volvo STD 1027. Automotive leather must pass: ΔE < 1.5 after 200h xenon (SAE J1885), rub fastness grade ≥ 4 wet, zero Chrome VI.",
      },
      {
        heading: "Sustainability standards",
        body: "Leather Working Group (LWG) audit protocol includes colour chemical restrictions aligned with REACH and California Prop 65. bluesign, OEKO-TEX Leather Standard, and ZDHC MRSL (Manufacturing Restricted Substances List) restrict specific dye classes (e.g. azo dyes cleaving to carcinogenic amines).",
      },
    ],
    resources: [
      { title: "Leather Working Group Protocol", url: "https://www.leatherworkinggroup.com", type: "reference", free: true },
      { title: "ZDHC MRSL", url: "https://www.roadmaptozero.com", type: "reference", free: true },
      { title: "ISO Leather Standards", url: "https://www.iso.org/ics/59.140.30.html", type: "reference", free: false },
    ],
    relatedIds: ["colour-fastness", "chem-safety", "adv-calibration"],
  },

  {
    id: "adv-spectro",
    category: "advanced",
    title: "Spectrophotometry Integration",
    description: "How to use a spectrophotometer with TannerySim for accurate colour capture and recipe calibration.",
    readTime: 6,
    difficulty: "advanced",
    sections: [
      {
        heading: "Choosing a spectrophotometer",
        body: "Bench-top instruments (Datacolor 800, X-Rite Ci7800) offer the best accuracy for production QC. Portable instruments (X-Rite i1Pro, Konica Minolta CM-700d) are practical for lab and production floor use. For leather, use 45°/0° or sphere geometry instruments. Ensure D65 illuminant and 10° standard observer.",
      },
      {
        heading: "Measurement conditions",
        body: "Condition samples at 23°C ±2°C and 50% ±5% RH for at least 4 hours. Measure on the grain side. Take 3 readings at different positions and average. Use the same instrument and calibration tile for all measurements in a project.",
      },
      {
        heading: "Exporting Lab* from your instrument",
        body: "Most spectrophotometers export data as CSV or through software (Datacolor TOOLS, X-Rite ColorCert). Export the L*, a*, b* columns. Enter these values in TannerySim: substrate Lab* in the substrate definition, chemical Lab* in the chemical catalogue, target Lab* in the recipe target panel.",
      },
      {
        heading: "Closing the loop",
        body: "The ideal workflow: 1. Enter target Lab* from spectrophotometer. 2. Build recipe in TannerySim. 3. Run physical trial. 4. Measure trial result. 5. Enter measured Lab* as new target, compare with prediction. 6. Update chemical Lab* to close the gap. Repeat for each recipe until predictions are reliable.",
      },
    ],
    resources: [
      { title: "Datacolor Leather Solutions", url: "https://www.datacolor.com/business-solutions/textile-leather", type: "reference", free: true },
      { title: "X-Rite i1Pro — Getting Started", url: "https://www.xrite.com/service-support/getting-started", type: "reference", free: true },
    ],
    relatedIds: ["adv-calibration", "colour-lab", "colour-deltae"],
  },

  {
    id: "adv-stat",
    category: "advanced",
    title: "Statistical Colour Matching",
    description: "Using design of experiments (DoE) and regression to systematically develop recipes.",
    readTime: 8,
    difficulty: "advanced",
    sections: [
      {
        heading: "The problem with trial-and-error",
        body: "Random recipe adjustment is slow and often leads to local minima — you find a recipe that works but it may not be the most cost-effective or robust formulation. Statistical methods let you map the relationship between chemical concentrations and colour outcomes systematically.",
      },
      {
        heading: "Design of Experiments (DoE)",
        body: "DoE involves choosing a structured set of trials that efficiently explore a multi-variable space. For leather: define 2–4 dye variables, set min/max concentration levels, and use a factorial or central composite design to generate trial combinations. After running and measuring all trials, fit a response surface model.",
      },
      {
        heading: "Response surface modelling",
        body: "Fit a regression model: ΔL* = f(c1, c2, c3...), Δa* = f(c1, c2, c3...), Δb* = f(c1, c2, c3...). Use this model to predict the optimal concentrations that minimise ΔE to target. Free tools: JMP (trial available), R (free, packages: rsm), Python (scikit-learn).",
      },
      {
        heading: "Robustness testing",
        body: "Once a recipe is developed, test its robustness: vary each factor ±10% and see how much ΔE changes. A robust recipe maintains ΔE < 2 despite small process variations. A fragile recipe needs tight process control to be reproducible.",
      },
    ],
    resources: [
      { title: "Design of Experiments — NIST Engineering Statistics Handbook", url: "https://www.itl.nist.gov/div898/handbook", type: "reference", free: true },
      { title: "R language for DoE (rsm package)", url: "https://cran.r-project.org/web/packages/rsm", type: "reference", free: true },
    ],
    relatedIds: ["adv-optimise", "adv-calibration", "colour-predict"],
  },

  /* ── Troubleshooting ─────────────────────────────────────────────── */
  {
    id: "trouble-deltae",
    category: "trouble",
    title: "ΔE is Consistently High",
    description: "Diagnose and fix poor colour matching in your recipes.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Check your chemical Lab* values",
        body: "The most common cause of high ΔE is incorrect chemical Lab* data. Verify that your dye Lab* values were measured on the same substrate you are predicting for, at the correct concentration. A dye measured on veg-tan cannot accurately predict behaviour on chrome-tan.",
      },
      {
        heading: "Check your substrate selection",
        body: "The substrate base Lab* is the starting point for prediction. If your actual substrate differs from the one in TannerySim (different tannage, different shade of wet-blue), the prediction will be off from the start. Create a custom substrate with your actual measured base Lab*.",
      },
      {
        heading: "Are you missing important steps?",
        body: "If you have a retan that shifts colour (e.g. a mimosa extract that adds warmth), make sure it is in the recipe with a Lab* value. Non-coloured syntans and fatliquors can be left with null Lab* without affecting prediction, but coloured retans must be included.",
      },
      {
        heading: "Physical vs predicted: expected divergence",
        body: "A ΔE of 2–4 between prediction and physical trial is normal for the current blending model. If your simulated ΔE is 1.0 but your measured physical ΔE is 5.0, this is a calibration issue — run trials and update your chemical Lab* values as described in the Calibration guide.",
      },
    ],
    resources: [],
    relatedIds: ["adv-calibration", "colour-deltae", "colour-predict"],
  },

  {
    id: "trouble-colour",
    category: "trouble",
    title: "Unexpected Colour Shifts",
    description: "Why real leather looks different from the prediction and how to diagnose root causes.",
    readTime: 5,
    difficulty: "intermediate",
    sections: [
      {
        heading: "Metachromasy — dye shade shift with pH",
        body: "Some dyes shift shade when pH changes. If your production process uses different acid fixation than your calibration trial, the shade may shift. Check the dye TDS for pH sensitivity and ensure your process pH matches your calibration conditions.",
      },
      {
        heading: "Temperature effects",
        body: "Higher drum temperature accelerates dye exhaustion but can cause uneven shade or surface rings. If your trial was at 60°C and production runs at 50°C, the shade will be lighter (less exhaustion). Standardise temperature carefully.",
      },
      {
        heading: "Float ratio",
        body: "Float ratio (water to leather weight, e.g. 100% float = 1kg water per 1kg leather) strongly affects dye concentration and exhaustion rate. Higher float = lower dye concentration = lighter shade. Ensure your trial and production float ratios match.",
      },
      {
        heading: "Retan interactions",
        body: "Certain syntans (particularly phenol-based) have a strong affinity for anionic dyes and can 'trap' them on the surface, causing shade shift and poor penetration. If you changed your retan and the shade shifted, this is likely the cause.",
        warning: "Never diagnose a colour problem by changing multiple variables at once. Change one thing per trial.",
      },
    ],
    resources: [],
    relatedIds: ["trouble-deltae", "chem-dye", "chem-ph", "adv-calibration"],
  },

  {
    id: "trouble-csv",
    category: "trouble",
    title: "CSV Import Issues",
    description: "Fix common errors when importing chemicals from a spreadsheet.",
    readTime: 3,
    difficulty: "beginner",
    sections: [
      {
        heading: "Category values must be exact",
        body: "The category column must contain exactly one of: dye, fatliquor, retanning_agent, surfactant, acid, base, fixing_agent, other. Common mistakes: 'Dye' (capital D), 'retanning agent' (with space), 'retan'. Check for trailing spaces too.",
      },
      {
        heading: "Numeric fields",
        body: "Lab* columns (lab_l, lab_a, lab_b) must be numbers, not text. Remove any units (e.g. '65.4 L*' should be '65.4'). Remove any commas used as decimal separators — use periods/dots. Empty cells are acceptable for optional fields.",
      },
      {
        heading: "Encoding issues",
        body: "Save your CSV as UTF-8 encoding. Files exported from Excel on Windows sometimes use Windows-1252 encoding which can corrupt special characters (°, é, etc.) in chemical names. In Excel: File → Save As → CSV UTF-8.",
      },
    ],
    resources: [],
    relatedIds: ["cat-csv", "cat-adding"],
  },

  {
    id: "trouble-viewer",
    category: "trouble",
    title: "3D Viewer Problems",
    description: "Fix black screens, missing textures, and performance issues in the 3D viewer.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "Black or dark background",
        body: "If the background appears very dark, your browser may not support WebGL2. Try Chrome or Firefox (latest versions). Ensure hardware acceleration is enabled: in Chrome, go to Settings → System → 'Use hardware acceleration when available'.",
      },
      {
        heading: "HDRI environment not loading",
        body: "Environment presets (Studio, Sunset, etc.) load HDR files from a CDN. If you are on a slow connection or behind a firewall that blocks external resources, the HDRI may fail to load. The viewer falls back to the base directional lights, which are still functional — the leather will be lit but the environment reflections will be absent.",
      },
      {
        heading: "Low frame rate",
        body: "The 3D viewer uses real-time PBR rendering which is GPU-intensive. On older or integrated GPU hardware, reduce performance load by: switching to the simple Swatch product (least complex geometry), using a neutral environment (Studio), and closing other GPU-heavy browser tabs.",
      },
      {
        heading: "Colour appears washed out",
        body: "The viewer uses ACESFilmic tone mapping for realistic HDR rendering. Very light colours (L* > 85) may appear slightly washed out in the viewer — this is a natural characteristic of the tone mapping curve, not a bug. The colour prediction values in the Properties panel remain accurate.",
      },
    ],
    resources: [],
    relatedIds: ["viewer-controls", "viewer-lighting", "studio-3d"],
  },

  {
    id: "trouble-account",
    category: "trouble",
    title: "Account and Data Issues",
    description: "Sign-in problems, missing data, and tannery provisioning issues.",
    readTime: 4,
    difficulty: "beginner",
    sections: [
      {
        heading: "No data after signing in",
        body: "If your Dashboard shows 0 recipes and 0 chemicals after signing in, your tannery may not have been provisioned. This can happen if you signed in via email confirmation link rather than the login form. Sign out and sign back in through the login form — this triggers tannery provisioning automatically.",
      },
      {
        heading: "No substrates in Studio",
        body: "Substrates are seeded as community defaults in the database. If you see no substrates in the Studio dropdown, your database may be missing the seed data. Contact support or check the migration status with your database administrator.",
      },
      {
        heading: "Forgot password",
        body: "Click 'Forgot password?' on the login page, enter your email, and check your inbox for a reset link. The link expires after 1 hour. If you don't receive it, check your spam folder or try a different email address.",
      },
      {
        heading: "Data not saving",
        body: "If recipes or chemicals fail to save, check your browser console for error messages. Common causes: not logged in (session expired), tannery not provisioned (see above), network connectivity issue. Try refreshing the page and signing in again.",
      },
    ],
    resources: [],
    relatedIds: ["gs-workspace", "gs-welcome"],
  },
];

/* ── Helper accessors ───────────────────────────────────────────────── */

export function getCategory(id: string): GuideCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getGuide(id: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}

export function getGuidesByCategory(categoryId: string): Guide[] {
  return GUIDES.filter((g) => g.category === categoryId);
}

export function searchGuides(query: string): Guide[] {
  const q = query.toLowerCase();
  return GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.sections.some((s) => s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
  );
}
