import Link from "next/link";
import { ExternalLink, IndianRupee, ShoppingBag } from "lucide-react";
import { sortListings, type ProductListing } from "@/lib/search";

type ItemPageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function getListings(query: string): Promise<ProductListing[]> {
  if (!query) {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/item?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { listings?: ProductListing[] };
    return sortListings(data.listings ?? []);
  } catch {
    return [];
  }
}

export default async function ItemPage({ searchParams }: ItemPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const listings = await getListings(query);
  const cheapest = listings[0];
  const heroImage = listings.find((listing) => listing.image)?.image;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-5">
        <div className="flex items-center justify-between">
          <Link href="/discover" className="text-sm font-bold text-teal-700">
            Back
          </Link>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            Price compare
          </span>
        </div>

        <section className="overflow-hidden rounded-[8px] border border-stone-200 bg-white shadow-sm">
          <div className="aspect-[4/5] bg-stone-100">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400">
                <ShoppingBag aria-hidden="true" size={48} />
              </div>
            )}
          </div>
          <div className="space-y-4 p-4">
            <div>
              <h1 className="text-2xl font-black leading-8">{query || "Product"}</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Compare live-looking marketplace results before opening the store.
              </p>
            </div>
            <div className="rounded-[8px] bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Cheapest found</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="flex items-center text-3xl font-black text-emerald-800">
                    <IndianRupee aria-hidden="true" size={24} />
                    {cheapest?.price?.replace("₹", "") ?? "Check"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">{cheapest?.store ?? "No listing yet"}</p>
                </div>
                {cheapest && (
                  <a
                    href={cheapest.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center gap-2 rounded-[8px] bg-stone-950 px-4 text-sm font-bold text-white"
                  >
                    Open
                    <ExternalLink aria-hidden="true" size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black">Comparison table</h2>
          {listings.length === 0 ? (
            <p className="rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Add Google CSE keys to load marketplace comparisons for this item.
            </p>
          ) : (
            <div className="overflow-hidden rounded-[8px] border border-stone-200 bg-white shadow-sm">
              {listings.slice(0, 10).map((listing) => (
                <a
                  key={listing.id}
                  href={listing.link}
                  target="_blank"
                  rel="noreferrer"
                  className="grid grid-cols-[1fr_auto] gap-3 border-b border-stone-100 p-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-950">{listing.store}</p>
                    <p className="line-clamp-1 text-xs text-stone-500">{listing.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-700">{listing.price ?? "Open"}</p>
                    <p className="text-xs text-stone-400">View deal</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

