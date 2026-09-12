import { ItemClient } from "@/components/ItemClient";

type ItemPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function ItemPage({ params, searchParams }: ItemPageProps) {
  const [{ slug }, { q }] = await Promise.all([params, searchParams]);

  return <ItemClient slug={slug} query={q ?? ""} />;
}
