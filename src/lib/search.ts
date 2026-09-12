import { marketplaceDomains, marketplaceFromUrl } from "@/lib/marketplaces";

export type ProductListing = {
  id: string;
  title: string;
  store: string;
  domain: string;
  price?: string;
  numericPrice?: number;
  image?: string;
  link: string;
  rating?: string;
  reviews?: string;
  availability?: string;
  sourceType: "photo" | "text";
};

export type ProductGroup = {
  id: string;
  title: string;
  image?: string;
  listings: ProductListing[];
};

type UnknownRecord = Record<string, unknown>;

const rupeePattern = /₹\s?[\d,]+(?:\.\d{1,2})?|rs\.?\s?[\d,]+(?:\.\d{1,2})?/i;

export function extractPrice(value: unknown): { price?: string; numericPrice?: number } {
  if (!value) {
    return {};
  }

  const raw = typeof value === "string" ? value : JSON.stringify(value);
  const match = raw.match(rupeePattern);
  if (!match) {
    return {};
  }

  const price = match[0].replace(/^rs\.?/i, "₹").replace(/\s+/g, "");
  const numericPrice = Number(price.replace(/[^\d.]/g, ""));
  return { price, numericPrice: Number.isFinite(numericPrice) ? numericPrice : undefined };
}

export function normalizeTitle(title: string) {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s+[-|].*$/, "")
    .trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function makeMarketplaceQuery(query: string) {
  const sites = marketplaceDomains.map((domain) => `site:${domain}`).join(" OR ");
  return `${query} (${sites})`;
}

export function sortListings(listings: ProductListing[]) {
  return [...listings].sort((a, b) => {
    if (a.numericPrice && b.numericPrice) {
      return a.numericPrice - b.numericPrice;
    }

    if (a.numericPrice) {
      return -1;
    }

    if (b.numericPrice) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });
}

export function groupListings(listings: ProductListing[]): ProductGroup[] {
  const grouped = new Map<string, ProductListing[]>();

  for (const listing of listings) {
    const key = slugify(normalizeTitle(listing.title).split(" ").slice(0, 8).join(" "));
    grouped.set(key, [...(grouped.get(key) ?? []), listing]);
  }

  return Array.from(grouped.entries()).map(([id, group]) => {
    const sorted = sortListings(group);
    return {
      id,
      title: normalizeTitle(sorted[0]?.title ?? "Product"),
      image: sorted.find((listing) => listing.image)?.image,
      listings: sorted,
    };
  });
}

export function normalizeGoogleItem(item: UnknownRecord, index: number): ProductListing | undefined {
  const link = typeof item.link === "string" ? item.link : "";
  const marketplace = marketplaceFromUrl(link);

  if (!link || !marketplace) {
    return undefined;
  }

  const pagemap = (item.pagemap ?? {}) as UnknownRecord;
  const metatags = Array.isArray(pagemap.metatags) ? (pagemap.metatags[0] as UnknownRecord | undefined) : undefined;
  const cseImage = Array.isArray(pagemap.cse_image) ? (pagemap.cse_image[0] as UnknownRecord | undefined) : undefined;
  const title = typeof item.title === "string" ? normalizeTitle(item.title) : "Marketplace listing";
  const snippet = typeof item.snippet === "string" ? item.snippet : "";
  const priceInfo = extractPrice(`${title} ${snippet} ${JSON.stringify(metatags ?? {})}`);

  return {
    id: `${marketplace.domain}-${index}-${slugify(title)}`,
    title,
    store: marketplace.name,
    domain: marketplace.domain,
    price: priceInfo.price,
    numericPrice: priceInfo.numericPrice,
    image:
      (typeof cseImage?.src === "string" && cseImage.src) ||
      (typeof metatags?.["og:image"] === "string" && metatags["og:image"]) ||
      undefined,
    link,
    availability: snippet,
    sourceType: "text",
  };
}

export function normalizeLensItem(item: UnknownRecord, index: number): ProductListing | undefined {
  const link = typeof item.link === "string" ? item.link : "";
  const marketplace = marketplaceFromUrl(link);

  if (!link || !marketplace) {
    return undefined;
  }

  const title = typeof item.title === "string" ? normalizeTitle(item.title) : "Visual match";
  const priceInfo = extractPrice(item.price ?? item.extracted_price ?? item.subtitle);
  const source = typeof item.source === "string" ? item.source : marketplace.name;

  return {
    id: `${marketplace.domain}-lens-${index}-${slugify(title)}`,
    title,
    store: source.includes(".") ? marketplace.name : source,
    domain: marketplace.domain,
    price: priceInfo.price,
    numericPrice: priceInfo.numericPrice,
    image:
      (typeof item.thumbnail === "string" && item.thumbnail) ||
      (typeof item.image === "string" && item.image) ||
      undefined,
    link,
    rating: typeof item.rating === "string" ? item.rating : undefined,
    reviews: typeof item.reviews === "string" ? item.reviews : undefined,
    availability: typeof item.in_stock === "boolean" ? (item.in_stock ? "In stock" : "Stock not confirmed") : undefined,
    sourceType: "photo",
  };
}

