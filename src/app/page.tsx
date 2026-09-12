import Link from "next/link";
import { Camera, Search, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-5">
        <nav className="flex items-center justify-between">
          <div className="text-lg font-black tracking-tight">Kitne Rupay</div>
          <div className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-teal-700">
            India first
          </div>
        </nav>

        <div className="flex flex-1 flex-col justify-center gap-8 py-10">
          <div className="relative overflow-hidden rounded-[8px] bg-teal-950 p-5 text-white shadow-sm">
            <div className="absolute right-4 top-4 rounded-full bg-amber-300 p-3 text-stone-950">
              <Sparkles aria-hidden="true" size={20} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-12">
              <div className="rounded-[8px] bg-white/10 p-3">
                <Camera aria-hidden="true" size={22} className="text-amber-200" />
                <p className="mt-8 text-xs font-semibold text-teal-50">Upload a photo</p>
              </div>
              <div className="mt-8 rounded-[8px] bg-amber-300 p-3 text-stone-950">
                <Search aria-hidden="true" size={22} />
                <p className="mt-8 text-xs font-black">Compare prices</p>
              </div>
              <div className="col-span-2 rounded-[8px] bg-white p-4 text-stone-950">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Cheapest match</p>
                <p className="mt-2 text-3xl font-black">₹899</p>
                <p className="mt-1 text-sm text-stone-500">Found across Indian marketplaces</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Shop smarter</p>
            <h1 className="mt-3 text-5xl font-black leading-[3.35rem]">
              Find out kitne rupay before you buy.
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600">
              Take or upload a photo of any item, search Indian marketplaces, and compare prices in one clean mobile-first flow.
            </p>
          </div>

          <Link
            href="/discover"
            className="flex h-14 items-center justify-center gap-2 rounded-[8px] bg-stone-950 px-5 text-base font-black text-white shadow-sm"
          >
            Try it out for free
            <Search aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
