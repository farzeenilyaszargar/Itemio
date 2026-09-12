"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Loader2, Search, Upload, User } from "lucide-react";
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
  const hasOverflowContent = photoStatus || photoListings.length > 0 || textStatus || productGroups.length > 0;

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
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <section
        className={`mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 md:gap-6 md:px-8 md:py-5 lg:px-10 ${
          hasOverflowContent ? "min-h-dvh" : "h-dvh overflow-hidden"
        }`}
      >
        <header className="hidden items-center justify-between md:flex">
          <Link href="/" className="flex h-11 items-center gap-1.5">
            <Image
              src="/kitne-rupay-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="hidden font-krona text-[15px] leading-none tracking-normal md:inline">Kitne Rupay</span>
          </Link>
          <button
            type="button"
            aria-label="Demo profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
          >
            <User aria-hidden="true" size={18} />
          </button>
        </header>

        <div className="relative grid grid-cols-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-stone-200 md:mx-auto md:w-full md:max-w-md">
          <div
            className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-stone-950 shadow-sm transition-transform duration-300 ease-out ${
              activeMode === "browse" ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
            }`}
          />
          <button
            type="button"
            aria-pressed={activeMode === "photo"}
            onClick={() => setActiveMode("photo")}
            className={`relative z-10 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-black transition-colors duration-300 ${
              activeMode === "photo" ? "text-white" : "text-stone-600"
            }`}
          >
            <Camera aria-hidden="true" size={16} />
            Find price
          </button>
          <button
            type="button"
            aria-pressed={activeMode === "browse"}
            onClick={() => setActiveMode("browse")}
            className={`relative z-10 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-black transition-colors duration-300 ${
              activeMode === "browse" ? "text-white" : "text-stone-600"
            }`}
          >
            <Search aria-hidden="true" size={16} />
            Browse items
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 md:gap-6">
          <div className="flex min-h-0 flex-1 flex-col">
            {activeMode === "photo" ? (
              <>
                <div
                  className={`flex flex-col ${
                    photoStatus || photoListings.length > 0
                      ? ""
                      : "min-h-0 flex-1 items-center justify-center text-center"
                  }`}
                >
                  <section className="flex w-full max-w-2xl flex-col items-center gap-5 px-1 py-1 md:px-0 md:py-8">
                    <div className="flex flex-col items-center gap-3 md:gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E0B71D]/15 text-stone-950 md:h-14 md:w-14">
                        <Camera aria-hidden="true" size={24} />
                      </div>
                      <div>
                        <h1 className="text-[2rem] font-black leading-[2.45rem] md:text-5xl md:leading-[3.65rem]">
                          Snap it. Compare the <span className="text-[#E0B71D]">right</span> price.
                        </h1>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-600 md:text-base md:leading-7">
                          Upload a product photo and we’ll look for matching listings across shopping sites.
                        </p>
                      </div>
                    </div>
                    <label className="flex h-14 w-full max-w-[240px] cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-950 px-4 text-sm font-black text-white shadow-sm">
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
                  </section>
                  <p className="mt-2 max-w-md px-1 text-xs leading-5 text-stone-400">Use a clear product photo under 500 KB for the best match.</p>
                </div>

                {(photoStatus || photoListings.length > 0) && (
                  <section className="mt-6 space-y-3">
                    <h2 className="text-lg font-black">Photo matches</h2>
                    {photoStatus && <p className="rounded-[8px] bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{photoStatus}</p>}
                    <div className="divide-y divide-stone-200 rounded-[8px] bg-white px-4 shadow-sm ring-1 ring-stone-200 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:px-0">
                      {photoListings.slice(0, 8).map((listing) => (
                        <CompactListing key={listing.id} listing={listing} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <>
                <section className="space-y-5 px-1 py-1 md:px-0 md:py-8">
                  <div>
                    <h2 className="text-[2rem] font-black leading-[2.45rem] md:text-5xl md:leading-[3.65rem]">Search beautiful finds across stores.</h2>
                  </div>
                  <form onSubmit={handleTextSearch} className="md:max-w-2xl">
                    <div className="relative flex-1">
                      {isTextLoading ? (
                        <Loader2 aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />
                      ) : (
                        <Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      )}
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search trousers, lipstick, headphones..."
                        className="h-12 w-full rounded-full bg-stone-100 pl-10 pr-3 text-sm outline-none ring-stone-950 transition focus:bg-white focus:ring-2"
                      />
                    </div>
                  </form>
                  {textStatus && <p className="rounded-[8px] bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{textStatus}</p>}
                </section>

                <section className="grid grid-cols-2 gap-3 pb-8 pt-6 md:grid-cols-3 lg:grid-cols-4">
                  {productGroups.map((group) => (
                    <ListingCard key={group.id} group={group} />
                  ))}
                </section>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
