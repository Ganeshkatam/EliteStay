'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { ToolbarRenderer } from './ToolbarRenderer';
import { Container } from '@/components/layout/Container';

export function SearchToolbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = document.getElementById('search-header-portal');
  if (!target) return null;

  return createPortal(
    <Container className="h-full flex items-center py-0">
      <div className="w-full overflow-x-auto no-scrollbar">
        <ToolbarRenderer />
      </div>
    </Container>,
    target
  );
}
