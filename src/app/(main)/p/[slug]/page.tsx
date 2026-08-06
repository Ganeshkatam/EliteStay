import { notFound, redirect } from 'next/navigation';
import { PropertyRepository } from '@/features/property/repositories/property.repository';
import { PropertyComposition } from '@/features/property/components/PropertyComposition';
import { Suspense } from 'react';
import { PropertyStructuredData } from '@/features/property/components/shared/PropertyStructuredData';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;

  // The URL format should be [publicId]-[slug]
  // Note: publicIds in this system seem to be 6-10 character alphanumeric strings.
  // We'll extract everything before the first hyphen as the publicId.
  const hyphenIndex = rawSlug.indexOf('-');
  let publicId = rawSlug;
  let urlSlug = '';

  if (hyphenIndex !== -1) {
    publicId = rawSlug.substring(0, hyphenIndex);
    urlSlug = rawSlug.substring(hyphenIndex + 1);
  }

  // Look up the canonical slug for this publicId
  const canonicalSlug = await PropertyRepository.getCanonicalSlug(publicId);

  // If the property doesn't exist, 404
  if (!canonicalSlug) {
    notFound();
  }

  // Canonical URL check for SEO
  // If the URL is missing the slug, or has the wrong slug, 301 redirect to the correct one
  if (urlSlug !== canonicalSlug) {
    redirect(`/p/${publicId}-${canonicalSlug}`);
  }

  // Render the page composition
  return (
    <>
      <PropertyComposition publicId={publicId} slug={canonicalSlug} />
      <Suspense fallback={null}>
        <PropertyStructuredData publicId={publicId} />
      </Suspense>
    </>
  );
}
