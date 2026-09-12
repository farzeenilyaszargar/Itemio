import Link from "next/link";
import { ExternalLink, IndianRupee, Store } from "lucide-react";
import type { ProductGroup, ProductListing } from "@/lib/search";

type ListingCardProps = {
  group: ProductGroup;
};

export function ListingCard({ group }: ListingCardProps) {
  const cheapest = group.listings[0];

  return (
    <article className="overflow-hidden rounded-[8px] border border-stone-200 bg-white shadow-sm">
      <Link href={`/item/${group.id}?q=${encodeURIComponent(group.title)}`} className="block">
        <div className="aspect-[4/5] bg-stone-100">
          {group.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400">
              <Store aria-hidden="true" size={36} />
            </div>
          )}
        </div>
        <div className="space-y-3 p-3">
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-stone-950">{group.title}</h3>
            <p className="mt-1 text-xs text-stone-500">{group.listings.length} marketplace match</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
              <IndianRupee aria-hidden="true" size={14} />
              {cheapest?.price?.replace("₹", "") ?? "Check price"}
            </span>
            <span className="text-xs font-medium text-stone-500">{cheapest?.store}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function CompactListing({ listing }: { listing: ProductListing }) {
  return (
    <a
      href={listing.link}
      target="_blank"
      rel="noreferrer"
      className="grid grid-cols-[64px_1fr_auto] gap-3 rounded-[8px] border border-stone-200 bg-white p-2 shadow-sm"
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

