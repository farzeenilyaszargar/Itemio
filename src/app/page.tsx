import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-5">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/kitne-rupay-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <div className="text-lg font-black tracking-tight">Kitne Rupay</div>
          </div>
        </nav>

        <div className="flex flex-1 flex-col justify-center gap-8 py-10">
          <div className="flex justify-center">
            <Image
              src="/hero-shopping-bags.png"
              alt="Yellow and black shopping bags with a price tag"
              width={512}
              height={512}
              className="h-auto w-full max-w-[340px] object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div>
            <h1 className="text-5xl font-black leading-[3.35rem]">
              Find out kitne rupay before you buy.
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600">
              Compare Indian marketplace prices in one clean mobile-first flow before you decide where to buy.
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
