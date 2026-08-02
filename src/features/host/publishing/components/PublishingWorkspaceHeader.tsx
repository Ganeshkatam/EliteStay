'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Rocket, Loader2, AlertCircle } from 'lucide-react';
import { AutosaveContext } from './PublishingWorkspaceShell';
import { ListingPublishingViewModel } from '../view-models/listing-publishing.viewmodel';
import { publishListing } from '../actions/publishing-actions';

export function PublishingWorkspaceHeader({
  viewModel,
}: {
  viewModel: ListingPublishingViewModel;
}) {
  const { status, lastSavedAt, lastAttemptAt } =
    React.useContext(AutosaveContext);
  const router = useRouter();
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishError, setPublishError] = React.useState('');

  const renderAutosaveStatus = () => {
    switch (status) {
      case 'dirty':
        return <span className="text-slate-500">Editing...</span>;
      case 'saving':
      case 'retrying':
        return <span className="text-slate-500">Saving...</span>;
      case 'saved':
        return (
          <span className="text-emerald-600">
            Saved{' '}
            {lastSavedAt?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      case 'failed':
        return (
          <span className="text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Save failed at{' '}
            {lastAttemptAt?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      case 'offline':
        return <span className="text-amber-500">Offline</span>;
      default:
        return null;
    }
  };

  const handlePublish = async () => {
    if (!viewModel.publishing.ready) return;
    setIsPublishing(true);
    setPublishError('');
    try {
      await publishListing(viewModel.listingId);
      router.push('/host/listings');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish';
      setPublishError(message);
      setIsPublishing(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <Link
          href="/host/listings"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Exit
        </Link>
        <div className="h-4 w-px bg-slate-300" />
        <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
          {viewModel.title}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 capitalize">
          {viewModel.status}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {publishError && (
          <span className="text-xs text-red-600 font-medium">
            {publishError}
          </span>
        )}
        <div className="flex flex-col items-end text-xs">
          {renderAutosaveStatus()}
          <span className="text-slate-400">
            Health evaluated{' '}
            {new Date(viewModel.health.evaluatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium">{viewModel.health.score}% Ready</span>
          <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${viewModel.health.score}%` }}
            />
          </div>
        </div>

        <div className="relative group">
          <Button
            onClick={handlePublish}
            disabled={!viewModel.publishing.ready || isPublishing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Publish
          </Button>

          {/* Popover for disabled state */}
          {!viewModel.publishing.ready && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="text-sm font-semibold text-slate-900 mb-2">
                Cannot publish yet
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                {viewModel.publishing.required.map((req, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <Link
                      href={`/host/listings/${viewModel.listingId}/build/${req.sectionId}`}
                      className="hover:underline"
                    >
                      {req.message}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
