import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import type { Listing, PaginatedResponse } from '../types';
import { useFavourites } from '../hooks/useFavourites';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';

// All localities from the dataset
const LOCALITIES = [
  '', 'ameerpet', 'banjara hills', 'begumpet', 'chandanagar', 'gachibowli',
  'hitech city', 'jubilee hills', 'kompally', 'kukatpally', 'lb nagar',
  'madhapur', 'manikonda', 'miyapur', 'nallagandla', 'nanakramguda',
  'nizampet', 'pragathi nagar', 'puppalaguda', 'raidurgam', 'serilingampally',
  'uppal', 'yapral'
];

const FURNISHING_OPTIONS = ['', 'furnished', 'semi-furnished', 'unfurnished'];

export default function Listings() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  // Defensive Client-Side Filters
  const [filterBhk, setFilterBhk] = useState<number | ''>('');
  const [filterLocality, setFilterLocality] = useState('');
  const [filterFurnishing, setFilterFurnishing] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-6">You must be logged in to view property details.</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

  const fetchListings = useCallback(async (currentOffset: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError('');

      // NOTE: We know the API silently ignores filter params (our Finding #6),
      // so we fetch without filters and apply them client-side.
      const data = await apiFetch<PaginatedResponse<Listing>>(`/v1/listings?offset=${currentOffset}&limit=50`);

      // DEFENSIVE: Filter out physically impossible records
      const sanitizedResults = data.results.filter(item => {
        if (item.price <= 0) return false;
        if (item.floor && item.total_floors && item.floor > item.total_floors) return false;
        if (item.carpet_area && item.super_built_up_area && item.carpet_area > item.super_built_up_area) return false;
        return true;
      });

      setListings(prev => append ? [...prev, ...sanitizedResults] : sanitizedResults);
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(0, false);
  }, [fetchListings]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextOffset = offset + 50;
      setOffset(nextOffset);
      fetchListings(nextOffset, true);
    }
  };

  // CLIENT-SIDE FILTERING: The API ignores all filter params, so we do it ourselves
  const displayedListings = listings.filter(item => {
    if (filterBhk !== '' && item.bedroom !== filterBhk) return false;
    if (filterLocality && item.locality?.toLowerCase() !== filterLocality.toLowerCase()) return false;
    if (filterFurnishing && item.furnishing?.toLowerCase() !== filterFurnishing.toLowerCase()) return false;
    if (filterMinPrice && item.price < Number(filterMinPrice) * 100000) return false;
    if (filterMaxPrice && item.price > Number(filterMaxPrice) * 100000) return false;
    return true;
  });

  const resetFilters = () => {
    setFilterBhk('');
    setFilterLocality('');
    setFilterFurnishing('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
        <span className="text-sm text-gray-500">{displayedListings.length} of {listings.length} loaded</span>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            className="rounded border-gray-300 shadow-sm text-sm focus:border-blue-500"
            value={filterBhk}
            onChange={(e) => setFilterBhk(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
            <option value="5">5 BHK</option>
          </select>

          <select
            className="rounded border-gray-300 shadow-sm text-sm focus:border-blue-500"
            value={filterLocality}
            onChange={(e) => setFilterLocality(e.target.value)}
          >
            <option value="">Any Locality</option>
            {LOCALITIES.filter(l => l).map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>

          <select
            className="rounded border-gray-300 shadow-sm text-sm focus:border-blue-500"
            value={filterFurnishing}
            onChange={(e) => setFilterFurnishing(e.target.value)}
          >
            <option value="">Any Furnishing</option>
            {FURNISHING_OPTIONS.filter(f => f).map(f => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price (L)"
            className="rounded border-gray-300 shadow-sm text-sm focus:border-blue-500 px-2"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Price (L)"
            className="rounded border-gray-300 shadow-sm text-sm focus:border-blue-500 px-2"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
          />

          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          * Filters applied client-side (API filter params are silently ignored)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && displayedListings.length === 0 ? (
          // Skeleton loaders
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          displayedListings.map((listing, idx) => {
            const isFav = isFavourite(listing.listing_id);
            return (
              <div key={`${listing.listing_id}-${idx}`} className="bg-white rounded-lg shadow overflow-hidden flex flex-col relative hover:shadow-md transition-shadow">
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 relative flex items-center justify-center border-b border-gray-100">
                  <span className="text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  </span>
                </div>
                
                <button
                  onClick={() => isFav ? removeFavourite(listing.listing_id) : addFavourite(listing)}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-50 z-10 transition-transform active:scale-95"
                title={isFav ? "Remove from Favourites" : "Add to Favourites"}
              >
                {isFav ? '❤️' : '🤍'}
              </button>

              <Link to={`/listings/${listing.listing_id}`} className="p-6 flex-1 pt-12 block">
                <div className="flex justify-between items-start">
                  <div className="pr-8">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {listing.apartment_name || 'Independent Property'}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{listing.locality}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${listing.is_live ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {listing.is_live ? 'Live' : 'Off'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div><span className="font-semibold text-gray-900">{listing.bedroom}</span> BHK</div>
                  <div><span className="font-semibold text-gray-900">{listing.bathroom}</span> Baths</div>
                  <div><span className="font-semibold text-gray-900">{listing.carpet_area}</span> sqft</div>
                  <div className="capitalize">{listing.furnishing?.replace('-', ' ')}</div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{(listing.price / 100000).toFixed(2)}L
                  </span>
                  <span className="text-xs text-blue-500 font-medium">View Details →</span>
                </div>
              </Link>
            </div>
          );
        })
      )}
      </div>

      {displayedListings.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No listings match your filters.</p>
          <button onClick={resetFilters} className="mt-3 text-blue-600 hover:underline text-sm">Clear filters</button>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${listings.length} loaded so far)`}
          </button>
        </div>
      )}
    </div>
  );
}
