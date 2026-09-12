import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-5">
        <nav className="flex items-center justify-between">
          <div className="flex h-11 items-center gap-1.5">
            <Image
              src="/kitne-rupay-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
            <div className="font-krona text-[15px] leading-none tracking-normal">Kitne Rupay</div>
          </div>
        </nav>

        <div className="flex flex-1 flex-col items-start justify-center gap-6 pb-14 pt-6 text-left">
          <div className="max-w-sm">
            <h1 className="text-4xl font-black leading-[2.85rem]">
              Know the <span className="text-[#E0B71D]">right</span> price before you buy.
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600">
              Compare Indian marketplace prices in one clean mobile-first flow before you decide where to buy.
            </p>
          </div>

          <Link
            href="/discover"
            className="mt-1 flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-[8px] bg-stone-950 px-5 text-base font-black text-white shadow-sm"
          >
            Try it out for free
            <ArrowRight aria-hidden="true" size={18} />
          </Link>

          <div className="flex w-full justify-center pt-2">
            <Image
              src="/hero-shopping-bags.png"
              alt="Yellow and black shopping bags with a price tag"
              width={512}
              height={512}
              className="h-auto w-full max-w-[230px] object-contain drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
