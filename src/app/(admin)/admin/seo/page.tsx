import Link from "next/link";
import { ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getProperties, getBrokers, getPosts } from "@/lib/data";
import { isPubliclyVisibleProperty, isPubliclyVisibleBroker, isPubliclyVisiblePost } from "@/lib/visibility";

export const dynamic = "force-dynamic";

const SITE = "https://www.ajcommercialgroup.com";
const GSC_URL = `https://search.google.com/search-console?resource_id=${encodeURIComponent(`${SITE}/`)}`;
const GBP_URL = "https://business.google.com/";
const STATIC_PAGES = 11; // home, recently-sold, our-team, selling, buying, exchange-1031, blog, contact, careers, privacy, terms

/**
 * Search presence. Everything here is measured from the database or links out
 * to the real tool. The previous version of this page was hard-coded sample
 * data (fake keyword positions, a fake domain authority, fake backlinks).
 * Rankings and backlinks need a rank-tracking subscription; until one is
 * connected, this page doesn't pretend to have them.
 */
export default async function SEOPage() {
  const [properties, brokers, posts] = await Promise.all([getProperties(), getBrokers(), getPosts()]);

  const pubProps = properties.filter(isPubliclyVisibleProperty);
  const pubBrokers = brokers.filter(isPubliclyVisibleBroker);
  const pubPosts = posts.filter(isPubliclyVisiblePost);
  const sitemapCount = STATIC_PAGES + pubProps.length + pubBrokers.length + pubPosts.length;

  const isExternalCdn = (u?: string) => !!u && /^https?:\/\//.test(u) && !/supabase\.(co|in)\//.test(u);
  const issues = {
    propNoMeta: pubProps.filter((p) => !(p.meta_description || "").trim() && !(p.description || "").trim()),
    propNoHero: pubProps.filter((p) => !(p.hero_image || p.images?.[0])),
    propExternalImg: pubProps.filter((p) => isExternalCdn(p.hero_image) || (p.images || []).some(isExternalCdn)),
    propScreenshot: pubProps.filter((p) => /screenshot/i.test(p.hero_image || "") || (p.images || []).some((i) => /screenshot/i.test(i))),
    postNoMeta: pubPosts.filter((p) => !(p.meta_description || p.excerpt || "").trim()),
    postNoHero: pubPosts.filter((p) => !(p.hero_image || "").trim()),
    brokerNoBio: pubBrokers.filter((b) => !(b.bio || "").trim()),
    brokerNoMeta: pubBrokers.filter((b) => !(b.meta_description || "").trim()),
  };

  const lastPost = pubPosts
    .map((p) => p.published_at || p.date || "")
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const Row = ({
    label,
    items,
    href,
    good,
  }: {
    label: string;
    items: Array<{ slug: string; name: string }>;
    href: (slug: string) => string;
    good: string;
  }) => (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 text-sm">
        {items.length === 0 ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        )}
        <span className="font-medium">{label}</span>
        <span className="text-slate-500">{items.length === 0 ? good : `${items.length}`}</span>
      </div>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.slice(0, 30).map((it) => (
            <Link key={it.slug} href={href(it.slug)} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 truncate max-w-[260px]">
              {it.name}
            </Link>
          ))}
          {items.length > 30 ? <span className="text-xs text-slate-500 px-2 py-1">+{items.length - 30} more</span> : null}
        </div>
      ) : null}
    </div>
  );

  const propItem = (p: { slug: string; name: string }) => ({ slug: p.slug, name: p.name });
  const postItem = (p: { slug: string; title: string }) => ({ slug: p.slug, name: p.title });
  const brokerItem = (b: { slug: string; name: string }) => ({ slug: b.slug, name: b.name });

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Search presence</h1>
          <p className="text-sm text-slate-500">What Google can see, and what&apos;s holding pages back</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={GSC_URL} target="_blank" rel="noopener" className="btn-ghost text-sm px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
            Search Console <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href={GBP_URL} target="_blank" rel="noopener" className="btn-ghost text-sm px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
            Business Profile <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <div className="p-8 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pages in sitemap</div>
            <div className="text-2xl font-semibold">{sitemapCount}</div>
            <a href={`${SITE}/sitemap.xml`} target="_blank" rel="noopener" className="text-xs text-slate-500 underline mt-1 inline-block">sitemap.xml</a>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Public listings</div>
            <div className="text-2xl font-semibold">{pubProps.length}</div>
            <div className="text-xs text-slate-500 mt-1">{properties.length - pubProps.length} hidden / draft</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Published posts</div>
            <div className="text-2xl font-semibold">{pubPosts.length}</div>
            <div className="text-xs text-slate-500 mt-1">{lastPost ? `Last: ${new Date(lastPost).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "None yet"}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Broker pages</div>
            <div className="text-2xl font-semibold">{pubBrokers.length}</div>
            <div className="text-xs text-slate-500 mt-1">{brokers.length - pubBrokers.length} hidden</div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm">Content checks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Each of these affects how a page looks in Google results or whether it&apos;s worth ranking at all. Click a name to fix it.</p>
          </div>
          <div className="divide-y divide-slate-100">
            <Row label="Listings using screenshots as photos" items={issues.propScreenshot.map(propItem)} href={(s) => `/admin/listings/${s}`} good="none" />
            <Row label="Listings with photos hosted off-site (old website builder)" items={issues.propExternalImg.map(propItem)} href={(s) => `/admin/listings/${s}`} good="all on our storage" />
            <Row label="Listings with no photo" items={issues.propNoHero.map(propItem)} href={(s) => `/admin/listings/${s}`} good="none" />
            <Row label="Listings with no description" items={issues.propNoMeta.map(propItem)} href={(s) => `/admin/listings/${s}`} good="all have one" />
            <Row label="Blog posts with no hero image" items={issues.postNoHero.map(postItem)} href={(s) => `/admin/blog/${s}`} good="none" />
            <Row label="Blog posts with no excerpt / meta description" items={issues.postNoMeta.map(postItem)} href={(s) => `/admin/blog/${s}`} good="all have one" />
            <Row label="Brokers with no bio" items={issues.brokerNoBio.map(brokerItem)} href={(s) => `/admin/brokers/${s}`} good="all have one" />
            <Row label="Brokers with no meta description" items={issues.brokerNoMeta.map(brokerItem)} href={(s) => `/admin/brokers/${s}`} good="all have one" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-2">What&apos;s set up</h3>
            <ul className="text-sm space-y-1.5 text-slate-700">
              <li>✓ Sitemap generated from the database, resubmitted automatically</li>
              <li>✓ robots.txt allows crawling; admin and API excluded</li>
              <li>✓ Business structured data (RealEstateAgent) on every page</li>
              <li>✓ Unique titles, descriptions, canonicals, share cards</li>
              <li>✓ Search Console verified · Google crawler allow-listed in the firewall</li>
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-2">Rankings &amp; backlinks</h3>
            <p className="text-sm text-slate-600">
              Keyword positions, impressions and clicks live in{" "}
              <a href={GSC_URL} target="_blank" rel="noopener" className="underline">Search Console → Performance</a>.
              Backlink and competitor tracking needs a rank-tracking tool (BrightLocal, Semrush) connected — nothing on
              this page is estimated.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
