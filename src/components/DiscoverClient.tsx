"use client";

import { FormEvent, useMemo, useState } from "react";
import { Camera, Loader2, Search, Upload } from "lucide-react";
import { CompactListing, ListingCard } from "@/components/ListingCard";
import { groupListings, type ProductListing } from "@/lib/search";

type SearchResponse = {
  listings?: ProductListing[];
  error?: string;
  hint?: string;
};

type DiscoverMode = "photo" | "browse";

export function DiscoverClient() {
  const [activeMode, setActiveMode] = useState<DiscoverMode>("photo");
  const [photoListings, setPhotoListings] = useState<ProductListing[]>([]);
  const [textListings, setTextListings] = useState<ProductListing[]>([]);
  const [query, setQuery] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");
  const [textStatus, setTextStatus] = useState("");
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);

  const productGroups = useMemo(() => groupListings(textListings), [textListings]);

  async function handlePhotoUpload(file?: File) {
    if (!file) {
      return;
    }

    setIsPhotoLoading(true);
    setPhotoStatus("");
    setPhotoListings([]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/search/photo", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as SearchResponse;
      if (!response.ok) {
        setPhotoStatus(data.hint ?? data.error ?? "Photo search could not run right now.");
        return;
      }
      setPhotoListings(data.listings ?? []);
      setPhotoStatus(data.listings?.length ? "" : "No Indian marketplace matches found for this photo.");
    } catch {
      setPhotoStatus("Photo search failed. Please try again on a stable connection.");
    } finally {
      setIsPhotoLoading(false);
    }
  }

  async function handleTextSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    setIsTextLoading(true);
    setTextStatus("");
    setTextListings([]);

    try {
      const response = await fetch(`/api/search/text?q=${encodeURIComponent(query.trim())}`);
      const data = (await response.json()) as SearchResponse;
      if (!response.ok) {
        setTextStatus(data.hint ?? data.error ?? "Search could not run right now.");
        return;
      }
      setTextListings(data.listings ?? []);
      setTextStatus(data.listings?.length ? "" : "No marketplace listings found. Try a more specific item name.");
    } catch {
      setTextStatus("Search failed. Please try again on a stable connection.");
    } finally {
      setIsTextLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-5">
        <div className="grid grid-cols-2 gap-1 rounded-[8px] border border-stone-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            aria-pressed={activeMode === "photo"}
            onClick={() => setActiveMode("photo")}
            className={`flex h-11 items-center justify-center gap-2 rounded-[6px] text-sm font-black transition ${
              activeMode === "photo" ? "bg-stone-950 text-white" : "text-stone-600"
            }`}
          >
            <Camera aria-hidden="true" size={16} />
            Find price
          </button>
          <button
            type="button"
            aria-pressed={activeMode === "browse"}
            onClick={() => setActiveMode("browse")}
            className={`flex h-11 items-center justify-center gap-2 rounded-[6px] text-sm font-black transition ${
              activeMode === "browse" ? "bg-stone-950 text-white" : "text-stone-600"
            }`}
          >
            <Search aria-hidden="true" size={16} />
            Browse items
          </button>
        </div>

        {activeMode === "photo" ? (
          <>
            <section className="overflow-hidden rounded-[8px] border border-stone-200 bg-white shadow-sm">
              <div className="space-y-4 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#E0B71D]/15 text-stone-950">
                  <Camera aria-hidden="true" size={26} />
                </div>
                <div>
                  <h1 className="text-3xl font-black leading-9">
                    Snap it. Compare the <span className="text-[#E0B71D]">right</span> price.
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    Upload a product photo and we’ll look for matching listings across shopping sites.
                  </p>
                </div>
                <label className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-stone-950 px-4 text-sm font-black text-white shadow-sm">
                  {isPhotoLoading ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Upload aria-hidden="true" size={18} />}
                  {isPhotoLoading ? "Searching..." : "Choose photo"}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
                  />
                </label>
              </div>
              <div className="border-t border-stone-100 bg-stone-50 px-5 py-3">
                <p className="text-xs leading-5 text-stone-500">Use a clear product photo under 500 KB for the best match.</p>
              </div>
            </section>

            {(photoStatus || photoListings.length > 0) && (
              <section className="space-y-3">
                <h2 className="text-lg font-black">Photo matches</h2>
                {photoStatus && <p className="rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{photoStatus}</p>}
                <div className="space-y-3">
                  {photoListings.slice(0, 8).map((listing) => (
                    <CompactListing key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <section className="space-y-4 rounded-[8px] border border-stone-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Browse to buy</p>
                <h2 className="mt-2 text-2xl font-black leading-8">Search beautiful finds across stores.</h2>
              </div>
              <form onSubmit={handleTextSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search trousers, lipstick, headphones..."
                    className="h-12 w-full rounded-[8px] border border-stone-300 bg-stone-50 pl-10 pr-3 text-sm outline-none ring-teal-700 focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-stone-950 text-white disabled:opacity-60"
                  disabled={isTextLoading}
                  aria-label="Search"
                >
                  {isTextLoading ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Upload aria-hidden="true" size={18} />}
                </button>
              </form>
              {textStatus && <p className="rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{textStatus}</p>}
            </section>

            <section className="grid grid-cols-2 gap-3 pb-8">
              {productGroups.map((group) => (
                <ListingCard key={group.id} group={group} />
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
