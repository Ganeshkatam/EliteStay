'use client';

import React from 'react';
import { MOTION } from '@/config/motion';

interface SearchChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

export function SearchChip({ label, icon, active, onClick }: SearchChipProps) {
  return (
    <button
      onClick={onClick}
      style={{ transitionDuration: `${MOTION.fast}ms` }}
      className={`
        flex items-center px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap
        transition-all ease-in-out
        ${active 
          ? 'border-gray-900 bg-gray-50 text-gray-900' 
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
