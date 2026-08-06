'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PropertySectionErrorBoundary extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // We could log this to our observability platform here
    console.error(
      `Error in Property Section ${this.props.sectionName || ''}:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="w-full p-4 border border-red-100 bg-red-50 rounded-2xl flex flex-col items-center justify-center text-red-800 my-4 h-32">
          <svg
            className="w-6 h-6 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm font-medium">
            Failed to load{' '}
            {this.props.sectionName
              ? `${this.props.sectionName.toLowerCase()} section`
              : 'section'}
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}
