// Angliciser - content.js
// Converts American English to British English on page load

(function () {
  'use strict';

  // --- CONFIGURATION ---
  // Exchange rate: USD to GBP. Updated periodically via storage.
  // Falls back to a hardcoded approximation if fetch fails.
  const FALLBACK_USD_TO_GBP = 0.79;

  // --- WORD REPLACEMENTS ---
  // Order matters: longer/more specific phrases first to avoid partial matches.
  // Format: [americanism, british_equivalent]
  // These are applied as whole-word matches (case-insensitive, case-preserving).
  const WORD_REPLACEMENTS = [
    // Transport
    ["sidewalk",            "pavement"],
    ["crosswalk",           "pedestrian crossing"],
    ["freeway",             "motorway"],
    ["expressway",          "motorway"],
    ["highway",             "dual carriageway"],
    ["overpass",            "flyover"],
    ["underpass",           "subway"],
    ["traffic circle",      "roundabout"],
    ["rotary",              "roundabout"],
    ["center divider",      "central reservation"],
    ["median strip",        "central reservation"],
    ["gas station",         "petrol station"],
    ["parking lot",         "car park"],
    ["parking garage",      "multi-storey car park"],
    ["rest stop",           "service station"],
    ["truck stop",          "lorry park"],
    ["truck",               "lorry"],
    ["semi-truck",          "articulated lorry"],
    ["semi truck",          "articulated lorry"],
    ["pickup truck",        "pickup"],
    ["station wagon",       "estate car"],
    ["RV",                  "motorhome"],
    ["fender",              "wing"],
    ["hood",                "bonnet"],
    ["trunk",               "boot"],
    ["windshield",          "windscreen"],
    ["turn signal",         "indicator"],
    ["blinker",             "indicator"],
    ["license plate",       "number plate"],
    ["stick shift",         "manual gearbox"],
    ["manual transmission", "manual gearbox"],
    ["gas pedal",           "accelerator"],
    ["emergency brake",     "handbrake"],
    ["railroad",            "railway"],
    ["railroad car",        "railway carriage"],
    ["subway",              "underground"],
    ["metro",               "underground"],
    ["engineer",            "driver"],  // train context — risky but common

    // Food & drink
    ["french fries",        "chips"],
    ["potato chips",        "crisps"],
    ["chips",               "crisps"],   // after "french fries" so that doesn't get double-replaced
    ["cookie",              "biscuit"],
    ["cookies",             "biscuits"],
    ["candy",               "sweets"],
    ["cotton candy",        "candyfloss"],
    ["eggplant",            "aubergine"],
    ["zucchini",            "courgette"],
    ["arugula",             "rocket"],
    ["cilantro",            "coriander"],
    ["scallion",            "spring onion"],
    ["green onion",         "spring onion"],
    ["rutabaga",            "swede"],
    ["ground beef",         "mince"],
    ["hamburger meat",      "mince"],
    ["ground meat",         "mince"],
    ["broil",               "grill"],
    ["broiled",             "grilled"],
    ["broiler",             "grill"],
    ["appetizer",           "starter"],
    ["appetizers",          "starters"],
    ["entrée",              "main course"],
    ["entree",              "main course"],
    ["check",               "bill"],     // restaurant context
    ["to-go",               "takeaway"],
    ["takeout",             "takeaway"],
    ["diner",               "café"],
    ["soda",                "fizzy drink"],
    ["pop",                 "fizzy drink"],
    ["jello",               "jelly"],
    ["Jell-O",              "jelly"],
    ["powdered sugar",      "icing sugar"],
    ["confectioners' sugar","icing sugar"],
    ["confectioners sugar", "icing sugar"],
    ["heavy cream",         "double cream"],
    ["half and half",       "single cream"],
    ["whole milk",          "full-fat milk"],
    ["skim milk",           "skimmed milk"],
    ["nonfat milk",         "skimmed milk"],
    ["popsicle",            "ice lolly"],
    ["ice cream bar",       "choc ice"],
    ["whipped cream",       "whipped cream"],   // same — leave
    ["frosting",            "icing"],
    ["biscuit",             "scone"],    // American biscuit = British scone

    // Home & building
    ["apartment",           "flat"],
    ["condo",               "flat"],
    ["condominium",         "flat"],
    ["elevator",            "lift"],
    ["first floor",         "ground floor"],
    ["second floor",        "first floor"],
    ["third floor",         "second floor"],
    ["fourth floor",        "third floor"],
    ["fifth floor",         "fourth floor"],
    ["closet",              "wardrobe"],
    ["walk-in closet",      "walk-in wardrobe"],
    ["faucet",              "tap"],
    ["garbage can",         "bin"],
    ["trash can",           "bin"],
    ["garbage",             "rubbish"],
    ["trash",               "rubbish"],
    ["garbage bag",         "bin bag"],
    ["trash bag",           "bin bag"],
    ["dumpster",            "skip"],
    ["yard",                "garden"],
    ["backyard",            "back garden"],
    ["front yard",          "front garden"],
    ["lawn",                "garden"],
    ["band-aid",            "plaster"],
    ["bandaid",             "plaster"],
    ["Band-Aid",            "plaster"],

    // Clothing
    ["sneakers",            "trainers"],
    ["tennis shoes",        "trainers"],
    ["athletic shoes",      "trainers"],
    ["pants",               "trousers"],
    ["underpants",          "underpants"],   // same
    ["underwear",           "underwear"],    // same
    ["pantyhose",           "tights"],
    ["nylons",              "tights"],
    ["suspenders",          "braces"],
    ["vest",                "waistcoat"],
    ["undershirt",          "vest"],
    ["sweater",             "jumper"],
    ["sweatshirt",          "sweatshirt"],  // same
    ["turtle neck",         "polo neck"],
    ["turtleneck",          "polo neck"],
    ["diaper",              "nappy"],
    ["diapers",             "nappies"],
    ["pacifier",            "dummy"],
    ["stroller",            "pram"],
    ["baby carriage",       "pram"],
    ["purse",               "handbag"],
    ["fanny pack",          "bum bag"],

    // School & work
    ["math",                "maths"],
    ["recess",              "break time"],
    ["principal",           "headteacher"],
    ["valedictorian",       "head pupil"],
    ["grades",              "marks"],
    ["grade",               "mark"],
    ["report card",         "school report"],
    ["semester",            "term"],
    ["eraser",              "rubber"],
    ["thumbtack",           "drawing pin"],
    ["thumbtacks",          "drawing pins"],
    ["pushpin",             "drawing pin"],
    ["scotch tape",         "sellotape"],
    ["tape",                "sellotape"],
    ["vacation",            "holiday"],
    ["vacations",           "holidays"],

    // Money & business
    ["dollar store",        "pound shop"],

    ["liter",    "litre"],
    ["liters",   "litres"],
    ["milliliter",  "millilitre"],
    ["milliliters", "millilitres"],
    ["centiliter",  "centilitre"],
    ["centiliters", "centilitres"],

    // Technology
    ["cell phone",          "mobile phone"],
    ["cell",                "mobile"],
    ["cellphone",           "mobile phone"],
    ["zip code",            "postcode"],

    // Slang & idioms
    ["scuttlebutt",         "gossip"],
    ["ballpark",            "rough estimate"],
    ["ballpark figure",     "rough estimate"],
    ["gotten",              "got"],
    ["snuck",               "sneaked"],
    ["dove",                "dived"],    // past tense of dive
    ["pled",                "pleaded"],
    ["on the lam",          "on the run"],
    ["a dime a dozen",      "ten a penny"],
    ["hit a home run",      "knocked it out of the park"],
    ["knock it out of the park", "do brilliantly"],
    ["touch base",          "check in"],
    ["reach out",           "get in touch"],
    ["circle back",         "follow up"],
    ["ping",                "drop a message to"],
    ["leverage",            "use"],
    ["utilize",             "use"],
    ["utilization",         "use"],
    ["leverage",            "use"],
    ["gonna",               "going to"],
    ["wanna",               "want to"],
    ["gotta",               "got to"],
    ["kinda",               "rather"],
    ["sorta",               "somewhat"],
    ["coulda",              "could have"],
    ["shoulda",             "should have"],
    ["woulda",              "would have"],
    ["y'all",               "you lot"],
    ["you guys",            "you lot"],
    ["dude",                "mate"],
    ["buddy",               "mate"],
    ["pal",                 "mate"],
    ["guy",                 "chap"],
    ["gal",                 "woman"],
    ["bro",                 "mate"],
    ["awesome",             "brilliant"],
    ["badass",              "brilliant"],
    ["neat",                "splendid"],
    ["swell",               "smashing"],
    ["bummer",              "what a shame"],
    ["bum",                 "vagrant"],
    ["hobo",                "vagrant"],
    ["jerk",                "idiot"],
    ["doofus",              "numpty"],
    ["dummy",               "numpty"],
    ["knucklehead",         "numpty"],
    ["donut",               "doughnut"],
    ["donut hole",          "doughnut hole"],
    ["color",               "colour"],
    ["favorite",            "favourite"],
    ["favorites",           "favourites"],
    ["honor",               "honour"],
    ["honors",              "honours"],
    ["humor",               "humour"],
    ["labor",               "labour"],
    ["neighbor",            "neighbour"],
    ["neighbors",           "neighbours"],
    ["neighborhood",        "neighbourhood"],
    ["center",              "centre"],
    ["centers",             "centres"],
    ["theater",             "theatre"],
    ["theaters",            "theatres"],
    ["fiber",               "fibre"],
    ["fibers",              "fibres"],
    ["defense",             "defence"],
    ["offense",             "offence"],
    ["license",             "licence"],   // as noun
    ["catalog",             "catalogue"],
    ["dialog",              "dialogue"],
    ["analog",              "analogue"],
    ["program",             "programme"],  // non-computing
    ["fulfill",             "fulfil"],
    ["skillful",            "skilful"],
    ["enroll",              "enrol"],
    ["enrollment",          "enrolment"],
    ["traveled",            "travelled"],
    ["traveling",           "travelling"],
    ["traveler",            "traveller"],
    ["canceled",            "cancelled"],
    ["canceling",           "cancelling"],
    ["modeled",             "modelled"],
    ["modeling",            "modelling"],
    ["signaling",           "signalling"],
    ["jewelry",             "jewellery"],
    ["pajamas",             "pyjamas"],
    ["cozy",                "cosy"],
    ["gray",                "grey"],
    ["mustache",            "moustache"],
    ["skeptic",             "sceptic"],
    ["skeptical",           "sceptical"],
    ["skepticism",          "scepticism"],
    ["maneuver",            "manoeuvre"],
    ["maneuvers",           "manoeuvres"],
    ["diarrhea",            "diarrhoea"],
    ["meager",            "meagre"],
    ["shake-n-bake", "boil-in-the-bag"],
    ["aging",               "ageing"],
  ];

  // Pre-compile word replacements into regex patterns.
  // We sort by length (longest first) to handle multi-word phrases before single words.
  const sortedReplacements = [...WORD_REPLACEMENTS].sort(
    (a, b) => b[0].length - a[0].length
  );

  // Build a single large alternation regex for efficiency.
  // We'll apply each replacement individually to preserve case.
  const compiledReplacements = sortedReplacements.map(([american, british]) => ({
    regex: new RegExp(`\\b${escapeRegex(american)}\\b`, 'gi'),
    american,
    british,
  }));

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function preserveCase(original, replacement) {
    if (original === original.toUpperCase()) return replacement.toUpperCase();
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  // --- CURRENCY CONVERSION ---
  // Matches: $1,234.56 or $1234 or $1.5M or $3B etc.
  const CURRENCY_RE = /\$(\d[\d,]*(?:\.\d+)?)\s*(billion|million|trillion|B|M|T|K|thousand|bn|m|k)?/gi;

  const SCALE = {
    'trillion': 1e12, 't': 1e12,
    'billion':  1e9,  'b': 1e9,  'bn': 1e9,
    'million':  1e6,  'm': 1e6,
    'thousand': 1e3,  'k': 1e3,
  };

  function formatGBP(amount) {
    // Format to same rough precision as the dollar amount
    if (amount >= 1e12) return `£${(amount / 1e12).toPrecision(3).replace(/\.?0+$/, '')} trillion`;
    if (amount >= 1e9)  return `£${(amount / 1e9).toPrecision(3).replace(/\.?0+$/, '')} billion`;
    if (amount >= 1e6)  return `£${(amount / 1e6).toPrecision(3).replace(/\.?0+$/, '')} million`;
    if (amount >= 1e3 && amount < 1e6) return `£${Math.round(amount).toLocaleString('en-GB')}`;
    // Preserve decimal precision of original
    if (Number.isInteger(amount)) return `£${amount.toLocaleString('en-GB')}`;
    return `£${amount.toFixed(2)}`;
  }

  function convertCurrency(text, usdToGbp) {
    return text.replace(CURRENCY_RE, (match, numStr, scale) => {
      const num = parseFloat(numStr.replace(/,/g, ''));
      const scaleLower = (scale || '').toLowerCase();
      const multiplier = SCALE[scaleLower] || 1;
      const usd = num * multiplier;
      const gbp = usd * usdToGbp;

      let gbpStr;
      if (scale) {
        // Re-express in same scale
        const scaledGbp = gbp / multiplier;
        const precision = numStr.includes('.') ? numStr.split('.')[1].length : 0;
        gbpStr = `£${scaledGbp.toFixed(precision)}${scale}`;
      } else {
        const precision = numStr.includes('.') ? numStr.split('.')[1].length : 0;
        gbpStr = `£${gbp.toFixed(precision)}`;
        // Add thousands separator if original had one
        if (numStr.includes(',') || numStr.length > 6) {
          gbpStr = `£${Math.round(gbp).toLocaleString('en-GB')}`;
        }
      }

      return `${match} [${gbpStr}]`;
    });
  }

  // --- TEMPERATURE CONVERSION ---
  // Matches: 98.6°F or 98.6 °F or 98.6F (standalone, not in words)
  const TEMP_RE = /(-?\d+(?:\.\d+)?)\s*°?\s*F(?:ahrenheit)?(?=\b|\s|°|,|\.|\))/gi;

  function fToC(f) {
    return (f - 32) * 5 / 9;
  }

  function convertTemperatures(text) {
    return text.replace(TEMP_RE, (match, fStr) => {
      const f = parseFloat(fStr);
      const c = fToC(f);
      const precision = fStr.includes('.') ? fStr.split('.')[1].length : 0;
      return `${c.toFixed(precision)}°C`;
    });
  }

  // --- TEXT NODE WALKER ---
  // Only operate on text nodes, skipping script/style/code/pre/input/textarea
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','INPUT','SELECT','NOSCRIPT','SVG','MATH']);

  function walkTextNodes(root, callback) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          let el = node.parentElement;
          while (el) {
            if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
            el = el.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(callback);
  }

  function processTextNode(node, usdToGbp) {
    let text = node.nodeValue;
    if (!text || !text.trim()) return;

    // Apply word replacements
    for (const { regex, british } of compiledReplacements) {
      text = text.replace(regex, (match) => preserveCase(match, british));
    }

    // Currency
    text = convertCurrency(text, usdToGbp);

    // Temperature
    text = convertTemperatures(text);

    if (text !== node.nodeValue) {
      node.nodeValue = text;
    }
  }

  // --- EXCHANGE RATE FETCHING ---
  // We use a free, no-auth API. If unavailable, fall back to hardcoded rate.
  async function fetchExchangeRate() {
    try {
      // frankfurter.app is a free, open exchange rate API
      const resp = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP');
      if (!resp.ok) throw new Error('HTTP error');
      const data = await resp.json();
      return data.rates.GBP || FALLBACK_USD_TO_GBP;
    } catch {
      return FALLBACK_USD_TO_GBP;
    }
  }

  // --- MUTATION OBSERVER (for dynamic content) ---
  function observeDynamicContent(usdToGbp) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            processTextNode(node, usdToGbp);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            walkTextNodes(node, (n) => processTextNode(n, usdToGbp));
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- MAIN ---
  async function main() {
    const usdToGbp = await fetchExchangeRate();

    // Process existing content
    walkTextNodes(document.body, (node) => processTextNode(node, usdToGbp));

    // Watch for new content (SPAs, lazy loading, etc.)
    observeDynamicContent(usdToGbp);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
