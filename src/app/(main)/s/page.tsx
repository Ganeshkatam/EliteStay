import { SearchFacade } from '@/features/search/services/SearchFacade';
import { parseSearchParams, normalizeFilters } from '@/features/search/lib/search-params';
import { SearchWorkspace } from '@/features/search/components/SearchWorkspace';
import type { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const rawParams = await searchParams;
  const filters = normalizeFilters(parseSearchParams(rawParams));
  const pageData = await SearchFacade.getPageData(filters);

  return {
    title: pageData.metadata.title,
    description: pageData.metadata.description,
    alternates: {
      canonical: pageData.metadata.canonical,
    },
  };
}

export default async function DiscoverPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const filters = normalizeFilters(parseSearchParams(rawParams));

  const pageData = await SearchFacade.getPageData(filters);

  return <SearchWorkspace viewModel={pageData.workspace} />;
}
