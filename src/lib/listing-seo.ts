/**
 * Listing SEO template — Mary's (AJCG) house format for every property page:
 *
 *   Title:        [x]-Unit Multifamily Sold in [Town, ST] | AJ Commercial Group
 *   Description:  [x]-unit multifamily property sold in [Town, ST] by AJ Commercial
 *                 Group. Specializing in multifamily investment property sales
 *                 throughout [market, e.g. West Chicago Suburbs] - [County] County, [State].
 *
 * Used three ways so it is genuinely automatic:
 *   - the public property page falls back to it whenever meta_title /
 *     meta_description are blank;
 *   - the admin fills blank fields with it on create and save, and shows it as
 *     the placeholder so the team sees exactly what Google will get;
 *   - supabase/apply-listing-seo.ts applies it to existing rows.
 *
 * Pure functions, no I/O — safe to import from client components.
 */
import type { Property } from "./types";

const ACTIVE = new Set(["for sale", "under contract", "coming soon"]);

/** Chicagoland + nearby Midwest towns → county. Extend freely; unknown towns degrade gracefully. */
const COUNTY_BY_CITY: Record<string, string> = {
  // Chicago
  chicago: "Cook",
  // Cook — north / northwest
  evanston: "Cook", skokie: "Cook", wilmette: "Cook", winnetka: "Cook", glenview: "Cook", northbrook: "Cook",
  "des plaines": "Cook", "park ridge": "Cook", niles: "Cook", "morton grove": "Cook", lincolnwood: "Cook",
  "mount prospect": "Cook", "arlington heights": "Cook", palatine: "Cook", "rolling meadows": "Cook",
  schaumburg: "Cook", "hoffman estates": "Cook", streamwood: "Cook", "elk grove village": "Cook",
  wheeling: "Cook", "prospect heights": "Cook", "buffalo grove": "Cook", barrington: "Cook",
  // Cook — west
  "oak park": "Cook", "river forest": "Cook", "forest park": "Cook", berwyn: "Cook", cicero: "Cook",
  "la grange": "Cook", "la grange park": "Cook", westchester: "Cook", brookfield: "Cook", riverside: "Cook",
  "north riverside": "Cook", lyons: "Cook", countryside: "Cook", "western springs": "Cook", hinsdale: "DuPage",
  maywood: "Cook", "melrose park": "Cook", bellwood: "Cook", "franklin park": "Cook", "river grove": "Cook",
  "elmwood park": "Cook", "norridge": "Cook", "harwood heights": "Cook", "schiller park": "Cook",
  "stickney": "Cook", summit: "Cook", "hodgkins": "Cook", "indian head park": "Cook",
  // Cook — south / southwest
  "oak lawn": "Cook", bridgeview: "Cook", justice: "Cook", "hickory hills": "Cook", "palos hills": "Cook",
  "palos heights": "Cook", "palos park": "Cook", "orland park": "Cook", "tinley park": "Cook",
  "oak forest": "Cook", midlothian: "Cook", "crestwood": "Cook", "alsip": "Cook", "blue island": "Cook",
  "evergreen park": "Cook", "chicago ridge": "Cook", worth: "Cook", burbank: "Cook", "hometown": "Cook",
  "calumet city": "Cook", lansing: "Cook", harvey: "Cook", "south holland": "Cook", dolton: "Cook",
  riverdale: "Cook", "chicago heights": "Cook", "park forest": "Cook", matteson: "Cook", "country club hills": "Cook",
  "hazel crest": "Cook", homewood: "Cook", flossmoor: "Cook", "olympia fields": "Cook", "richton park": "Cook",
  "markham": "Cook", "posen": "Cook", "robbins": "Cook", "burnham": "Cook", "sauk village": "Cook",
  // DuPage
  westmont: "DuPage", "downers grove": "DuPage", lombard: "DuPage", "glen ellyn": "DuPage", wheaton: "DuPage",
  naperville: "DuPage", lisle: "DuPage", woodridge: "DuPage", "villa park": "DuPage", elmhurst: "DuPage",
  addison: "DuPage", bensenville: "DuPage", "wood dale": "DuPage", itasca: "DuPage", roselle: "DuPage",
  bloomingdale: "DuPage", "glendale heights": "DuPage", "carol stream": "DuPage", "west chicago": "DuPage",
  warrenville: "DuPage", winfield: "DuPage", "oak brook": "DuPage", "oakbrook terrace": "DuPage",
  "clarendon hills": "DuPage", darien: "DuPage", "willowbrook": "DuPage", "burr ridge": "DuPage",
  "hanover park": "DuPage", "medinah": "DuPage",
  // Will
  joliet: "Will", bolingbrook: "Will", romeoville: "Will", plainfield: "Will", lockport: "Will", "crest hill": "Will",
  "homer glen": "Will", "new lenox": "Will", mokena: "Will", frankfort: "Will", "orland hills": "Cook",
  "tinley park (will)": "Will", "shorewood": "Will", channahon: "Will", "crete": "Will", "beecher": "Will",
  "monee": "Will", "university park": "Will", "steger": "Will", "manhattan": "Will", "peotone": "Will",
  "wilmington": "Will", "braidwood": "Will", "elwood": "Will",
  // Lake (IL)
  waukegan: "Lake", "north chicago": "Lake", "lake forest": "Lake", "highland park": "Lake", highwood: "Lake",
  deerfield: "Lake", "lake bluff": "Lake", libertyville: "Lake", mundelein: "Lake", "vernon hills": "Lake",
  gurnee: "Lake", zion: "Lake", "round lake": "Lake", "round lake beach": "Lake", "fox lake": "Lake",
  antioch: "Lake", grayslake: "Lake", "lake zurich": "Lake", wauconda: "Lake", "lake villa": "Lake",
  lindenhurst: "Lake", "park city": "Lake", "beach park": "Lake", "winthrop harbor": "Lake",
  "hawthorn woods": "Lake", "long grove": "Lake", "kildeer": "Lake",
  // Kane
  aurora: "Kane", elgin: "Kane", "st. charles": "Kane", "st charles": "Kane", geneva: "Kane", batavia: "Kane",
  "north aurora": "Kane", "south elgin": "Kane", "carpentersville": "Kane", "east dundee": "Kane",
  "west dundee": "Kane", "sugar grove": "Kane", "montgomery": "Kane", "hampshire": "Kane",
  // McHenry
  marengo: "McHenry", "crystal lake": "McHenry", mchenry: "McHenry", woodstock: "McHenry", "cary": "McHenry",
  "algonquin": "McHenry", "lake in the hills": "McHenry", huntley: "McHenry", harvard: "McHenry",
  "fox river grove": "McHenry", "island lake": "McHenry",
  // Kendall / DeKalb / Grundy
  oswego: "Kendall", yorkville: "Kendall", plano: "Kendall", dekalb: "DeKalb", sycamore: "DeKalb",
  morris: "Grundy", minooka: "Grundy",
  // Downstate IL
  pekin: "Tazewell", peoria: "Peoria", "east peoria": "Tazewell", bloomington: "McLean", normal: "McLean",
  champaign: "Champaign", urbana: "Champaign", rockford: "Winnebago", springfield: "Sangamon", kankakee: "Kankakee",
  // Northwest Indiana
  "east chicago": "Lake", hammond: "Lake", gary: "Lake", "whiting": "Lake", "highland": "Lake", "munster": "Lake",
  "merrillville": "Lake", "crown point": "Lake", "hobart": "Lake", "schererville": "Lake", "griffith": "Lake",
  "portage": "Porter", "valparaiso": "Porter", "chesterton": "Porter", "michigan city": "LaPorte",
  // Ohio / Iowa examples the team has listed
  toledo: "Lucas", davenport: "Scott", dubuque: "Dubuque",
};

