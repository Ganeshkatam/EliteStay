import { getListingPageData } from '@/features/guest/discovery/listing-details/services/listing-page-data';
import { ListingDetailsWorkspace } from '@/features/guest/discovery/listing-details/components/ListingDetailsWorkspace';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ListingPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { publicId } = await params;
  const pageData = await getListingPageData(publicId);

  if (!pageData) return { title: 'Not Found' };

  return {
    title: pageData.metadata.title,
    description: pageData.metadata.description,
    openGraph: {
      title: pageData.metadata.title,
      description: pageData.metadata.description,
      images:
        pageData.listing.images.length > 0
          ? [pageData.listing.images[0].url]
          : [],
    },
    alternates: {
      canonical: pageData.metadata.canonical,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { publicId } = await params;
  const pageData = await getListingPageData(publicId);

  if (!pageData) {
    notFound();
  }

  return <ListingDetailsWorkspace viewModel={pageData} />;
}
