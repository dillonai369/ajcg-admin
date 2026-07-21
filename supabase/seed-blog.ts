/**
 * Blog seed — inserts/updates the 10 SEO starter posts.
 *
 * Run once (locally, where .env.local + network are available):
 *   npx tsx supabase/seed-blog.ts
 *
 * It UPSERTS on `slug`, so re-running is safe (updates existing rows rather
 * than duplicating). Posts are written as block content matching BlockEditor /
 * BlockRenderer. Prose supports inline [label](/link) and **bold**.
 *
 * After seeding, the posts render at /blog/<slug> once the BlockRenderer code
 * is deployed. Hero images are left blank intentionally — add them in the admin
 * (Blog → post → hero image) so they're stored in Supabase, not an external CDN.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { PostBlock } from "../src/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// ---- tiny block authoring helpers -------------------------------------------
let _n = 0;
const id = () => `s${(_n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const p = (text: string): PostBlock => ({ id: id(), type: "paragraph", text });
const h = (text: string): PostBlock => ({ id: id(), type: "heading", text });
const list = (items: string[]): PostBlock => ({ id: id(), type: "list", text: items.join("\n") });
const quote = (text: string, attribution = ""): PostBlock => ({ id: id(), type: "quote", text, attribution });
const cta = (label: string, url: string): PostBlock => ({ id: id(), type: "cta", text: label, url });
const divider = (): PostBlock => ({ id: id(), type: "divider" });

type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  date: string; // ISO
  meta_title: string;
  meta_description: string;
  blocks: PostBlock[];
};

const posts: SeedPost[] = [];

// ===== POST 1 — Selling × DuPage (pillar) =====
posts.push({
  slug: "sell-apartment-building-dupage-county",
  title: "How to Sell an Apartment Building in DuPage County: A 2026 Owner's Guide",
  excerpt:
    "Thinking about selling your DuPage County apartment building? Here's how the process works in 2026 — pricing, buyers, taxes, and the mistakes that cost owners money.",
  category: "Selling",
  tags: ["selling", "dupage county", "dispositions", "multifamily"],
  author: "Joey Batliner",
  date: "2026-06-24",
  meta_title: "Sell an Apartment Building in DuPage County (2026 Guide)",
  meta_description:
    "A DuPage County owner's guide to selling a multifamily property in 2026: what it's worth, the disposition process, who's buying, and how a 1031 defers the tax.",
  blocks: [
    p("If you own an apartment building in DuPage County and you're weighing a sale, the two questions that matter most are simple: what is it worth today, and how do you sell it without leaving money on the table? This guide walks through both — the current market, what your building is likely worth, the step-by-step disposition process, and the tax move that lets you keep more of your equity."),
    h("Is 2026 a good time to sell in DuPage County?"),
    p("DuPage remains one of the most stable multifamily markets in the Chicago metro: low vacancy, steady suburban rent growth, and a deep pool of buyers who specifically want western-suburban product. Higher interest rates have cooled pricing from the 2021 peak, but well-run buildings with clean financials are still trading — and buyers are competing hardest for stabilized assets in strong school districts. Timing your sale is less about calling the market top and more about your own position: your equity, your tax basis, upcoming capital expenses, and how much management you still want to do."),
    h("What is your building actually worth?"),
    p("Commercial multifamily is valued on income, not on what the house down the street sold for. The core formula is net operating income divided by the market cap rate. If that sentence raised questions, start with our full breakdown of [how multifamily valuation works](/blog/how-to-value-apartment-building) — it covers NOI, cap rates, and the levers that raise your price. When you're ready for a real number, we'll give you a free, confidential [broker's opinion of value](/selling) based on actual DuPage comps, not an online estimate."),
    h("The disposition process, step by step"),
    list([
      "Valuation & strategy — we underwrite the building and agree on a target price and timing.",
      "Preparation — assemble the rent roll, trailing-12 financials, and a clean offering package.",
      "Marketing — expose the deal to our buyer network (and, when it helps, the open market).",
      "Offers & negotiation — compare not just price but terms, financing strength, and certainty to close.",
      "Under contract & due diligence — inspections, lender appraisal, and estoppels.",
      "Closing — funds transfer, and (if you're exchanging) your 1031 clock is already handled.",
    ]),
    h("Who's buying multifamily in the western suburbs right now"),
    p("The DuPage buyer pool is deep: private local investors trading up, out-of-state buyers chasing Midwest yield, and 1031 buyers who must place capital on a deadline. That last group is important — a motivated exchange buyer will often pay a premium and close fast. Knowing which buyer fits your building is how we position it, and it's why [buyer representation](/buying) and seller representation feed each other."),
    h("The tax hit — and how a 1031 exchange defers it"),
    p("A sale can trigger federal capital gains, depreciation recapture, and Illinois tax — together often 20–30% of your gain. A 1031 exchange lets you roll the proceeds into a replacement property and defer all of it. The catch is the clock: 45 days to identify and 180 to close. If there's any chance you'll exchange, read our [Illinois 1031 guide](/blog/1031-exchange-illinois-multifamily) and talk to us **before** you list — sequencing the sale and the replacement is where deals are won or lost."),
    h("Common mistakes DuPage owners make"),
    list([
      "Listing multifamily with a residential agent who prices it like a house instead of an income stream.",
      "Bringing a building to market with messy books — buyers discount uncertainty.",
      "Ignoring the tax bill until closing, then scrambling on a 1031 with no replacement identified.",
      "Over-improving right before a sale instead of selling the upside to a value-add buyer.",
      "Chasing the highest offer instead of the most certain one.",
    ]),
    h("Why a multifamily specialist beats a residential agent"),
    p("Selling an apartment building is an underwriting exercise, not a home sale. It takes a broker who can defend your NOI, speak to cap rates a lender will accept, and reach the specific buyers who want DuPage multifamily. That's the entire focus of our team — we don't sell houses; we trade apartment buildings across Chicagoland."),
    cta("Get a free valuation of your DuPage building", "/selling"),
    divider(),
    h("Frequently Asked Questions"),
    h("How long does it take to sell an apartment building?"),
    p("From going to market to closing, a typical stabilized DuPage building takes about 60–120 days, depending on financing and due diligence. Preparation before launch can add a couple of weeks but usually pays for itself in a stronger sale."),
    h("What commission do brokers charge to sell multifamily?"),
    p("Commercial brokerage fees are negotiated per deal and depend on the building's size and complexity. We'll lay ours out transparently up front — no surprises at closing."),
    h("Do I need an appraisal before I sell?"),
    p("No. A broker's opinion of value is free and is what you'll use to price and market. The buyer's lender will order its own appraisal during due diligence."),
    h("Can I sell with tenants in place?"),
    p("Yes — most multifamily sells occupied, and existing leases transfer to the buyer. Whether to deliver occupied or vacant depends on the building and the buyer; we'll advise on what maximizes your price."),
    p("Have a building in DuPage you're thinking about? [Reach out](/contact) or call (630) 895-7989 for a candid, no-pressure read on what it's worth and whether now is your window."),
  ],
});

// ===== POST 2 — 1031 (pillar) =====
posts.push({
  slug: "1031-exchange-illinois-multifamily",
  title: "1031 Exchanges for Illinois Apartment Owners: Rules, Timelines & Pitfalls",
  excerpt:
    "A plain-English guide to 1031 exchanges for Illinois multifamily owners — how they defer capital gains, the 45/180-day clock, and the mistakes that blow up an exchange.",
  category: "1031 Exchange",
  tags: ["1031 exchange", "taxes", "illinois", "multifamily"],
  author: "Anthony Munoz",
  date: "2026-07-01",
  meta_title: "1031 Exchange Illinois Multifamily: Rules & Timelines (2026)",
  meta_description:
    "How Illinois apartment owners use a 1031 exchange to defer capital gains: the 45/180-day rules, qualified intermediaries, like-kind rules, and common pitfalls.",
  blocks: [
    p("A 1031 exchange is the single most powerful tax tool available to apartment owners — done right, it lets you sell a building and defer 100% of the tax you'd otherwise owe by reinvesting into another property. Done wrong, you miss a deadline and owe all of it anyway. Here's how it works for Illinois multifamily owners, in plain English."),
    h("What is a 1031 exchange?"),
    p("Named after Section 1031 of the tax code, a like-kind exchange lets you sell an investment property and reinvest the proceeds into another investment property without paying capital gains tax at the time of sale. You're not avoiding the tax forever — you're deferring it, and many owners defer indefinitely by exchanging again and again. For a building with years of appreciation and depreciation recapture built up, that deferral can be worth six figures."),
    h("The 45-day and 180-day clock"),
    p("Two deadlines start the day your sale closes, and they run at the same time:"),
    list([
      "45 days to identify your replacement property (or properties) in writing.",
      "180 days to close on the replacement.",
      "Both are calendar days, with no extensions for weekends or holidays.",
    ]),
    p("This is why we tell sellers to plan the exchange **before** listing. If you sell first and start hunting on day one of the 45, you're negotiating from weakness. If you know the replacement market going in, the clock is a formality."),
    h("The Qualified Intermediary — why you can't touch the money"),
    p("You cannot take possession of the sale proceeds, even for a day, or the exchange is dead. A Qualified Intermediary (QI) holds the funds between the sale and the purchase and handles the paperwork. Choosing an experienced QI matters; we connect our clients with intermediaries we've closed with before."),
    h("What counts as \"like-kind\" for apartments?"),
    p("For real estate, like-kind is broad: you can exchange an apartment building for almost any other investment real estate — a bigger building, a different market, a retail strip, even a fractional interest in a larger asset. Common moves for Illinois owners include trading a management-heavy value-add for a stabilized building, or trading up from a fourplex into a 20-unit. If you're on the buying side of that trade, [buyer representation](/buying) gets you access to off-market replacements that fit the clock."),
    h("Illinois-specific notes"),
    p("Illinois conforms to the federal 1031 rules, so a properly structured exchange defers Illinois tax as well. You can also exchange across state lines — many of our clients roll Chicagoland equity into higher-yield buildings in Indiana, Iowa, or Ohio — but state filing and withholding rules vary, so loop in your CPA early."),
    quote("The exchange isn't the hard part. Lining up the right replacement inside 45 days is. That's a sourcing problem, and it's exactly what a broker is for.", "AJ Commercial Group"),
    h("A simplified example"),
    p("Say you sell a building for a $500,000 gain. Between federal capital gains, depreciation recapture, and Illinois tax, you might owe well over $100,000. In a 1031, you reinvest the full proceeds into a replacement, defer that entire bill, and keep it working for you as equity in a larger asset. *(Illustrative only — run your actual numbers with your CPA and QI.)*"),
    cta("Planning a 1031? Talk to us before you list", "/exchange-1031"),
    divider(),
    h("Frequently Asked Questions"),
    h("Can I 1031 into a property in another state?"),
    p("Yes. Real estate anywhere in the U.S. is like-kind to other U.S. investment real estate, so you can exchange a Chicago building into Indiana, Iowa, Ohio, or elsewhere. Mind each state's filing and withholding rules."),
    h("What happens if I miss the 45-day deadline?"),
    p("The exchange fails and the sale becomes fully taxable. There are no extensions except in limited federally declared disaster situations. This is why identifying replacements early is critical."),
    h("Can I exchange a small building into a bigger one?"),
    p("Absolutely — trading up is one of the most common and powerful uses of a 1031. You can also reinvest into multiple replacement properties, within the identification rules."),
    h("Do I owe Illinois tax if I do a 1031?"),
    p("A properly structured 1031 defers Illinois tax along with the federal tax. The deferred tax comes due only when you eventually sell without exchanging."),
    p("Thinking through a sale-and-exchange? [Contact our team](/contact) or call (630) 895-7989 and we'll map the sequence with you — and start lining up replacement inventory before your clock ever starts."),
  ],
});

// ===== POST 3 — Valuation (pillar) =====
posts.push({
  slug: "how-to-value-apartment-building",
  title: "What Is My Apartment Building Worth? How Multifamily Valuation Really Works",
  excerpt:
    "Apartment buildings are priced on income, not comps. Here's how NOI, cap rates, and price-per-unit actually determine what your multifamily property is worth.",
  category: "Valuations",
  tags: ["valuation", "cap rate", "noi", "multifamily"],
  author: "Joey Batliner",
  date: "2026-07-08",
  meta_title: "What Is My Apartment Building Worth? Multifamily Valuation 101",
  meta_description:
    "How to value an apartment building: the NOI ÷ cap rate formula, how to calculate net operating income, and what actually raises a multifamily property's price.",
  blocks: [
    p("The number-one question owners ask us is \"what's my building worth?\" — and the honest answer is that it depends on one thing above all: how much income the building produces. Unlike a single-family home, an apartment building isn't priced on what the neighbor's house sold for. It's priced on its cash flow. Here's how that actually works."),
    h("The core formula: NOI ÷ cap rate"),
    p("Commercial multifamily value comes down to net operating income (NOI) divided by the market capitalization rate (cap rate). If a building throws off $100,000 of NOI and comparable buildings trade at a 7% cap rate, it's worth roughly $100,000 ÷ 0.07 = about $1.43 million. Change either number and the value moves. That's why growing income and understanding your submarket's cap rate are the whole game."),
    h("How to calculate NOI"),
    p("Net operating income is all the income the property collects minus all the operating expenses — before your mortgage. Build it up like this:"),
    list([
      "Start with gross rental income at market, plus other income (laundry, parking, storage).",
      "Subtract a vacancy allowance — no building is 100% full year-round.",
      "Subtract real operating expenses: taxes, insurance, utilities, management, maintenance, turnover.",
      "What's left is NOI. Note: your mortgage payment is NOT an operating expense — cap-rate math is done pre-debt.",
    ]),
    p("The most common mistake owners make is understating expenses (or excluding property taxes that will reset after a sale), which inflates NOI and leads to a disappointing gap when a buyer re-underwrites the building."),
    h("Where cap rates come from"),
    p("Cap rates are set by the market — they reflect what buyers will pay per dollar of income, and they move with interest rates, perceived risk, and demand for a submarket. A stabilized building in a strong DuPage school district commands a lower cap rate (higher price per dollar of income) than a management-heavy building in a tougher location. Cap rates differ meaningfully across Chicagoland, which is exactly what our [market report](/blog/chicagoland-multifamily-market-report) tracks."),
    h("Price per unit and price per square foot — the sanity checks"),
    p("Experienced buyers cross-check the income value against price per unit and price per square foot versus recent sales. If the income approach says $145,000/unit but every comparable building traded at $110,000/unit, something in the assumptions needs a second look. Good valuation triangulates all three."),
    h("What raises your building's value"),
    list([
      "Raising rents to market (the fastest lever — every $50/unit/month compounds through the cap rate).",
      "Adding income streams: RUBS utility billback, parking, storage, laundry.",
      "Cutting controllable expenses and appealing an over-assessed tax bill.",
      "Improving unit mix and reducing turnover.",
      "Clean, well-documented financials that let a buyer trust your NOI.",
    ]),
    h("BOV vs. appraisal vs. online estimate"),
    p("An online \"estimate\" doesn't understand commercial income and will be wrong for multifamily. A formal appraisal is ordered by the buyer's lender during due diligence. What you want up front is a broker's opinion of value (BOV) — a free, comp-driven estimate of what your building will actually trade for today. That's the starting point for any [sale or valuation](/selling)."),
    cta("Get a free broker's opinion of value", "/selling"),
    divider(),
    h("Frequently Asked Questions"),
    h("What's a good cap rate in Chicago?"),
    p("It depends heavily on submarket and building quality — stabilized suburban product trades tighter than value-add city buildings. Rather than a single number, we'll show you the cap rates comparable buildings are actually trading at in your area."),
    h("Does my property tax bill affect the value?"),
    p("Yes, directly. Property taxes are one of the largest operating expenses, and buyers underwrite what taxes will be after a sale — a reassessment can lower your effective value. See our post on [Cook County reassessment](/blog/cook-county-reassessment-apartment-value)."),
    h("How do value-add renovations change the price?"),
    p("Renovations that raise rents or cut expenses raise NOI, which raises value through the cap rate. But over-improving right before a sale can be a mistake — sometimes it's smarter to sell the upside to a value-add buyer."),
    h("Is a broker's valuation free?"),
    p("Yes. Our opinion of value is free and comes with no obligation to list."),
    p("Want a real number for your building? [Request a free valuation](/selling) or call (630) 895-7989."),
  ],
});

// ===== POST 4 — Market report (pillar, recurring) =====
posts.push({
  slug: "chicagoland-multifamily-market-report",
  title: "Chicagoland Multifamily Market Report: Cap Rates, Rents & Trends",
  excerpt:
    "What's driving Chicagoland apartment values right now — interest rates, rising expenses, and where cap rates and rents are heading across the city and suburbs.",
  category: "Market Reports",
  tags: ["market report", "cap rates", "chicagoland", "trends"],
  author: "Anthony Munoz",
  date: "2026-07-15",
  meta_title: "Chicagoland Multifamily Market Report: Cap Rates & Trends",
  meta_description:
    "A working read on the Chicagoland multifamily market: what's moving cap rates and rents across the city, DuPage, and Will County — and what it means for owners.",
  blocks: [
    p("This is our working read on the Chicagoland multifamily market — the forces moving apartment values across the city and suburbs, and what they mean whether you own or you're looking to buy. We refresh it each quarter; for the current numbers on a specific submarket or building, [reach out](/contact) and we'll pull live comps."),
    h("What's driving pricing right now"),
    p("Three forces are shaping values across the metro. First, interest rates: elevated borrowing costs have reset what buyers can pay and widened the gap between seller expectations and buyer underwriting. Second, expenses: operating costs — insurance, property taxes, and payroll — have climbed sharply over the last few years, compressing NOI even where rents rose. Third, demand: despite higher rates, well-located, stabilized buildings still draw multiple buyers because Midwest yields remain attractive relative to the coasts."),
    h("City vs. suburbs"),
    p("The metro isn't one market. City of Chicago buildings tend to offer higher going-in yields but come with more regulation and more property-tax volatility. DuPage County trades tighter — buyers pay up for stability, strong schools, and low vacancy. Will County sits in between, with growth and more accessible entry pricing that appeals to first-time and trade-up buyers. We break down that comparison in detail in [DuPage vs. Will vs. the City](/blog/dupage-vs-will-vs-chicago-multifamily-investment)."),
    h("The expense story owners can't ignore"),
    p("Even in buildings with healthy rent growth, rising expenses have quietly eaten into net operating income — and since value is NOI divided by cap rate, that directly affects price. Controlling controllable costs and appealing over-assessed tax bills has gone from housekeeping to a core value driver. If you haven't underwritten your building at today's real expense levels, you may be surprised at the gap between what you think it's worth and what a buyer will pay. Our guide to [how valuation works](/blog/how-to-value-apartment-building) walks through the math."),
    h("Financing environment"),
    p("Financing availability, not just rate, is shaping deals. Agency lenders (Fannie/Freddie small balance), local banks, and DSCR lenders are all active but more conservative on underwriting. Buyers who come pre-qualified and understand their debt terms are winning deals over those who don't. We cover the options in [multifamily financing in Illinois](/blog/multifamily-financing-illinois-dscr)."),
    h("What it means for you"),
    list([
      "Owners: pricing is off the 2021 peak, but clean, stabilized buildings are still trading — and motivated 1031 buyers will pay up. Know your real number before you decide.",
      "Buyers: less competition than the frenzy years and more negotiating room, especially on buildings that need a story or a lender who understands them.",
      "Everyone: the spread between well-run and poorly-documented buildings has never been wider. Financials matter.",
    ]),
    cta("Get the current numbers for your submarket", "/contact"),
    divider(),
    h("Frequently Asked Questions"),
    h("Are cap rates rising in Chicago?"),
    p("Higher interest rates have generally pushed cap rates up from their 2021 lows, but the move varies by submarket and building quality — stabilized suburban product has held tighter than value-add city buildings. Ask us for the current range in your area."),
    h("Is it a buyer's or seller's market right now?"),
    p("It's more balanced than the seller-dominated 2021 market. Sellers of clean, stabilized buildings still see strong demand; buyers have more room to negotiate on buildings that need work or a creative lender."),
    h("How much are small apartment buildings selling for?"),
    p("It's entirely income- and location-dependent, so there's no single figure. We're happy to share recent comparable sales for your building type and area."),
    h("Where are rents growing fastest?"),
    p("Suburban submarkets with low vacancy and strong schools have shown the steadiest rent growth. We track this by area and can share specifics on request."),
    p("Want a live read on your building or a target market? [Contact us](/contact) or call (630) 895-7989."),
  ],
});

// ===== POST 5 — Selling × Oak Park/Berwyn (intersection) =====
posts.push({
  slug: "sell-2-4-unit-oak-park-berwyn",
  title: "Selling a 2–4 Unit Building in Oak Park & Berwyn: What Owners Should Know",
  excerpt:
    "Two-flats and small multifamily in Oak Park and Berwyn sell to a specific buyer pool. Here's how to price, prepare, and sell a 2–4 unit building in the near-west suburbs.",
  category: "Selling",
  tags: ["selling", "oak park", "berwyn", "small multifamily"],
  author: "Joey Batliner",
  date: "2026-06-17",
  meta_title: "Sell a 2–4 Unit Building in Oak Park & Berwyn (Owner's Guide)",
  meta_description:
    "How to sell a two-flat or small apartment building in Oak Park and Berwyn: who buys them, how they're priced, and whether to sell occupied or vacant.",
  blocks: [
    p("Two-flats, three-flats, and small courtyard walk-ups are the backbone of the near-west suburbs. If you own a 2–4 unit building in Oak Park or Berwyn and you're thinking about selling, the process is a little different from a big apartment complex — and knowing the local buyer pool makes all the difference."),
    h("The small-multifamily niche in Oak Park & Berwyn"),
    p("These markets are dense with small multifamily, and demand is steady because the buildings appeal to more than one type of buyer. That competition is good news for sellers — but only if the building is priced and marketed to the right audience."),
    h("Who buys small buildings here"),
    list([
      "House-hackers who'll live in one unit and rent the others.",
      "Small private investors building a local portfolio.",
      "1031 buyers trading down from a larger asset into stable, low-maintenance units.",
      "Owner-users who want a foothold in Oak Park's schools and walkability.",
    ]),
    h("How small buildings are priced"),
    p("Under about five units, valuation blends the income approach with price-per-unit comps — and because some buyers are owner-occupants, there's often a premium over pure investment math. We look at both. If you want the underlying method, see [how multifamily valuation works](/blog/how-to-value-apartment-building)."),
    h("Occupied vs. vacant"),
    p("Whether to sell with tenants in place or deliver a vacant unit depends on your buyer. Investors want income in place; owner-occupants want a unit to move into. Oak Park also has tenant-protection and inspection considerations worth planning around before you list. We'll help you decide what maximizes your price."),
    h("The tax angle"),
    p("Even on a small building, a sale can trigger a meaningful tax bill — and a [1031 exchange](/blog/1031-exchange-illinois-multifamily) can defer it if you're reinvesting. Worth a conversation before you sell."),
    cta("Free valuation for Oak Park & Berwyn owners", "/selling"),
    divider(),
    h("Frequently Asked Questions"),
    h("What's a two-flat worth in Oak Park?"),
    p("It depends on condition, unit mix, rents, and whether it's sold vacant or occupied. We'll give you a free, comp-based number specific to your block."),
    h("Do I have to give tenants notice before selling?"),
    p("Existing leases transfer to the buyer, and there are notice and access rules to follow. We'll help you navigate the local requirements so nothing derails the sale."),
    h("Should I sell my building vacant?"),
    p("Sometimes — it can widen the buyer pool to owner-occupants. Other times, in-place income is worth more to an investor. It's building-specific, and we'll advise."),
    h("Can I 1031 a small building into a bigger one?"),
    p("Yes. Trading up from a 2–4 unit into a larger building via a 1031 is one of the most common wealth-building moves we help owners make."),
    p("Own a small building in Oak Park or Berwyn? [Reach out](/contact) or call (630) 895-7989 for a straight answer on what it's worth."),
  ],
});

// ===== POST 6 — Buying × western suburbs (intersection) =====
posts.push({
  slug: "buy-first-apartment-building-western-suburbs",
  title: "Buying Your First Apartment Building in the Western Suburbs: An Investor's Roadmap",
  excerpt:
    "A step-by-step roadmap for buying your first multifamily property in Chicago's western suburbs — how much cash you need, how to underwrite a deal, and how to find off-market buildings.",
  category: "Buying",
  tags: ["buying", "western suburbs", "first-time investor", "multifamily"],
  author: "Anthony Munoz",
  date: "2026-06-10",
  meta_title: "Buy Your First Apartment Building in Chicago's Western Suburbs",
  meta_description:
    "A first-time investor's roadmap to buying multifamily in Chicago's western suburbs: cash needed, underwriting basics, financing, due diligence, and finding off-market deals.",
  blocks: [
    p("Buying your first apartment building is a bigger leap than buying a house — but it's also how a lot of Chicagoland investors build real wealth. If you're eyeing the western suburbs, here's the roadmap: what it takes, how to evaluate a deal, and how to find buildings before everyone else does."),
    h("Why the western suburbs"),
    p("DuPage and the surrounding western suburbs offer what first-time multifamily buyers want: stable tenant demand, strong schools, low vacancy, and a range of building sizes to start with. It's a forgiving place to learn the business without the regulatory complexity of the city."),
    h("How much cash you actually need"),
    list([
      "Down payment — typically 20–25%+ for investment multifamily (less if you'll live in a 2–4 unit).",
      "Closing costs — lender fees, title, inspections.",
      "Reserves — lenders want to see months of payments in the bank, and you'll want a cushion for turnover and repairs.",
    ]),
    h("Underwriting a deal"),
    p("Before you fall in love with a building, run the numbers: net operating income, cap rate, and cash-on-cash return. Our guide to [multifamily valuation](/blog/how-to-value-apartment-building) covers the math. The goal is to know what the building is worth and what it'll actually return — not what the seller hopes it's worth."),
    h("Financing your first deal"),
    p("The financing path depends on the building's size — 2–4 units can use residential-style loans, while 5+ units are commercial. We break down loan types, down payments, and DSCR in our [Illinois multifamily financing guide](/blog/multifamily-financing-illinois-dscr). Get pre-qualified before you shop; sellers take pre-approved buyers seriously."),
    h("Due diligence checklist"),
    list([
      "Rent roll and trailing-12 financials — verify the income is real.",
      "Leases and estoppels — know what you're inheriting.",
      "Physical inspection — roof, mechanicals, foundation.",
      "Property taxes — model what they'll be after your purchase, not what the seller pays now.",
    ]),
    h("Finding deals before they hit the market"),
    p("The best buildings often trade quietly. Working with a [buyer's representative](/buying) gets you access to off-market and pre-launch inventory from owners we already know — which is where first-timers get a real edge over scrolling public listings."),
    cta("Join our buyer list for off-market Chicagoland deals", "/buying"),
    divider(),
    h("Frequently Asked Questions"),
    h("How much down payment do I need for a fourplex?"),
    p("If you'll live in one unit, owner-occupant financing can require far less down than a pure investment purchase. As a straight investment, plan on 20–25%+. Exact terms depend on the lender and loan type."),
    h("Can I house-hack a 2–4 unit building?"),
    p("Yes — living in one unit and renting the others is one of the most accessible ways into multifamily, and it can unlock better financing terms."),
    h("What cap rate should I target?"),
    p("There's no universal answer; it depends on the submarket and your strategy (cash flow vs. appreciation vs. value-add). We'll help you set realistic targets for the western suburbs."),
    h("How do I find off-market deals?"),
    p("Relationships. Brokers who work a market constantly hear about buildings before they list. Getting on our buyer list is the simplest way to see them."),
    p("Ready to start? [Tell us your criteria](/contact) or call (630) 895-7989 and we'll send buildings that fit."),
  ],
});

// ===== POST 7 — Financing (topical) =====
posts.push({
  slug: "multifamily-financing-illinois-dscr",
  title: "Financing a Multifamily Purchase in Illinois: Loan Types, Down Payments & DSCR",
  excerpt:
    "Residential vs. commercial loans, DSCR, agency debt, and how much you really need down — a plain-English guide to financing an apartment building purchase in Illinois.",
  category: "Financing",
  tags: ["financing", "dscr", "loans", "multifamily"],
  author: "Anthony Munoz",
  date: "2026-06-30",
  meta_title: "Multifamily Financing in Illinois: Loan Types, DSCR & Down Payments",
  meta_description:
    "How to finance an apartment building in Illinois: the 2–4 unit vs. 5+ unit lending divide, DSCR loans, agency debt, down payments, and getting pre-qualified.",
  blocks: [
    p("Financing is where a lot of first-time multifamily buyers get tripped up — mostly because apartment-building lending doesn't work like a home mortgage once you get past four units. Here's the plain-English version of how it works in Illinois."),
    h("The dividing line: 2–4 units vs. 5+ units"),
    p("This is the single most important thing to understand. Buildings with 2–4 units can generally be financed with residential-style loans — including owner-occupant programs if you'll live there. At five units and up, you're in commercial-loan territory, where the lender underwrites the building's income more than your personal salary."),
    h("Common loan types"),
    list([
      "Conventional / residential — for 2–4 units, often the cheapest option, especially owner-occupied.",
      "DSCR loans — qualify based on the property's cash flow (debt service coverage ratio), not your W-2.",
      "Agency small-balance (Fannie/Freddie) — competitive fixed-rate debt for stabilized 5+ unit buildings.",
      "Bridge loans — short-term financing for value-add buildings you'll stabilize and refinance.",
    ]),
    h("What is a DSCR loan?"),
    p("DSCR stands for debt service coverage ratio — the building's net operating income divided by its debt payments. A DSCR of 1.25 means the property earns 25% more than the mortgage costs. DSCR lenders care about that ratio more than your personal income, which makes these loans popular with investors who have strong buildings but complex tax returns."),
    h("How lenders size your loan"),
    p("Commercial lenders look at two limits: loan-to-value (how much of the price they'll lend) and DSCR (whether the income comfortably covers the payment). The lower of the two governs. That's why a building's real NOI — see [how valuation works](/blog/how-to-value-apartment-building) — drives not just price but how much you can borrow."),
    h("Down payments and reserves"),
    p("Expect 20–25%+ down for investment multifamily (less for owner-occupied 2–4 units), plus reserves in the bank. Rates and terms move with the market, so a fraction of a point matters to your returns — shop lenders."),
    h("Get pre-qualified first"),
    p("Before you make offers, get pre-qualified. It tells you your real budget and it makes your offers credible. When you're ready, we'll connect you with multifamily lenders we've closed with and help you line up financing as part of [your buying strategy](/buying)."),
    cta("We'll connect you with multifamily lenders", "/contact"),
    divider(),
    h("Frequently Asked Questions"),
    h("What's a DSCR loan?"),
    p("A loan that qualifies based on the property's cash flow (its debt service coverage ratio) rather than your personal income — common for investors."),
    h("Can I use an FHA loan on a fourplex?"),
    p("Owner-occupant programs can finance 2–4 unit buildings with lower down payments if you live in one unit. Talk to a licensed loan officer about current program terms."),
    h("How much down do I need for a 6-unit?"),
    p("At six units you're in commercial-loan territory — typically 20–30% down plus reserves, with the exact figure driven by the building's DSCR and the lender."),
    h("Do rates differ for commercial multifamily?"),
    p("Yes. Commercial and DSCR loans usually price differently than owner-occupied residential mortgages, and terms vary by lender and building. We're not a lender, but we'll point you to the right ones."),
    p("*AJ Commercial Group is a brokerage, not a lender or financial advisor — consult a licensed loan officer for terms.* Ready to buy? [Contact us](/contact) or call (630) 895-7989."),
  ],
});

// ===== POST 8 — Sell vs refinance (decision, high intent) =====
posts.push({
  slug: "sell-or-refinance-apartment-building-2026",
  title: "Should You Sell or Refinance Your Apartment Building in 2026?",
  excerpt:
    "The five signals it's time to sell your apartment building, when a refinance makes more sense, and how to run the numbers on both in today's Chicagoland market.",
  category: "Selling",
  tags: ["selling", "refinance", "strategy", "multifamily"],
  author: "Joey Batliner",
  date: "2026-07-11",
  meta_title: "Sell or Refinance Your Apartment Building in 2026? A Decision Guide",
  meta_description:
    "Should you sell or refinance your apartment building in 2026? The signals that point to selling, when refinancing wins, and how to run the numbers on both.",
  blocks: [
    p("It's the question every apartment owner eventually faces: cash out by selling, or pull equity through a refinance and hold? There's no universal right answer — but there is a right answer for your building, your goals, and this market. Here's how to think it through."),
    h("Five signals it may be time to sell"),
    list([
      "Your equity has peaked and you'd rather redeploy it than watch it sit.",
      "Big capital expenses are coming — roof, tuckpointing, mechanicals — that you'd rather not fund.",
      "You're tired of managing (the honest one that drives a lot of sales).",
      "Your tax basis and depreciation are largely used up, so the building shelters less income than it used to.",
      "A life change — retirement, estate planning, a move — is reshaping your priorities.",
    ]),
    h("When refinancing makes more sense"),
    p("If the building still fits your life, cash-flows well, and you have a low fixed-rate loan you'd hate to give up, refinancing (or a supplemental loan) can pull tax-free cash out while you keep the asset and its future upside. The catch in a higher-rate environment: a refinance may reset your whole loan to today's rates, which can erase the benefit. Run it carefully."),
    h("Running the numbers"),
    p("Compare apples to apples: net sale proceeds after tax (or after a [1031 exchange](/blog/1031-exchange-illinois-multifamily) defers that tax) versus the cash you'd net from a refinance and the payment that comes with it. You can't make this call without knowing what the building is worth today — start with our guide to [multifamily valuation](/blog/how-to-value-apartment-building) or just get a free number from us."),
    h("How today's Chicagoland market tilts the decision"),
    p("Pricing is off the 2021 peak but stabilized buildings are still trading, and refinances are more expensive than they were two years ago. That combination pushes more owners toward selling — especially those who'd otherwise refinance into a much higher rate. Our [market report](/blog/chicagoland-multifamily-market-report) has the current backdrop."),
    p("The best decisions come from real numbers, not gut feel. We'll value your building and walk you through both paths — no pressure to list."),
    cta("Get a free valuation and we'll walk both paths", "/selling"),
    divider(),
    h("Frequently Asked Questions"),
    h("Is 2026 a good time to sell multifamily in Chicago?"),
    p("For clean, stabilized buildings, yes — demand is still there even off the peak, and motivated 1031 buyers pay up. The right timing depends on your equity, taxes, and goals more than on calling the market."),
    h("How do I avoid capital gains when I sell?"),
    p("You don't avoid it permanently, but a properly structured 1031 exchange defers it — often indefinitely — by reinvesting into a replacement property."),
    h("What if I still have a low interest rate?"),
    p("That's a real reason to consider holding or a supplemental loan rather than a full refinance. We'll factor your existing debt into the sell-vs-hold math."),
    h("Should I sell occupied or vacant?"),
    p("Usually occupied for an investment sale, since in-place income has value — but it's building-specific. We'll advise on what maximizes your price."),
    p("On the fence? [Contact us](/contact) or call (630) 895-7989 for a candid read on your building."),
  ],
});

// ===== POST 9 — Valuation × Cook County tax (intersection, low competition) =====
posts.push({
  slug: "cook-county-reassessment-apartment-value",
  title: "How Cook County's Property Tax Reassessment Affects Your Building's Value",
  excerpt:
    "A rising Cook County assessment quietly cuts your NOI — and therefore your building's value. Here's how reassessment works, and how to protect your value.",
  category: "Valuations",
  tags: ["cook county", "property taxes", "valuation", "reassessment"],
  author: "Joey Batliner",
  date: "2026-07-03",
  meta_title: "Cook County Reassessment & Your Apartment Building's Value",
  meta_description:
    "How Cook County's property tax reassessment lowers your apartment building's value by cutting NOI — plus how buyers underwrite tax hikes and how to appeal.",
  blocks: [
    p("Property taxes are one of the largest expenses on any Cook County apartment building — and when the county reassesses, a higher tax bill quietly eats into your net operating income. Since value is NOI divided by cap rate, that reassessment can lower what your building is worth without a single thing changing about the building itself. Here's what owners need to know."),
    h("How Cook County reassessment works"),
    p("Cook County reassesses property on a triennial (every three years) cycle by region. When your area comes up, the Assessor sets a new assessed value that drives your tax bill for the next cycle. For income property, a big jump can meaningfully raise your single largest controllable expense."),
    h("Why a higher assessment cuts your value"),
    p("Walk the math: higher taxes mean lower NOI, and lower NOI at the same cap rate means a lower price. A few thousand dollars of extra annual taxes, capitalized at a market cap rate, can knock tens of thousands off your building's value. It's one of the most underappreciated levers in multifamily — see [how valuation works](/blog/how-to-value-apartment-building) for the full formula."),
    h("Reading your assessment notice"),
    p("When your reassessment notice arrives, don't just file it. Check the assessed value against comparable buildings and against what your building could actually sell for. An over-assessment is appealable — but there are deadlines."),
    h("Appeals: process and deadlines"),
    list([
      "You can appeal to the Assessor and, separately, to the Board of Review.",
      "Each has a filing window — miss it and you wait for the next cycle.",
      "Strong appeals use evidence: comparable assessments, recent sale prices, and income data.",
    ]),
    h("How buyers underwrite future tax increases"),
    p("Sophisticated buyers don't use your current tax bill — they model what taxes will be after they buy, including any looming reassessment. If your building is due to reset, buyers price that in, which affects your sale price. Getting ahead of it protects your value when you go to sell."),
    h("Cook vs. DuPage tax dynamics"),
    p("Tax treatment differs across county lines, which is part of why buyers weigh location so heavily — a topic we dig into in [DuPage vs. Will vs. the City](/blog/dupage-vs-will-vs-chicago-multifamily-investment)."),
    cta("Worried taxes are eroding your value? Get a current valuation", "/selling"),
    divider(),
    h("Frequently Asked Questions"),
    h("When is my building reassessed?"),
    p("Cook County works on a three-year cycle by region. Your notice will tell you when your area is up; we can also help you check."),
    h("Can I appeal my apartment building's assessment?"),
    p("Yes — you can appeal to the Assessor and the Board of Review within their filing windows, using comparable and income evidence."),
    h("How much do taxes affect a building's price?"),
    p("Directly and significantly. Because taxes reduce NOI, and value is NOI divided by cap rate, a tax increase capitalizes into a real reduction in value."),
    h("Do buyers factor in tax hikes when they offer?"),
    p("Experienced buyers underwrite post-sale taxes, including expected reassessments — so an unaddressed increase can lower your offers."),
    p("Concerned about how taxes affect your building's worth? [Contact us](/contact) or call (630) 895-7989. *(We're brokers, not tax advisors — consult a property-tax attorney for appeals.)*"),
  ],
});

// ===== POST 10 — Buying × market comparison (intersection) =====
posts.push({
  slug: "dupage-vs-will-vs-chicago-multifamily-investment",
  title: "Chicagoland Multifamily Investment: DuPage vs. Will County vs. the City",
  excerpt:
    "Yield, stability, taxes, and growth compared across three Chicagoland multifamily markets — so you can decide where your next apartment building should be.",
  category: "Buying",
  tags: ["buying", "dupage", "will county", "chicago", "investment"],
  author: "Anthony Munoz",
  date: "2026-06-03",
  meta_title: "DuPage vs. Will County vs. Chicago: Where to Buy Multifamily",
  meta_description:
    "Comparing Chicagoland multifamily markets — DuPage, Will County, and the City — on yield, stability, taxes, and growth to help investors decide where to buy.",
  blocks: [
    p("\"Where should I buy?\" is the question behind most first conversations we have with investors. The Chicago metro isn't one market — it's several, each with a different trade-off between yield, stability, taxes, and growth. Here's how the three big options stack up."),
    h("The framework: yield vs. stability vs. growth"),
    p("Every market decision comes down to what you're optimizing for. Higher current yield usually comes with more risk or management. Stability usually comes at a lower cap rate (a higher price per dollar of income). Growth markets offer upside but less proven track record. There's no universally \"best\" market — only the best fit for your strategy and risk tolerance."),
    h("City of Chicago"),
    p("Higher going-in yields and the deepest inventory in the metro — but with more regulation, more property-tax volatility, and more hands-on management. Great for investors who want cash flow and can handle complexity."),
    h("DuPage County"),
    p("The stability play: low vacancy, strong schools, steady suburban rents, and a deep buyer pool that keeps values resilient. You'll pay a tighter cap rate for that stability, but you sleep well. It's why so many owners want to [sell here](/blog/sell-apartment-building-dupage-county) and why buyers compete for the product."),
    h("Will County"),
    p("The growth-and-access play: more accessible entry pricing, population and job growth, and solid tenant demand. Often where first-time and trade-up buyers find their footing before moving into pricier submarkets."),
    h("How they compare"),
    list([
      "Yield: City typically highest, Will in the middle, DuPage tightest.",
      "Stability: DuPage strongest, Will solid, City most variable.",
      "Taxes: watch Cook County reassessments closely (see our [Cook County tax guide](/blog/cook-county-reassessment-apartment-value)); collar counties differ.",
      "Entry price: Will generally most accessible, DuPage the priciest, City wide-ranging.",
    ]),
    h("Which fits which investor"),
    p("Cash-flow-focused and comfortable with management? The city rewards you. Want stability and long-term resilience? DuPage. Growing a portfolio on a budget? Will County is a strong starting point. Many of our clients own across all three — and we source deals in each. Underwrite every option the same way, using our [valuation guide](/blog/how-to-value-apartment-building)."),
    cta("Tell us your criteria — we'll send matching deals", "/buying"),
    divider(),
    h("Frequently Asked Questions"),
    h("Where are the best cap rates near Chicago?"),
    p("Generally, city and value-add buildings show higher cap rates than stabilized suburban product — but higher cap rate means higher risk or work. We'll show you current ranges by area."),
    h("Is DuPage or Will County better for apartments?"),
    p("DuPage offers more stability at a higher price; Will offers more accessible pricing and growth. The better choice depends on whether you're optimizing for resilience or entry cost."),
    h("Are city buildings riskier?"),
    p("They carry more regulatory and tax variability and often more management — offset by higher going-in yields. Risk-tolerant, cash-flow-focused investors do well there."),
    h("What's the entry price for a small building in each market?"),
    p("It varies widely by size and condition, so there's no single figure — ask us and we'll share recent comparable sales for each area."),
    p("Deciding where to buy? [Get on our buyer list](/buying) or call (630) 895-7989 and we'll send buildings across all three markets that fit your criteria."),
  ],
});

// __POSTS__

/**
 * Learn the real column names on the `posts` table by reading one existing row.
 * This makes the seed drift-proof: whether the live DB uses author/date or
 * author_slug/published_at (a known inconsistency), we only ever write columns
 * that actually exist, mapping our fields onto whichever names are present.
 */
