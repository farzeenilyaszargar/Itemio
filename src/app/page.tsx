import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { MobileOnlyNotice } from "@/components/MobileOnlyNotice";

export default function Home() {
  return (
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <MobileOnlyNotice />
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-5 md:hidden">
        <nav className="hidden items-center justify-between md:flex">
          <div className="flex h-11 items-center gap-1.5">
            <Image
              src="/itemio-logo.webp"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
            <div className="hidden font-krona text-[15px] leading-none tracking-normal md:block">Itemio</div>
          </div>
          <button
            type="button"
            aria-label="Demo profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
          >
            <User aria-hidden="true" size={18} />
          </button>
        </nav>

        <div className="grid flex-1 content-center items-center gap-4 py-4 text-left md:grid-cols-[1fr_0.85fr] md:gap-14 md:py-8 lg:gap-20">
          <div className="flex w-full justify-end md:order-2 md:justify-end md:pt-0">
            <Image
              src="/hero-shopping-bags.webp"
              alt="Yellow and black shopping bags with a price tag"
              width={512}
              height={512}
              className="h-auto w-[clamp(8.5rem,42vw,11rem)] object-contain drop-shadow-xl md:max-w-[380px] lg:max-w-[440px]"
              priority
            />
          </div>

          <div className="flex max-w-xl flex-col items-start gap-5 md:gap-6">
            <h1 className="text-[2.5rem] font-black leading-[2.8rem] md:text-6xl md:leading-[4.35rem]">
              Know the <span className="text-[#E0B71D]">right</span> price before you buy.
            </h1>
            <p className="max-w-lg text-[15px] leading-6 text-stone-600 md:text-lg md:leading-8">
              Compare Indian marketplace prices in one clean mobile-first flow before you decide where to buy.
            </p>

            <Link
              href="/discover"
              className="flex h-11 w-[205px] items-center justify-between gap-3 rounded-full bg-stone-950 px-5 text-left text-sm font-black text-white shadow-sm"
            >
              Try it out for free
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
