'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'contact', label: 'Contact Information' },
  { id: 'about', label: 'About You' },
  { id: 'verification', label: 'Identity & Verification' },
];

export function ProfileNav() {
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-25% 0px -65% 0px' 
      }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="space-y-1 sticky top-32">
      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "block px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 relative",
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-slate-900" />
            )}
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
