import { NextResponse } from "next/server";
import { demoBrowseListings } from "@/lib/demo-listings";
import { slugify, sortListings, type ProductListing } from "@/lib/search";

type SerpApiResponse = {
  error?: string;
  shopping_results?: Record<string, unknown>[];
  organic_results?: Record<string, unknown>[];
};

const liveSearchTimeoutMs = 12000;
const productOfferTimeoutMs = 6000;

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numericPrice(price: string | undefined) {
  if (!price) {
    return undefined;
  }

  const value = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function domainFromLink(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "store";
  }
}

function fallbackListings(query: string) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return [];
  }

  return sortListings(
    demoBrowseListings.filter((listing) => {
      const haystack = `${listing.title} ${listing.store} ${listing.domain} ${listing.availability ?? ""}`.toLowerCase();
      return words.some((word) => haystack.includes(word));
    }),
  ).slice(0, 24);
}

function queryWords(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word.length > 2);
}

function strongFallbackListings(query: string) {
  const words = queryWords(query);

  if (words.length === 0) {
    return [];
  }

  return sortListings(
    demoBrowseListings.filter((listing) => {
      const title = listing.title.toLowerCase();
      return words.every((word) => title.includes(word));
    }),
  ).slice(0, 24);
}

function serpApiUrl(apiKey: string, params: Record<string, string>) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("api_key", apiKey);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url;
}

async function fetchJson<T>(url: URL, timeoutMs: number) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = (await response.json()) as T;

  if (!response.ok || (typeof data === "object" && data && "error" in data)) {
    throw new Error(typeof (data as { error?: unknown }).error === "string" ? (data as { error: string }).error : "SerpApi request failed.");
  }

  return data;
}

async function directShoppingListings(query: string, apiKey: string) {
  const words = queryWords(query);
  const shoppingUrl = serpApiUrl(apiKey, {
    engine: "google_shopping",
    q: query,
    gl: "in",
    hl: "en",
    google_domain: "google.co.in",
    num: "12",
  });
  const data = await fetchJson<SerpApiResponse>(shoppingUrl, liveSearchTimeoutMs);
  const products = (data.shopping_results ?? [])
    .filter((item) => {
      const title = getString(item.title)?.toLowerCase() ?? "";
      const matches = words.filter((word) => title.includes(word)).length;
      return words.length <= 1 || matches >= Math.min(3, words.length);
    })
    .filter((item) => getString(item.serpapi_immersive_product_api))
    .slice(0, 6);

  const nestedListings = await Promise.all(
    products.map(async (product, productIndex) => {
      const productTitle = getString(product.title) ?? query;
      const productImage = getString(product.thumbnail) ?? getString(product.serpapi_thumbnail);
      const productApi = getString(product.serpapi_immersive_product_api);

      if (!productApi) {
        return [];
      }

      try {
        const offerUrl = new URL(productApi);
        offerUrl.searchParams.set("api_key", apiKey);
        const offerData = await fetchJson<{ product_results?: { stores?: Record<string, unknown>[]; thumbnails?: string[] } }>(
          offerUrl,
          productOfferTimeoutMs,
        );
        const image = offerData.product_results?.thumbnails?.[0] ?? productImage;
        const stores = offerData.product_results?.stores ?? [];
        const seenStores = new Set<string>();

        return stores
          .map((store, storeIndex): ProductListing | undefined => {
            const link = getString(store.link);
            const price = getString(store.price) ?? (typeof store.extracted_price === "number" ? `₹${store.extracted_price}` : undefined);
            const storeName = getString(store.name) ?? getString(store.source) ?? (link ? domainFromLink(link) : undefined);

            if (!link || !price || !image || !storeName || link.includes("google.")) {
              return undefined;
            }

            const domain = domainFromLink(link);
            const storeKey = `${domain}-${storeName}`.toLowerCase();

            if (seenStores.has(storeKey)) {
              return undefined;
            }

            seenStores.add(storeKey);

            return {
              id: `live-${slugify(domain)}-${productIndex}-${storeIndex}-${slugify(productTitle)}`,
              title: productTitle,
              store: storeName,
              domain,
              price: price.replace(/^rs\.?\s*/i, "₹"),
              numericPrice: numericPrice(price),
              image,
              link,
              availability: getString(store.delivery) ?? `Current listing on ${storeName}`,
              sourceType: "text",
            };
          })
          .filter((listing) => listing !== undefined)
          .slice(0, 4);
      } catch {
        return [];
      }
    }),
  );

  return nestedListings.flat();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const apiKey = process.env.SERPAPI_KEY;

  if (!query) {
    return NextResponse.json({ error: "Missing search query." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "SerpApi is not configured.",
        hint: "Set SERPAPI_KEY to search Indian marketplaces.",
      },
      { status: 503 },
    );
  }

  const strongFallback = strongFallbackListings(query);

  if (strongFallback.length > 0) {
    return NextResponse.json({ query, listings: strongFallback });
  }

  let liveSearchIssue = "";

  try {
    const liveListings = await Promise.race([
      directShoppingListings(query, apiKey),
      new Promise<ProductListing[]>((_, reject) => {
        setTimeout(() => reject(new Error("Live shopping search timed out.")), liveSearchTimeoutMs);
      }),
    ]);

    if (liveListings.length > 0) {
      return NextResponse.json({ query, listings: sortListings(liveListings).slice(0, 24) });
    }
    liveSearchIssue = "Live search returned no direct marketplace offers.";
  } catch (error) {
    liveSearchIssue = error instanceof Error ? error.message : "Live marketplace search failed.";
    // Fall through to preloaded fallback. Organic search is intentionally skipped because it often lacks images and direct product links.
  }

  const fallback = fallbackListings(query);

  return NextResponse.json({
    query,
    listings: fallback,
    hint: fallback.length
      ? "Live search is temporarily slow, so showing matching preloaded listings."
      : `Live marketplace search is temporarily unavailable${liveSearchIssue ? `: ${liveSearchIssue}` : ""}. This may be an API limit or timeout, not a lack of listings. Please try again shortly.`,
  });
}