async function getColumns(): Promise<Set<string> | null> {
  const { data, error } = await supabase.from("posts").select("*").limit(1);
  if (error) {
    console.error("Could not read posts table:", error.message);
    return null;
  }
  if (data && data.length > 0) return new Set(Object.keys(data[0]));
  return null; // empty table — we'll send a conservative payload
}

function buildRow(post: SeedPost, cols: Set<string> | null): Record<string, unknown> {
  const { author, date, ...rest } = post;
  const row: Record<string, unknown> = { ...rest, status: "published" };

  // Author name → whichever column exists (prefer 'author', else 'author_slug').
  if (!cols || cols.has("author")) row.author = author;
  else if (cols.has("author_slug")) row.author_slug = author;

  // Publish date → 'date' or 'published_at', whichever exists.
  if (!cols || cols.has("date")) row.date = date;
  else if (cols.has("published_at")) row.published_at = date;

  // If we know the columns, drop anything the table doesn't have (safety net).
  if (cols) {
    for (const k of Object.keys(row)) if (!cols.has(k)) delete row[k];
  }
  return row;
}

async function run() {
  const cols = await getColumns();
  if (cols) console.log("Detected columns:", [...cols].join(", "), "\n");
  else console.log("Could not detect columns — sending a conservative payload.\n");

  let ok = 0;
  let fail = 0;
  for (const post of posts) {
    const row = buildRow(post, cols);
    const { error } = await supabase.from("posts").upsert(row, { onConflict: "slug" });
    if (error) {
      console.error("FAIL ", post.slug, "—", error.message);
      fail++;
    } else {
      console.log("ok   ", post.slug);
      ok++;
    }
  }
  console.log(`\nDone. ${ok} upserted, ${fail} failed, ${posts.length} total.`);
  process.exit(fail ? 1 : 0);
}

run();
