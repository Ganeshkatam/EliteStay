'use client';

export function OverlayLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-gray-100 text-center pointer-events-auto">
        <h4 className="font-semibold text-gray-900">No listings in this area</h4>
        <p className="text-sm text-gray-500 mt-1">Move the map or expand your search</p>
      </div>
    </div>
  );
}
