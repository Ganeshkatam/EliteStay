import { MapPin, Building, Home, ArrowRight } from 'lucide-react';

export function AuthInfoPanel() {
  return (
    <div className="flex h-full w-full flex-col justify-center max-w-lg mx-auto gap-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-white mb-4">
          Welcome back.
        </h2>
        <p className="text-xl text-slate-400 font-light">
          Continue where you left off.
        </p>

        <div className="mt-6 h-px w-full max-w-[120px] bg-slate-800" />

        <div className="mt-6">
          <p className="text-sm font-medium tracking-widest text-slate-500 uppercase mb-4">
            Designed for
          </p>
          <ul className="space-y-2 font-light text-slate-300 text-lg">
            <li>• Students</li>
            <li>• Professionals</li>
            <li>• Families</li>
            <li>• Travelers</li>
          </ul>
        </div>
      </div>

      <div className="mt-4">
        {/* Abstract Architectural Illustration */}
        <div className="relative h-24 w-full opacity-20 flex items-end gap-2 mb-6">
          <div className="w-12 h-20 bg-slate-500 rounded-t-sm" />
          <div className="w-16 h-16 bg-slate-500 rounded-t-sm" />
          <div className="w-8 h-32 bg-slate-500 rounded-t-sm" />
          <div className="w-14 h-20 bg-slate-500 rounded-t-sm flex flex-col justify-end p-2 gap-1">
             <div className="w-full h-2 bg-slate-800" />
             <div className="w-full h-2 bg-slate-800" />
          </div>
          <div className="w-10 h-12 bg-slate-500 rounded-t-sm" />
          <div className="w-20 h-28 bg-slate-500 rounded-t-sm" />
          
          <MapPin className="absolute top-2 left-1/2 w-6 h-6 text-slate-300 -translate-x-1/2" />
        </div>

        <div className="h-px w-full max-w-[120px] bg-slate-800 mb-6" />
        <p className="text-xl font-light text-slate-400 flex items-center gap-3">
          Your next stay starts here <ArrowRight className="w-5 h-5 text-slate-500" />
        </p>
      </div>
    </div>
  );
}
