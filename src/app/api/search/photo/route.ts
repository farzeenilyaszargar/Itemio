import { NextResponse } from "next/server";
import { normalizeLensItem, sortListings } from "@/lib/search";

export async function POST(request: Request) {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "SerpApi is not configured.",
        hint: "Set SERPAPI_KEY to enable photo-based Google Lens product search.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Upload an image file." }, { status: 400 });
  }

  if (image.size > 500 * 1024) {
    return NextResponse.json(
      { error: "Image is too large.", hint: "Please upload an image under 500 KB for SerpApi Lens upload." },
      { status: 413 },
    );
  }

  const uploadForm = new FormData();
  uploadForm.set("image", image);

  const uploadUrl = new URL("https://serpapi.com/image");
  uploadUrl.searchParams.set("api_key", apiKey);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: uploadForm,
  });
  const uploadData = await uploadResponse.json();

  if (!uploadResponse.ok || !uploadData.image_id) {
    return NextResponse.json(
      { error: uploadData.error ?? "Image upload to SerpApi failed." },
      { status: uploadResponse.status || 502 },
    );
  }

  const lensUrl = new URL("https://serpapi.com/search");
  lensUrl.searchParams.set("engine", "google_lens");
  lensUrl.searchParams.set("api_key", apiKey);
  lensUrl.searchParams.set("image_id", uploadData.image_id);
  lensUrl.searchParams.set("type", "products");
  lensUrl.searchParams.set("country", "IN");
  lensUrl.searchParams.set("hl", "en");

  const lensResponse = await fetch(lensUrl, { cache: "no-store" });
  const lensData = await lensResponse.json();

  if (!lensResponse.ok) {
    return NextResponse.json(
      { error: lensData.error ?? "Google Lens request failed." },
      { status: lensResponse.status },
    );
  }

  const rawResults = [
    ...((lensData.visual_matches ?? []) as Record<string, unknown>[]),
    ...((lensData.product_results ?? []) as Record<string, unknown>[]),
    ...((lensData.exact_matches ?? []) as Record<string, unknown>[]),
  ];

  const listings = rawResults
    .map((item, index) => normalizeLensItem(item, index))
    .filter((item) => item !== undefined);

  return NextResponse.json({ listings: sortListings(listings) });
}

