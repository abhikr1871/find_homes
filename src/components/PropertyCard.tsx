import { Link } from 'react-router-dom';

interface PropertyCardProps {
  id: string;
  type: 'listing' | 'rental' | 'project';
  title: string;
  subtitle: string;
  isLive?: boolean;
  priceStr: string;
  badgeStr?: string;
  isFav?: boolean;
  onToggleFav?: () => void;
  metrics: { label: string; value: string | number }[];
  path: string;
}

// Generate a deterministic gradient based on ID
const getGradient = (id: string) => {
  const num = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-red-500',
    'from-amber-400 to-orange-500',
    'from-fuchsia-500 to-purple-600',
    'from-cyan-400 to-blue-500',
    'from-violet-500 to-fuchsia-500'
  ];
  return gradients[num % gradients.length];
};

export default function PropertyCard({
  id, type, title, subtitle, isLive, priceStr, badgeStr, isFav, onToggleFav, metrics, path
}: PropertyCardProps) {
  const gradient = getGradient(id);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100">
      
      {/* Abstract Image Placeholder Header */}
      <div className={`h-40 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-4 left-4">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm">
            {type}
          </span>
        </div>
        
        {onToggleFav && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleFav(); }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-transform active:scale-95"
            title={isFav ? "Remove from Favourites" : "Add to Favourites"}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        )}

        {/* Brand Icon in center */}
        <div className="text-white/80">
          {type === 'project' ? (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          ) : (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          )}
        </div>
      </div>

      <Link to={path} className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="pr-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="truncate capitalize">{subtitle}</span>
            </div>
          </div>
          {isLive !== undefined && (
            <span className={`shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${isLive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              {isLive ? 'Live' : 'Off'}
            </span>
          )}
          {badgeStr && (
            <span className="shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {badgeStr}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 my-4 py-4 border-y border-gray-100">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{m.label}</span>
              <span className="text-sm font-medium text-gray-900 truncate">{m.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{type === 'rental' ? 'Monthly Rent' : 'Price'}</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">{priceStr}</span>
          </div>
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            View
          </span>
        </div>
      </Link>
    </div>
  );
}
