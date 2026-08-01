import Link from 'next/link';
import { Map } from 'lucide-react';

export function MapPreview() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
      <Link href="/s" className="block relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden group bg-slate-100">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-slate-900/40 transition-colors group-hover:bg-slate-900/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Map className="h-10 w-10 mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Explore on Map</h2>
          <span className="font-semibold px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm group-hover:bg-white/30 transition-colors">
            View full map &rarr;
          </span>
        </div>
      </Link>
    </section>
  );
}
