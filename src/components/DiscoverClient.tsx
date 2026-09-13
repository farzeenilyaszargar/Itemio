"use client";

import { FormEvent, PointerEvent, TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ExternalLink, IndianRupee, Loader2, Search, Upload, User, X } from "lucide-react";
import { CompactListing, getProductCanvasClass, ListingCard } from "@/components/ListingCard";
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

const apiErrorMessage = "API Rate Limited RN Plz Try Later";

type UploadedPhoto = {
  url: string;
  name: string;
  size: number;
  type: string;
};

function shuffleListings(listings: ProductListing[]) {
  return [...listings]
    .map((listing) => ({ listing, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ listing }) => listing);
}

export function DiscoverClient({ initialMode = "photo" }: DiscoverClientProps) {
  const [activeMode, setActiveMode] = useState<DiscoverMode>(initialMode);
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedPhoto | null>(null);
  const [photoListings, setPhotoListings] = useState<ProductListing[]>([]);
  const [textListings, setTextListings] = useState<ProductListing[]>(() => readBrowseListingsCache());
  const [query, setQuery] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");
  const [textStatus, setTextStatus] = useState("");
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [isSheetClosing, setIsSheetClosing] = useState(false);
  const [isPhotoMatchesOpen, setIsPhotoMatchesOpen] = useState(false);
  const [isPhotoMatchesClosing, setIsPhotoMatchesClosing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const shuffledDemoListings = useMemo(() => shuffleListings(demoBrowseListings), []);
  const productGroups = useMemo(() => groupListings(textListings.length ? textListings : shuffledDemoListings), [shuffledDemoListings, textListings]);
  const hasUploadedPhoto = Boolean(uploadedPhoto);
  const sortedPhotoListings = useMemo(() => sortListings(photoListings), [photoListings]);
  const hasOverflowContent = activeMode === "browse" || Boolean(photoStatus || photoListings.length > 0) || hasUploadedPhoto;

  useEffect(() => {
    if (!selectedGroup && !isPhotoMatchesOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedGroup, isPhotoMatchesOpen]);

  useEffect(() => {
    return () => {
      if (uploadedPhoto) {
        URL.revokeObjectURL(uploadedPhoto.url);
      }
    };
  }, [uploadedPhoto]);

  function setMode(mode: DiscoverMode) {
    if (mode !== activeMode) {
      setSlideDirection(mode === "browse" ? "left" : "right");
    }

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

  function closePhotoMatchesSheet() {
    setIsPhotoMatchesClosing(true);
  }

  function shouldIgnoreSwipe(target: EventTarget) {
    return target instanceof HTMLElement && Boolean(target.closest("button, a, input, label, textarea, select"));
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (shouldIgnoreSwipe(event.target)) {
      swipeStart.current = null;
      return;
    }

    const touch = event.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (!swipeStart.current || selectedGroup) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.current.x;
    const deltaY = touch.clientY - swipeStart.current.y;
    swipeStart.current = null;

    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    if (deltaX < 0 && activeMode === "photo") {
      setMode("browse");
    }

    if (deltaX > 0 && activeMode === "browse") {
      setMode("photo");
    }
  }

  async function handlePhotoUpload(file?: File) {
    if (!file) {
      return;
    }

    const nextPhotoUrl = URL.createObjectURL(file);
    setUploadedPhoto({
      url: nextPhotoUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setIsPhotoLoading(true);
    setPhotoStatus("");
    setPhotoListings([]);
    setIsPhotoMatchesOpen(false);
    setIsPhotoMatchesClosing(false);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/search/photo", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as SearchResponse;
      if (!response.ok) {
        setPhotoStatus(apiErrorMessage);
        return;
      }
      setPhotoListings(data.listings ?? []);
      if (data.listings?.length) {
        setPhotoStatus("");
        setIsPhotoMatchesOpen(true);
        return;
      }
      setPhotoStatus(apiErrorMessage);
    } catch {
      setPhotoStatus(apiErrorMessage);
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
        setTextStatus(apiErrorMessage);
        return;
      }
      const nextListings = data.listings ?? [];
      setTextListings(nextListings);
      writeBrowseListingsCache(nextListings);
      setTextStatus(data.hint || !nextListings.length ? apiErrorMessage : "");
    } catch {
      setTextStatus(apiErrorMessage);
    } finally {
      setIsTextLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <MobileOnlyNotice />
      <section
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 md:hidden ${
          hasOverflowContent ? "min-h-dvh" : "h-dvh overflow-hidden"
        }`}
      >
        <header className="hidden items-center justify-between md:flex">
          <Link href="/" className="flex h-11 items-center gap-1.5">
            <Image
              src="/itemio-logo.webp"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="hidden font-krona text-[15px] leading-none tracking-normal md:inline">Itemio</span>
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
            className={`relative z-10 flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-full text-[clamp(0.75rem,3.3vw,0.875rem)] font-black transition-colors duration-300 ${
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
            className={`relative z-10 flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-full text-[clamp(0.75rem,3.3vw,0.875rem)] font-black transition-colors duration-300 ${
              activeMode === "browse" ? "text-white" : "text-stone-600"
            }`}
          >
            <Search aria-hidden="true" size={16} />
            Browse items
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-x-hidden md:gap-6">
          <div
            key={activeMode}
            className={`flex min-h-0 flex-1 flex-col ${
              slideDirection === "left"
                ? "animate-[section-in-left_320ms_cubic-bezier(0.22,1,0.36,1)]"
                : "animate-[section-in-right_320ms_cubic-bezier(0.22,1,0.36,1)]"
            }`}
          >
            {activeMode === "photo" ? (
              <>
                {uploadedPhoto ? (
                  <section className="flex min-h-0 flex-1 flex-col gap-5">
                    <div className="relative overflow-hidden rounded-[22px] bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadedPhoto.url} alt="Uploaded item" className="block max-h-[48dvh] w-full object-contain" />
                      {isPhotoLoading && (
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(224,183,29,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(224,183,29,0.18)_1px,transparent_1px)] bg-[size:28px_28px] animate-[analysis-grid_1.8s_linear_infinite]" />
                          <div className="absolute inset-x-0 top-0 h-20 animate-[analysis-scan_1.6s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#E0B71D]/35 to-transparent" />
                          <div className="absolute inset-0 bg-stone-950/10" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-stone-950 backdrop-blur">
                              <Loader2 aria-hidden="true" size={22} className="animate-spin" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="mx-auto inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-950 px-5 text-sm font-black text-white">
                      <Upload aria-hidden="true" size={17} />
                      Upload another
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
                      />
                    </label>

                    {photoStatus && <ApiErrorBox onClose={() => setPhotoStatus("")} />}
                  </section>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                    <section className="flex w-full flex-col items-center gap-5 px-1 py-1 md:px-0 md:py-8">
                      <div className="flex flex-col items-center gap-3 md:gap-4">
                        <Image
                          src="/itemio-camera-icon.webp"
                          alt=""
                          width={1254}
                          height={1254}
                          className="h-auto w-[clamp(5.5rem,28vw,8rem)] md:w-36"
                          priority
                        />
                        <div>
                          <h1 className="text-[clamp(1.45rem,8vw,1.65rem)] font-black leading-tight text-stone-950 md:text-5xl md:leading-[3.65rem]">
                            Check The <span className="text-[#E0B71D]">Right</span> Price
                          </h1>
                        </div>
                      </div>
                      <label className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-950 px-4 text-sm font-black text-white shadow-sm min-[360px]:w-auto min-[360px]:px-8">
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
                    <p className="mt-2 px-1 text-[11px] leading-4 text-stone-400">Use a clear product photo under 500 KB for the best match.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <section className="relative space-y-5 px-1 py-1 md:px-0 md:py-8">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/browse-cart-icon.webp"
                      alt=""
                      width={1254}
                      height={1254}
                      className="h-auto w-16 shrink-0"
                      priority
                    />
                    <h2 className="text-[1.75rem] font-black leading-[2.1rem] md:text-5xl md:leading-[3.65rem]">
                      Search <span className="text-[#E0B71D]">beautiful</span> finds across stores
                    </h2>
                  </div>
                  <form onSubmit={handleTextSearch} className="md:max-w-2xl">
                    <div className="relative flex-1">
                      <Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search trousers, lipstick, headphones..."
                        className="h-12 w-full rounded-full bg-stone-200 pl-10 pr-3 text-sm outline-none ring-stone-950 transition focus:bg-white focus:ring-2"
                      />
                    </div>
                  </form>
                  {textStatus && <ApiErrorBox onClose={() => setTextStatus("")} />}
                </section>

                <section className="columns-2 gap-4 pb-8 pt-6">
                  {productGroups.map((group) => (
                    <ListingCard key={group.id} group={group} onSelect={openProductSheet} />
                  ))}
                </section>
                {isTextLoading && (
                  <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/45 backdrop-blur-[1px]">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[18px] bg-white ring-1 ring-white/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/loading-cart.gif" alt="" className="h-28 w-28 max-w-none object-cover object-center" />
                    </div>
                  </div>
                )}
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

      {isPhotoMatchesOpen && (
        <PhotoMatchesSheet
          listings={sortedPhotoListings}
          isClosing={isPhotoMatchesClosing}
          onClose={closePhotoMatchesSheet}
          onClosed={() => {
            setIsPhotoMatchesOpen(false);
            setIsPhotoMatchesClosing(false);
          }}
        />
      )}
    </main>
  );
}

function ApiErrorBox({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/45 px-5 backdrop-blur-[1px]">
      <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-[20px] bg-stone-950 px-4 py-4 text-white">
        <p className="text-sm font-black leading-5">{apiErrorMessage}</p>
        <button
          type="button"
          aria-label="Close error"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95"
        >
          <X aria-hidden="true" size={17} />
        </button>
      </div>
    </div>
  );
}

function PhotoMatchesSheet({
  listings,
  isClosing,
  onClose,
  onClosed,
}: {
  listings: ProductListing[];
  isClosing: boolean;
  onClose: () => void;
  onClosed: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-none">
      <button
        type="button"
        aria-label="Close marketplace matches"
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
        className={`scrollbar-hidden relative z-10 max-h-[72dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-stone-50 px-4 pb-6 pt-3 ${
          isClosing ? "animate-[sheet-down_220ms_ease-out_forwards]" : "animate-[sheet-up_220ms_ease-out]"
        }`}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-stone-300" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[clamp(1.05rem,5vw,1.3rem)] font-black leading-tight text-stone-950">
            Marketplace <span className="text-[#E0B71D]">Matches</span> ({listings.length})
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="divide-y divide-stone-200 rounded-[8px] bg-white px-4 ring-1 ring-stone-200">
          {listings.slice(0, 8).map((listing) => (
            <CompactListing key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
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
  const canvasClass = getProductCanvasClass(group.id);
  const [sheetDragY, setSheetDragY] = useState(0);
  const [isSheetDragging, setIsSheetDragging] = useState(false);
  const sheetDragStart = useRef<{ y: number; pointerId: number } | null>(null);

  function startSheetDrag(event: PointerEvent<HTMLButtonElement>) {
    if (isClosing) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    sheetDragStart.current = { y: event.clientY, pointerId: event.pointerId };
    setIsSheetDragging(true);
  }

  function moveSheetDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!sheetDragStart.current || sheetDragStart.current.pointerId !== event.pointerId) {
      return;
    }

    const nextDragY = Math.min(Math.max(event.clientY - sheetDragStart.current.y, 0), 180);
    setSheetDragY(nextDragY);
  }

  function endSheetDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!sheetDragStart.current || sheetDragStart.current.pointerId !== event.pointerId) {
      return;
    }

    const shouldClose = sheetDragY > 72;
    sheetDragStart.current = null;
    setIsSheetDragging(false);

    if (shouldClose) {
      onClose();
      return;
    }

    setSheetDragY(0);
  }

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
        style={isSheetDragging || sheetDragY > 0 ? { transform: `translateY(${sheetDragY}px)` } : undefined}
        className={`scrollbar-hidden relative z-10 max-h-[88dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-stone-50 px-4 pb-6 pt-3 md:rounded-t-[32px] md:px-6 md:pb-8 ${
          isSheetDragging ? "" : "transition-transform duration-200 ease-out"
        } ${
          isClosing ? "animate-[sheet-down_220ms_ease-out_forwards]" : "animate-[sheet-up_220ms_ease-out]"
        }`}
      >
        <button
          type="button"
          aria-label="Drag down to close"
          onPointerDown={startSheetDrag}
          onPointerMove={moveSheetDrag}
          onPointerUp={endSheetDrag}
          onPointerCancel={endSheetDrag}
          className="mx-auto mb-3 flex h-7 w-24 touch-none cursor-grab items-center justify-center active:cursor-grabbing"
        >
          <span className="h-1.5 w-12 rounded-full bg-stone-300" />
        </button>
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
          <div className={`relative flex items-center justify-center overflow-hidden rounded-[22px] ${canvasClass}`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.55),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
            {group.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={group.image} alt="" className="relative block max-h-[58dvh] w-full object-contain mix-blend-multiply" />
            ) : (
              <div className="relative flex aspect-[4/5] items-center justify-center text-stone-500">
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
