import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import type { Rental, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SkeletonCard from '../components/SkeletonCard';

export default function Rentals() {
  const { isAuthenticated } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-6">You must be logged in to view property details.</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

  const fetchRentals = async (currentOffset: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiFetch<PaginatedResponse<Rental>>(`/v1/rentals?offset=${currentOffset}&limit=50`);
      
      setRentals(prev => append ? [...prev, ...data.results] : data.results);
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals(0, false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextOffset = offset + 50;
      setOffset(nextOffset);
      fetchRentals(nextOffset, true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Rental Properties</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && rentals.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          rentals.map((rental, idx) => (
            <Link key={`${rental.listing_id}-${idx}`} to={`/rentals/${rental.listing_id}`} className="bg-white rounded-lg shadow overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-r from-emerald-50 to-teal-50 relative flex items-center justify-center border-b border-gray-100">
                <span className="text-gray-300">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </span>
              </div>
              <div className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {rental.apartment_name || 'Independent Property'}
                  </h3>
                  <p className="text-sm text-gray-500">{rental.locality}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rental.is_live ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {rental.is_live ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">{rental.bedroom}</span> BHK
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{rental.bathroom}</span> Baths
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{rental.carpet_area}</span> sqft
                </div>
                <div className="truncate">
                  <span className="font-semibold text-gray-900">{rental.furnishing}</span>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="text-sm text-gray-500 mb-1">Monthly Rent</div>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{rental.price.toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Rentals'}
          </button>
        </div>
      )}
    </div>
  );
}