/** Market label by (state, county), with the big Cook split handled by town. */
const MARKET_BY_COUNTY: Record<string, string> = {
  "IL:DuPage": "West Chicago Suburbs",
  "IL:Will": "Southwest Chicago Suburbs",
  "IL:Kendall": "Southwest Chicago Suburbs",
  "IL:Lake": "North Chicago Suburbs",
  "IL:Kane": "Far West Chicago Suburbs",
  "IL:McHenry": "Northwest Chicago Suburbs",
  "IL:DeKalb": "Far West Chicago Suburbs",
  "IL:Grundy": "Southwest Chicago Suburbs",
  "IN:Lake": "Northwest Indiana",
  "IN:Porter": "Northwest Indiana",
  "IN:LaPorte": "Northwest Indiana",
};

const SOUTH_COOK = new Set([
  "oak lawn", "bridgeview", "justice", "hickory hills", "palos hills", "palos heights", "palos park", "orland park",
  "orland hills", "tinley park", "oak forest", "midlothian", "crestwood", "alsip", "blue island", "evergreen park",
  "chicago ridge", "worth", "burbank", "hometown", "calumet city", "lansing", "harvey", "south holland", "dolton",
  "riverdale", "chicago heights", "park forest", "matteson", "country club hills", "hazel crest", "homewood",
  "flossmoor", "olympia fields", "richton park", "markham", "posen", "robbins", "burnham", "sauk village",
]);
const NORTH_COOK = new Set([
  "evanston", "skokie", "wilmette", "winnetka", "glenview", "northbrook", "des plaines", "park ridge", "niles",
  "morton grove", "lincolnwood", "mount prospect", "arlington heights", "palatine", "rolling meadows", "schaumburg",
  "hoffman estates", "streamwood", "elk grove village", "wheeling", "prospect heights", "buffalo grove", "barrington",
]);

