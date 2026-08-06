import React from 'react';
import Image from 'next/image';
import { HostService } from '../../services/host.service';

interface HostSectionProps {
  publicId: string;
}

export async function HostSection({ publicId }: HostSectionProps) {
  const host = await HostService.getHost(publicId);

  if (!host) return null;

  const joinedYear = new Date(host.joinedAt).getFullYear();

  const publicUrlPrefix = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars`
    : '';

  return (
    <section className="py-8 border-b">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
          {host.avatarUrl ? (
            <Image
              src={`${publicUrlPrefix}/${host.avatarUrl}`}
              alt={host.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                viewBox="0 0 32 32"
                className="w-8 h-8 fill-current"
                aria-hidden="true"
              >
                <path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path>
              </svg>
            </div>
          )}
          {host.isVerified && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
              <div className="bg-[#E51D53] text-white rounded-full p-0.5">
                <svg
                  viewBox="0 0 32 32"
                  className="w-3 h-3 fill-current"
                  aria-hidden="true"
                >
                  <path d="m15.1 27.8-10.7-10.6 2.3-2.3 8.4 8.4 17.5-17.5 2.3 2.3z"></path>
                </svg>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold">Hosted by {host.name}</h2>
          <div className="text-sm text-gray-500 mt-1">
            Joined in {joinedYear} {host.isVerified && '· Identity verified'}
          </div>
        </div>
      </div>
    </section>
  );
}
