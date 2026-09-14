import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import type { Listing, PaginatedResponse } from '../types';
import { useFavourites } from '../hooks/useFavourites';

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  // Defensive Filters
  const [filterBhk, setFilterBhk] = useState<number | ''>('');

  const fetchListings = async (currentOffset: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      // We know the API lies about the page parameter, so we use offset directly!
      const data = await apiFetch<PaginatedResponse<Listing>>(`/v1/listings?offset=${currentOffset}&limit=50`);
      
      // DEFENSIVE PROGRAMMING: Filter out corrupted records (e.g. price <= 0, floor > total_floors)
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
  };

  useEffect(() => {
    fetchListings(0, false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextOffset = offset + 50;
      setOffset(nextOffset);
      fetchListings(nextOffset, true);
    }
  };

  // DEFENSIVE PROGRAMMING: The API filters might lie, so we filter the displayed array in the browser!
  const displayedListings = listings.filter(item => {
    if (filterBhk !== '' && item.bedroom !== filterBhk) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
        
        {/* Client-Side Filter UI */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter BHK:</label>
          <select 
            className="rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filterBhk}
            onChange={(e) => setFilterBhk(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedListings.map((listing, idx) => {
          const isFav = isFavourite(listing.listing_id);
          return (
            <div key={`${listing.listing_id}-${idx}`} className="bg-white rounded-lg shadow overflow-hidden flex flex-col relative">
              <button 
                onClick={() => isFav ? removeFavourite(listing.listing_id) : addFavourite(listing)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-50 z-10"
                title={isFav ? "Remove from Favourites" : "Add to Favourites"}
              >
                {isFav ? '❤️' : '🤍'}
              </button>
              
              <div className="p-6 flex-1 pt-12">
                <div className="flex justify-between items-start">
                  <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {listing.apartment_name || 'Independent Property'}
                  </h3>
                  <p className="text-sm text-gray-500">{listing.locality}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${listing.is_live ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {listing.is_live ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">{listing.bedroom}</span> BHK
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{listing.bathroom}</span> Baths
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{listing.carpet_area}</span> sqft
                </div>
                <div>
                  Floor <span className="font-semibold text-gray-900">{listing.floor}</span> of {listing.total_floors}
                </div>
              </div>

              <div className="mt-6">
                <span className="text-2xl font-bold text-blue-600">
                  ₹{(listing.price / 100000).toFixed(2)}L
                </span>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Listings'}
          </button>
        </div>
      )}
    </div>
  );
}
