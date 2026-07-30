/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { addListingImage, removeListingImage, completeImagesStep } from '../actions/image-actions';
import { Loader2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImagesFormProps {
  listingId: string;
  initialImages: any[];
}

export function ImagesForm({ listingId, initialImages }: ImagesFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Create an optimistic local state to make the UI feel fast
  const [images, setImages] = useState(initialImages);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      setError('You can only upload up to 5 images.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      // In a real app, you might want to show a preview immediately before upload finishes
      await addListingImage(listingId, formData);
      // Let the server component refetch images on revalidation
      router.refresh(); 
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string, storagePath: string) => {
    setIsDeleting(imageId);
    setError('');
    
    try {
      await removeListingImage(listingId, imageId, storagePath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleNext = async () => {
    if (images.length === 0) {
      setError('Please upload at least 1 image before continuing.');
      return;
    }
    
    try {
      await completeImagesStep(listingId);
      router.push(`/host/listings/${listingId}/build/review`);
    } catch (err: any) {
      setError(err.message || 'Failed to save progress.');
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => {
          const imgUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${img.storage_path}`;
          return (
            <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200 bg-slate-100">
              {/* Using a standard img tag to avoid domain config issues during development */}
              <img 
                src={imgUrl} 
                alt={`Property photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => handleDelete(img.id, img.storage_path)}
                  disabled={isDeleting === img.id}
                >
                  {isDeleting === img.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          );
        })}

        {images.length < 5 && (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50
              flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-600">Upload Photo</span>
                <span className="text-xs text-slate-400 mt-1">({images.length}/5 max)</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-slate-600 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={images.length === 0} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

