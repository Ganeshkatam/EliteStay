'use client';

import React, { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';

export const ProfileFieldContext = createContext<{ close: () => void } | null>(
  null
);

export function useProfileField() {
  return useContext(ProfileFieldContext);
}

interface ProfileFieldProps {
  label: string;
  value: React.ReactNode;
  isEditable?: boolean;
  children: React.ReactElement;
}

export function ProfileField({
  label,
  value,
  isEditable = true,
  children,
}: ProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      {!isEditing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-slate-900 font-medium mb-1">{label}</h4>
            <div className="text-slate-600 text-sm">
              {value || 'Not provided'}
            </div>
          </div>
          {isEditable && (
            <Button
              variant="link"
              onClick={() => setIsEditing(true)}
              className="text-slate-900 font-semibold p-0 h-auto underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
            >
              Edit
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-slate-900 font-medium">Edit {label}</h4>
          </div>
          <ProfileFieldContext.Provider
            value={{ close: () => setIsEditing(false) }}
          >
            {children}
          </ProfileFieldContext.Provider>
        </div>
      )}
    </div>
  );
}
