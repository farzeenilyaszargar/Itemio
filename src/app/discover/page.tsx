import { DiscoverClient } from "@/components/DiscoverClient";

type DiscoverPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const initialMode = params.mode === "browse" ? "browse" : "photo";

  return <DiscoverClient initialMode={initialMode} />;
}
