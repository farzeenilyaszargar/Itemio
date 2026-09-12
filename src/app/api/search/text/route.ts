import { NextResponse } from "next/server";
import { makeMarketplaceQuery, normalizeGoogleItem, sortListings } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!query) {
    return NextResponse.json({ error: "Missing search query." }, { status: 400 });
  }

  if (!apiKey || !cx) {
    return NextResponse.json(
      {
        error: "Google Custom Search is not configured.",
        hint: "Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX to search Indian marketplaces.",
      },
      { status: 503 },
    );
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", makeMarketplaceQuery(query));
  url.searchParams.set("num", "10");
  url.searchParams.set("safe", "active");
  url.searchParams.set("gl", "in");
  url.searchParams.set("hl", "en");

  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "Google Custom Search request failed." },
      { status: response.status },
    );
  }

  const listings = ((data.items ?? []) as Record<string, unknown>[])
    .map((item, index) => normalizeGoogleItem(item, index))
    .filter((item) => item !== undefined);

  return NextResponse.json({ query, listings: sortListings(listings) });
}

