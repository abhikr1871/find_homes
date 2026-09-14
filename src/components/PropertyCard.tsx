import { Link } from 'react-router-dom';

interface PropertyCardProps {
  id?: string;
  type: 'listing' | 'rental' | 'project';
  title: string;
  subtitle: string;
  isLive?: boolean;
  priceStr: string;
  badgeStr?: string;
  isFav?: boolean;
  onToggleFav?: () => void;
  metrics: { label: string; value: string | number }[];
  footerText?: string;
  path: string;
}

export default function PropertyCard({
  type, title, subtitle, isLive, priceStr, badgeStr, isFav, onToggleFav, metrics, footerText, path
}: PropertyCardProps) {
  const innerContent = (
    <>
      <div className="flex flex-col mb-4 pr-12">
        <div className="flex flex-wrap gap-2 items-center mb-1.5">
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {isLive !== undefined && (
            <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${isLive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              {isLive ? 'Live' : 'Off'}
            </span>
          )}
          {badgeStr && (
            <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-700 border border-blue-200">
              {badgeStr}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span className="truncate capitalize">{subtitle}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-4 py-4 border-y border-gray-100 flex-1 content-start">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{m.label}</span>
            <span className="text-sm font-medium text-gray-900 truncate">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between pt-2">
        <div>
          <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{type === 'rental' ? 'Monthly Rent' : 'Price'}</span>
          <span className="text-2xl font-black text-gray-900 tracking-tight">{priceStr}</span>
          {footerText && <span className="block text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{footerText}</span>}
        </div>
        {path && (
          <span className="text-sm font-semibold text-blue-600 border border-blue-100 bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            View
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col group border border-gray-200 relative h-full">
      {onToggleFav && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
          className="absolute top-4 right-4 bg-white border border-gray-200 p-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors z-10"
          title={isFav ? "Remove from Favourites" : "Add to Favourites"}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      )}

      {path ? (
        <Link to={path} className="p-6 flex-1 flex flex-col h-full">
          {innerContent}
        </Link>
      ) : (
        <div className="p-6 flex-1 flex flex-col h-full">
          {innerContent}
        </div>
      )}
    </div>
  );
}
