"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, IndianRupee, ShoppingBag, User } from "lucide-react";
import { MobileOnlyNotice } from "@/components/MobileOnlyNotice";
import { findCachedProductGroup, readBrowseListingsCache } from "@/lib/browse-cache";
import { demoBrowseListings } from "@/lib/demo-listings";
import { sortListings, type ProductGroup } from "@/lib/search";

type ItemClientProps = {
  slug: string;
  query: string;
};

export function ItemClient({ slug, query }: ItemClientProps) {
  const router = useRouter();
  const [productGroup, setProductGroup] = useState<ProductGroup | undefined>(() => {
    return findCachedProductGroup(slug, demoBrowseListings);
  });

  useEffect(() => {
    const cachedGroup = findCachedProductGroup(slug, readBrowseListingsCache());
    const nextGroup = cachedGroup ?? findCachedProductGroup(slug, demoBrowseListings);
    const frame = window.requestAnimationFrame(() => setProductGroup(nextGroup));

    return () => window.cancelAnimationFrame(frame);
  }, [slug]);

  const listings = useMemo(() => sortListings(productGroup?.listings ?? []), [productGroup]);
  const cheapest = listings[0];
  const heroImage = productGroup?.image ?? listings.find((listing) => listing.image)?.image;
  const title = (productGroup?.title ?? query) || "Product";

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    router.push("/discover?mode=browse");
  }

  return (
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <MobileOnlyNotice />
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-5 px-4 py-4 md:hidden">
        <header className="hidden items-center justify-between md:flex">
          <Link href="/" className="flex h-11 items-center gap-1.5">
            <Image
              src="/kitne-rupay-logo.webp"
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

        <div className="flex items-center justify-between">
          <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-950">
            <ArrowLeft aria-hidden="true" size={16} />
            Back
          </button>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200">
            Price compare
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="overflow-hidden rounded-[8px] bg-white ring-1 ring-stone-200">
            <div className="aspect-[4/5] bg-stone-100 lg:aspect-square">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400">
                  <ShoppingBag aria-hidden="true" size={48} />
                </div>
              )}
            </div>
            <div className="space-y-4 p-4 md:p-6">
              <div>
                <h1 className="text-2xl font-black leading-8 md:text-4xl md:leading-[3rem]">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-stone-600 md:text-base md:leading-7">
                  Compare marketplace results before opening the store.
                </p>
              </div>
              <div className="border-t border-stone-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">Cheapest found</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="flex items-center text-3xl font-black text-stone-950">
                      {cheapest?.price && <IndianRupee aria-hidden="true" size={24} />}
                      {cheapest?.price?.replace("₹", "") ?? "Check price"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-700">{cheapest?.store ?? "No listing yet"}</p>
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
            </div>
          </section>

          {listings.length > 0 && (
            <section className="space-y-3">
              <div className="overflow-hidden rounded-[8px] bg-white ring-1 ring-stone-200">
                {listings.slice(0, 10).map((listing) => (
                  <a
                    key={listing.id}
                    href={listing.link}
                    target="_blank"
                    rel="noreferrer"
                    className="grid grid-cols-[1fr_auto] gap-3 border-b border-stone-100 p-3 last:border-b-0 md:p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-950">{listing.store}</p>
                      <p className="line-clamp-1 text-xs text-stone-500">{listing.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-stone-950">{listing.price ?? "Open"}</p>
                      <p className="text-xs text-stone-400">View deal</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
