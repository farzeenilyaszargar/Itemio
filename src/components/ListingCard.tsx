import { ExternalLink, Store } from "lucide-react";
import type { ProductGroup, ProductListing } from "@/lib/search";

type ListingCardProps = {
  group: ProductGroup;
  index?: number;
  onSelect?: (group: ProductGroup) => void;
};

const imageHeightClasses = ["h-52", "h-64", "h-44", "h-60", "h-72", "h-48"];

export function ListingCard({ group, index = 0, onSelect }: ListingCardProps) {
  const imageHeight = imageHeightClasses[index % imageHeightClasses.length];

  return (
    <article className="mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[8px] bg-white ring-1 ring-stone-200">
      <button type="button" onClick={() => onSelect?.(group)} className="block w-full text-left">
        <div className={`${imageHeight} bg-stone-100`}>
          {group.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400">
              <Store aria-hidden="true" size={36} />
            </div>
          )}
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
        <span className="whitespace-nowrap text-sm font-bold text-emerald-700">{listing.price ?? "Open"}</span>
      </div>
    </a>
  );
}
