import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-5 md:px-8 lg:px-10">
        <nav className="hidden items-center justify-between md:flex">
          <div className="flex h-11 items-center gap-1.5">
            <Image
              src="/kitne-rupay-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
            <div className="hidden font-krona text-[15px] leading-none tracking-normal md:block">Kitne Rupay</div>
          </div>
          <button
            type="button"
            aria-label="Demo profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
          >
            <User aria-hidden="true" size={18} />
          </button>
        </nav>

        <div className="grid flex-1 items-center gap-5 pb-4 pt-3 text-left md:grid-cols-[1fr_0.85fr] md:gap-14 md:pb-8 md:pt-10 lg:gap-20">
          <div className="flex max-w-xl flex-col items-start gap-5 md:gap-6">
            <h1 className="text-[2.5rem] font-black leading-[2.8rem] md:text-6xl md:leading-[4.35rem]">
              Know the <span className="text-[#E0B71D]">right</span> price before you buy.
            </h1>
            <p className="max-w-lg text-[15px] leading-6 text-stone-600 md:text-lg md:leading-8">
              Compare Indian marketplace prices in one clean mobile-first flow before you decide where to buy.
            </p>

            <Link
              href="/discover"
              className="flex h-13 w-full max-w-[240px] items-center justify-between gap-3 rounded-full bg-stone-950 px-6 text-left text-[15px] font-black text-white shadow-sm md:h-14 md:w-60 md:max-w-[260px] md:text-base"
            >
              Try it out for free
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          <div className="flex w-full justify-center md:justify-end md:pt-0">
            <Image
              src="/hero-shopping-bags.png"
              alt="Yellow and black shopping bags with a price tag"
              width={512}
              height={512}
              className="h-auto w-full max-w-[200px] object-contain drop-shadow-xl md:max-w-[380px] lg:max-w-[440px]"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
