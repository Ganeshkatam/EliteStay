import React from 'react';
import { Container } from '@/components/layout/Container';

export function PropertyShell({ children }: React.PropsWithChildren) {
  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      {/* 
        For now, we just render the children directly. 
        Later, we can add global mobile headers or other shell-level elements. 
      */}
      {children}
    </div>
  );
}

export function PropertyTwoColumnLayout({
  mainContent,
  sidebarContent,
}: {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}) {
  return (
    <Container className="py-6">
      <div className="flex flex-col lg:flex-row gap-12 relative">
        <div className="flex-1 min-w-0 flex flex-col gap-8">{mainContent}</div>

        <div className="w-full lg:w-[33%] shrink-0">
          <div className="sticky top-28">{sidebarContent}</div>
        </div>
      </div>
    </Container>
  );
}
