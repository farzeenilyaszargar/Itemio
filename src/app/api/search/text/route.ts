import { NextResponse } from "next/server";
import { makeMarketplaceQuery, normalizeSerpApiSearchItem, sortListings } from "@/lib/search";

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
  url.searchParams.set("num", "20");
  url.searchParams.set("gl", "in");
  url.searchParams.set("hl", "en");
  url.searchParams.set("google_domain", "google.co.in");

  let response: Response;
  let data: { error?: string; shopping_results?: Record<string, unknown>[]; organic_results?: Record<string, unknown>[] };

  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    data = await response.json();
  } catch {
    return NextResponse.json(
      { error: "Marketplace search timed out. Please try again." },
      { status: 504 },
    );
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

  return NextResponse.json({ query, listings: sortListings(listings) });
}
