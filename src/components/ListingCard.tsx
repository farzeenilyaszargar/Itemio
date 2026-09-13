"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Store } from "lucide-react";
import type { ProductGroup, ProductListing } from "@/lib/search";

type ListingCardProps = {
  group: ProductGroup;
  onSelect?: (group: ProductGroup) => void;
};

const productCanvases = [
  "bg-[#F6E9B9]",
  "bg-[#DDE7D3]",
  "bg-[#E9D8CE]",
  "bg-[#D9E5ED]",
  "bg-[#EEE7DA]",
  "bg-[#E5DEEE]",
  "bg-[#DDE6DF]",
  "bg-[#F0D6C8]",
];

function getCanvasClass(id: string) {
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % productCanvases.length;
  return productCanvases[index];
}

function shouldFallbackBlend(title: string) {
  return !/\b(kurta|dress|shirt|t-shirt|tee|jeans|trouser|jacket|saree|model|runner)\b/i.test(title);
}

function ProductCardImage({ image, title }: { image: string; title: string }) {
  const [shouldBlend, setShouldBlend] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;

    async function analyzeBackground() {
      try {
        const response = await fetch(`/api/image/background?url=${encodeURIComponent(image)}`);
        const data = (await response.json()) as { analyzed?: boolean; shouldBlend?: boolean };

        if (isActive) {
          setShouldBlend(data.analyzed ? Boolean(data.shouldBlend) : shouldFallbackBlend(title));
        }
      } catch {
        if (isActive) {
          setShouldBlend(shouldFallbackBlend(title));
        }
      }
    }

    void analyzeBackground();

    return () => {
      isActive = false;
    };
  }, [image, title]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      onError={() => setShouldBlend(false)}
      className={`relative block max-h-60 w-full object-contain transition duration-300 group-active:scale-[0.98] ${
        shouldBlend ?? shouldFallbackBlend(title) ? "mix-blend-multiply" : ""
      }`}
    />
  );
}

export function ListingCard({ group, onSelect }: ListingCardProps) {
  const cheapest = group.listings[0];
  const storeCount = new Set(group.listings.map((listing) => listing.store)).size;
  const canvasClass = getCanvasClass(group.id);

  return (
    <article className="mb-5 inline-block w-full break-inside-avoid">
      <button type="button" onClick={() => onSelect?.(group)} className="group block w-full text-left">
        <div className={`relative flex min-h-40 items-center justify-center overflow-hidden rounded-[22px] ${canvasClass} p-3`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.55),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
          <div className="absolute right-3 top-3 z-10 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black text-stone-700 backdrop-blur">
            {storeCount} {storeCount === 1 ? "store" : "stores"}
          </div>
          {group.image ? (
            <ProductCardImage image={group.image} title={group.title} />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-stone-500">
              <Store aria-hidden="true" size={36} />
            </div>
          )}
        </div>
        <div className="px-1 pt-2.5">
          <h3 className="line-clamp-2 text-[13px] font-black leading-[17px] text-stone-950">{group.title}</h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="text-[13px] font-black leading-5 text-[#E0B71D]">{cheapest?.price ?? "Check price"}</p>
            <p className="truncate text-[11px] font-semibold leading-4 text-stone-400">{cheapest?.store}</p>
          </div>
        </div>
      </button>
    </article>
  );
}

export function CompactListing({ listing }: { listing: ProductListing }) {
  return (
    <a
      href={listing.link}
      target="_blank"
      rel="noreferrer"
      className="grid grid-cols-[64px_1fr_auto] gap-3 bg-white py-3 lg:px-4"
    >
      <div className="h-16 w-16 overflow-hidden rounded-[8px] bg-stone-100">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <Store aria-hidden="true" size={22} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-teal-700">{listing.store}</p>
        <p className="line-clamp-2 text-sm font-medium leading-5 text-stone-950">{listing.title}</p>
        <p className="mt-1 text-xs text-stone-500">{listing.availability ?? listing.domain}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <ExternalLink aria-hidden="true" size={16} className="text-stone-400" />
        <span className="whitespace-nowrap text-sm font-bold text-[#E0B71D]">{listing.price ?? "Open"}</span>
      </div>
    </a>
  );
}
