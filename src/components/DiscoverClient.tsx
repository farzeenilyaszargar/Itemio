"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ExternalLink, IndianRupee, Loader2, Search, Upload, User, X } from "lucide-react";
import { CompactListing, ListingCard } from "@/components/ListingCard";
import { MobileOnlyNotice } from "@/components/MobileOnlyNotice";
import { readBrowseListingsCache, writeBrowseListingsCache } from "@/lib/browse-cache";
import { demoBrowseListings } from "@/lib/demo-listings";
import { groupListings, sortListings, type ProductGroup, type ProductListing } from "@/lib/search";

type SearchResponse = {
  listings?: ProductListing[];
  error?: string;
  hint?: string;
};

type DiscoverMode = "photo" | "browse";

type DiscoverClientProps = {
  initialMode?: DiscoverMode;
};

function shuffleListings(listings: ProductListing[]) {
  return [...listings]
    .map((listing) => ({ listing, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ listing }) => listing);
}

export function DiscoverClient({ initialMode = "photo" }: DiscoverClientProps) {
  const [activeMode, setActiveMode] = useState<DiscoverMode>(initialMode);
  const [photoListings, setPhotoListings] = useState<ProductListing[]>([]);
  const [textListings, setTextListings] = useState<ProductListing[]>(() => readBrowseListingsCache());
  const [query, setQuery] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");
  const [textStatus, setTextStatus] = useState("");
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [isSheetClosing, setIsSheetClosing] = useState(false);

  const shuffledDemoListings = useMemo(() => shuffleListings(demoBrowseListings), []);
  const productGroups = useMemo(() => groupListings(textListings.length ? textListings : shuffledDemoListings), [shuffledDemoListings, textListings]);
  const hasOverflowContent = photoStatus || photoListings.length > 0 || textStatus || productGroups.length > 0;

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedGroup]);

  function setMode(mode: DiscoverMode) {
    setActiveMode(mode);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      window.history.replaceState(null, "", url);
    }
  }

  function openProductSheet(group: ProductGroup) {
    setIsSheetClosing(false);
    setSelectedGroup(group);
  }

  function closeProductSheet() {
    setIsSheetClosing(true);
  }

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
      const nextListings = data.listings ?? [];
      setTextListings(nextListings);
      writeBrowseListingsCache(nextListings);
      setTextStatus(data.listings?.length ? "" : "No marketplace listings found. Try a more specific item name.");
    } catch {
      setTextStatus("Search failed. Please try again on a stable connection.");
    } finally {
      setIsTextLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <MobileOnlyNotice />
      <section
        className={`mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 md:hidden ${
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
            onClick={() => setMode("photo")}
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
            onClick={() => setMode("browse")}
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
                      <Image
                        src="/photo-camera-icon.png"
                        alt=""
                        width={1254}
                        height={1254}
                        className="h-auto w-28 md:w-36"
                        priority
                      />
                      <div>
                        <h1 className="text-[1.65rem] font-black leading-[2.05rem] text-stone-950 md:text-5xl md:leading-[3.65rem]">
                          Check The <span className="text-[#E0B71D]">Right</span> Price
                        </h1>
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
                  <p className="mt-2 max-w-md px-1 text-[11px] leading-4 text-stone-400">Use a clear product photo under 500 KB for the best match.</p>
                </div>

                {(photoStatus || photoListings.length > 0) && (
                  <section className="mt-6 space-y-3">
                    <h2 className="text-lg font-black">Photo matches</h2>
                    {photoStatus && <p className="rounded-[8px] bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{photoStatus}</p>}
                    <div className="divide-y divide-stone-200 rounded-[8px] bg-white px-4 ring-1 ring-stone-200 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:px-0">
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
                    <h2 className="text-[2rem] font-black leading-[2.45rem] md:text-5xl md:leading-[3.65rem]">
                      Search <span className="text-[#E0B71D]">beautiful</span> finds across stores
                    </h2>
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

                <section className="columns-2 gap-4 pb-8 pt-6">
                  {productGroups.map((group) => (
                    <ListingCard key={group.id} group={group} onSelect={openProductSheet} />
                  ))}
                </section>
              </>
            )}
          </div>
        </div>
      </section>

      {selectedGroup && (
        <ProductDetailSheet
          group={selectedGroup}
          isClosing={isSheetClosing}
          onClose={closeProductSheet}
          onClosed={() => {
            setSelectedGroup(null);
            setIsSheetClosing(false);
          }}
        />
      )}
    </main>
  );
}

function ProductDetailSheet({
  group,
  isClosing,
  onClose,
  onClosed,
}: {
  group: ProductGroup;
  isClosing: boolean;
  onClose: () => void;
  onClosed: () => void;
}) {
  const listings = sortListings(group.listings);
  const cheapest = listings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-none">
      <button
        type="button"
        aria-label="Close item details"
        onClick={onClose}
        className={`absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] ${
          isClosing ? "animate-[backdrop-out_220ms_ease-out_forwards]" : "animate-[backdrop-in_180ms_ease-out]"
        }`}
      />
      <section
        onAnimationEnd={() => {
          if (isClosing) {
            onClosed();
          }
        }}
        className={`scrollbar-hidden relative z-10 max-h-[88dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-stone-50 px-4 pb-6 pt-3 md:rounded-t-[32px] md:px-6 md:pb-8 ${
          isClosing ? "animate-[sheet-down_220ms_ease-out_forwards]" : "animate-[sheet-up_220ms_ease-out]"
        }`}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 touch-none rounded-full bg-stone-300" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black leading-8 text-stone-950 md:text-3xl md:leading-10">{group.title}</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
          <div className="overflow-hidden rounded-[8px] bg-stone-100">
            {group.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={group.image} alt="" className="block h-auto w-full" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-stone-400">
                <Camera aria-hidden="true" size={36} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[8px] bg-white p-4 ring-1 ring-stone-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Cheapest found</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="flex items-center text-3xl font-black text-stone-950">
                      {cheapest?.price && <IndianRupee aria-hidden="true" size={24} />}
                      {cheapest?.price?.replace("₹", "") ?? "Check price"}
                    </p>
                  <p className="mt-1 text-sm font-semibold text-stone-600">{cheapest?.store ?? "Open listing"}</p>
                </div>
                {cheapest && (
                  <a
                    href={cheapest.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center gap-2 rounded-full bg-stone-950 px-4 text-sm font-bold text-white"
                  >
                    Open
                    <ExternalLink aria-hidden="true" size={16} />
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[8px] bg-white ring-1 ring-stone-200">
              {listings.map((listing) => (
                <a
                  key={listing.id}
                  href={listing.link}
                  target="_blank"
                  rel="noreferrer"
                  className="grid grid-cols-[1fr_auto] gap-3 border-b border-stone-100 p-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-black text-stone-950">{listing.store}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{listing.availability ?? listing.domain}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-stone-950">{listing.price ?? "Open"}</p>
                    <p className="text-xs text-stone-400">View deal</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
