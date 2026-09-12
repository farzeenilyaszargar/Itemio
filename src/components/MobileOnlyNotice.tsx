export function MobileOnlyNotice() {
  return (
    <section className="hidden min-h-dvh items-center justify-center px-6 text-center md:flex">
      <p className="max-w-sm text-2xl font-medium leading-8 text-stone-600">
        I Made This App Only For Mobile
        <br />
        <span className="text-lg text-stone-400">Check Out In Mobile View By Resizing</span>
      </p>
    </section>
  );
}
