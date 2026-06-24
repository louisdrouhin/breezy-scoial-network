import SearchContent from '@/components/SearchContent';

interface SearchPageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const tag = Array.isArray(params.tag) ? params.tag[0] : params.tag;

  return <SearchContent initialTag={tag ?? ''} />;
}
