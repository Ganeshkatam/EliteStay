import React from 'react';
import { PropertyMediaService } from '../../services/media.service';
import { HeroGalleryClient } from './HeroGalleryClient';

interface HeroGalleryProps {
  publicId: string;
}

export async function HeroGallery({ publicId }: HeroGalleryProps) {
  const media = await PropertyMediaService.getMedia(publicId);
  const publicUrlPrefix = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings`
    : '';

  return (
    <div className="mb-8">
      <HeroGalleryClient media={media} publicUrlPrefix={publicUrlPrefix} />
    </div>
  );
}
