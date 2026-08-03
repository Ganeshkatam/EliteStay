import {
  parseSearchParams,
  normalizeFilters,
} from '@/features/search/lib/search-params';
import { GuestSearchWorkspace } from '@/features/guest/discovery/search/components/GuestSearchWorkspace';
import { GuestService } from '@/features/guest/services/guest.service';
import type { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const rawParams = await searchParams;
  const filters = normalizeFilters(parseSearchParams(rawParams));
  const pageData = await GuestService.getSearchData(filters);

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

  const pageData = await GuestService.getSearchData(filters);

  return <GuestSearchWorkspace viewModel={pageData.workspace} />;
}