const STATE_NAMES: Record<string, string> = {
  IL: "Illinois", IN: "Indiana", WI: "Wisconsin", IA: "Iowa", OH: "Ohio", MI: "Michigan", MO: "Missouri",
};

export type ListingPlace = { city: string; state: string; county?: string; market?: string };

/** Pulls "Town, ST" out of whichever field has it. */
export function parseListingPlace(p: Pick<Property, "city" | "state" | "location" | "name" | "address">): ListingPlace | null {
  let city = (p.city || "").trim();
  let state = (p.state || "").trim().toUpperCase();
  if (!city || !state) {
    for (const src of [p.location, p.name, p.address]) {
      if (!src) continue;
      // "…, Westmont, IL" / "… - Westmont, IL" / "Westmont, IL · 12-Unit"
      const m = src.match(/(?:^|[,\-–·]\s*)([A-Za-z][A-Za-z.' ]{1,40}?),\s*([A-Z]{2})\b/);
      if (m) {
        if (!city) city = m[1].trim();
        if (!state) state = m[2].toUpperCase();
        break;
      }
    }
  }
  if (!city) return null;
  if (!state) state = "IL";
  // "Chicago - Logan Square" style names: keep the town only.
  city = city.replace(/\s*[-–].*$/, "").trim();

  const key = city.toLowerCase();
  const county = COUNTY_BY_CITY[key];
  let market: string | undefined;
  if (state === "IL" && key === "chicago") market = "Chicago";
  else if (state === "IL" && county === "Cook") {
    market = SOUTH_COOK.has(key) ? "Southwest Chicago Suburbs" : NORTH_COOK.has(key) ? "Northwest Chicago Suburbs" : "West Chicago Suburbs";
  } else if (county) market = MARKET_BY_COUNTY[`${state}:${county}`];

  return { city, state, county, market };
}

export function parseListingUnits(p: Pick<Property, "units" | "name" | "location">): number | null {
  const valid = (n: number) => (n > 0 && n < 10000 ? n : null);
  // The units field itself: "10", "10 Units", "10-unit".
  const direct = String(p.units || "").match(/\d{1,4}/);
  if (direct) return valid(parseInt(direct[0], 10));
  // Otherwise only trust a number that sits right next to the word "unit".
  for (const src of [p.name, p.location]) {
    const m = String(src || "").match(/(\d{1,4})\s*-?\s*units?\b/i);
    if (m) return valid(parseInt(m[1], 10));
  }
  return null;
}

function assetWord(type?: string): string {
  const t = (type || "").trim();
  if (!t || /multi/i.test(t)) return "Multifamily";
  return t;
}

export function buildListingMetaTitle(p: Property): string {
  const place = parseListingPlace(p);
  const units = parseListingUnits(p);
  const verb = ACTIVE.has((p.status || "").toLowerCase()) ? "For Sale" : "Sold";
  const asset = assetWord(p.type);
  const where = place ? ` in ${place.city}, ${place.state}` : "";
  const lead = units ? `${units}-Unit ${asset}` : asset;
  return `${lead} ${verb}${where} | AJ Commercial Group`;
}

export function buildListingMetaDescription(p: Property): string {
  const place = parseListingPlace(p);
  const units = parseListingUnits(p);
  const active = ACTIVE.has((p.status || "").toLowerCase());
  const asset = assetWord(p.type).toLowerCase();
  const where = place ? ` in ${place.city}, ${place.state}` : "";
  const first = units
    ? `${units}-unit ${asset} property ${active ? "for sale" : "sold"}${where} by AJ Commercial Group.`
    : `${asset.charAt(0).toUpperCase() + asset.slice(1)} property ${active ? "for sale" : "sold"}${where} by AJ Commercial Group.`;

  let region: string;
  if (place?.county) {
    const stateName = STATE_NAMES[place.state] || place.state;
    region = place.market ? `${place.market} - ${place.county} County, ${stateName}` : `${place.county} County, ${stateName}`;
  } else if (place?.state === "IL" || !place) {
    region = "Chicagoland and the Midwest";
  } else {
    region = `${STATE_NAMES[place.state] || place.state} and the Midwest`;
  }
  return `${first} Specializing in multifamily investment property sales throughout ${region}.`;
}

/** True when a stored description already follows the house template (hand-written by the team). */
export function looksTemplated(desc?: string | null): boolean {
  return /^\d+[- ]unit .*(?:sold|for sale) in .+ by AJ Commercial Group\./i.test((desc || "").trim());
}

/** Fill blank meta fields with the template. Never overwrites something the team typed. */
export function withListingSeoDefaults<T extends Partial<Property>>(patch: T, merged: Property): T {
  const out: Partial<Property> = { ...patch };
  if (!(merged.meta_title || "").trim()) out.meta_title = buildListingMetaTitle(merged);
  if (!(merged.meta_description || "").trim()) out.meta_description = buildListingMetaDescription(merged);
  return out as T;
}
