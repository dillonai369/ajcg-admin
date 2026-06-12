// Types match the shapes of the JSON files in /data exactly.
// Read /data/*.json before changing — adding required fields will break existing rows.

export type TrackRecordItem = {
  property_slug: string;
  name: string;
  subtitle: string;
  image?: string;
};

export type Broker = {
  slug: string;
  page_slug?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  phone_raw?: string;
  photo_url: string;
  card_photo_url?: string;
  bio: string;
  track_record: TrackRecordItem[];
  is_partner: boolean;
  canonical_url?: string;
  meta_description?: string;
  display_order: number;

  // Editable extensions (optional — get persisted but not required for legacy rows)
  specialties?: string[];
  linkedin_url?: string;
  crexi_url?: string;
  tagline?: string;
  license_number?: string;
  years_in_cre?: number | string;
  joined_date?: string;
  education?: string;
  certifications?: string;
  languages?: string;
  total_closed?: string;
  units_sold?: string;
  deals_closed?: string | number;
  avg_days_on_market?: string | number;
  show_on_team_page?: boolean;
  feature_on_homepage?: boolean;
  hide_phone?: boolean;
};

export type Property = {
  slug: string;
  page_slug?: string;
  name: string;
  city?: string;
  address?: string;
  location?: string;
  units: string;
  type: string;
  facts?: string;
  description: string;
  body: string;
  hero_image: string;
  images: string[];
  canonical_url?: string;
  status: string;

  // Editable extensions
  state?: string;
  zip?: string;
  neighborhood?: string;
  submarket?: string;
  total_sqft?: string;
  lot_size?: string;
  year_built?: string;
  year_renovated?: string;
  stories?: string;
  building_class?: string;
  parking?: string;
  heating?: string;
  sale_price?: string;
  sale_date?: string;
  cap_rate?: string;
  noi?: string;
  gross_income?: string;
  highlights?: string[];
  broker_slugs?: string[]; // assigned broker slugs (matches Supabase column name)
  feature_on_homepage?: boolean;
  show_in_sold_carousel?: boolean;
  hide_sale_price?: boolean;
  meta_title?: string;
  meta_description?: string;
};

export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  hero_image_index?: string;
  hero_image_class?: string;
  status: string;

  // Editable extensions
  hero_image?: string;
  hero_alt?: string;
  author?: string;
  blocks?: PostBlock[];
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  date?: string;
  views?: number | string;
};

export type PostBlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "gallery"
  | "quote"
  | "list"
  | "video"
  | "divider"
  | "cta";

export type PostBlock = {
  id: string;
  type: PostBlockType;
  text?: string;
  caption?: string;
  attribution?: string;
  url?: string;
  images?: string[];
};
