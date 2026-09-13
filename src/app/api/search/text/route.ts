import { NextResponse } from "next/server";
import { demoBrowseListings } from "@/lib/demo-listings";
import { makeMarketplaceQuery, normalizeSerpApiSearchItem, sortListings } from "@/lib/search";

const liveSearchTimeoutMs = 8000;

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
  ).slice(0, 20);
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

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", makeMarketplaceQuery(query));
  url.searchParams.set("num", "10");
  url.searchParams.set("gl", "in");
  url.searchParams.set("hl", "en");
  url.searchParams.set("google_domain", "google.co.in");

  let response: Response;
  let data: { error?: string; shopping_results?: Record<string, unknown>[]; organic_results?: Record<string, unknown>[] };

  try {
    const liveSearch = fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(liveSearchTimeoutMs),
    }).then(async (nextResponse) => ({
      response: nextResponse,
      data: (await nextResponse.json()) as typeof data,
    }));
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("SerpApi search timed out.")), liveSearchTimeoutMs);
    });
    const result = await Promise.race([liveSearch, timeout]);
    response = result.response;
    data = result.data;
  } catch {
    const listings = fallbackListings(query);

    if (listings.length > 0) {
      return NextResponse.json({
        query,
        listings,
        hint: "Live marketplace search took too long, so showing matching preloaded listings.",
      });
    }

    return NextResponse.json({ query, listings: [], hint: "Live marketplace search took too long. Try a more specific item name." });
  }

  if (!response.ok || data.error) {
    return NextResponse.json(
      { error: data.error ?? "SerpApi marketplace search failed." },
      { status: response.ok ? 502 : response.status },
    );
  }

  const rawResults = [
    ...((data.shopping_results ?? []) as Record<string, unknown>[]),
    ...((data.organic_results ?? []) as Record<string, unknown>[]),
  ];

  const listings = rawResults
    .map((item, index) => normalizeSerpApiSearchItem(item, index))
    .filter((item) => item !== undefined);

  const sortedListings = sortListings(listings);
  return NextResponse.json({ query, listings: sortedListings.length ? sortedListings : fallbackListings(query) });
}
