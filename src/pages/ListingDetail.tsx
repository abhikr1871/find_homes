import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import type { Listing, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../hooks/useFavourites';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<Listing>(`/v1/listings/${id}`)
      .then(data => {
        setListing(data);
        setLoading(false);
        // Build similar listings client-side (documented /similar endpoint returns 404)
        apiFetch<PaginatedResponse<Listing>>(`/v1/listings?offset=0&limit=50`)
          .then(res => {
            const sims = res.results.filter(l =>
              l.listing_id !== data.listing_id &&
              l.locality === data.locality &&
              l.bedroom === data.bedroom &&
              l.price >= data.price * 0.85 &&
              l.price <= data.price * 1.15
            ).slice(0, 4);
            setSimilar(sims);
          }).catch(() => {});
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch listing');
        setLoading(false);
      });
  }, [id]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-6">You must be logged in to view listing details.</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500 text-lg">Loading listing details...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg mt-6">
        <p>{error || 'Listing not found.'}</p>
        <Link to="/listings" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Listings</Link>
      </div>
    );
  }

  const isFav = isFavourite(listing.listing_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/listings" className="text-blue-600 hover:underline text-sm">← Back to Listings</Link>
        <button
          onClick={() => isFav ? removeFavourite(listing.listing_id) : addFavourite(listing)}
          className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          <span>{isFav ? '❤️' : '🤍'}</span>
          <span className="text-sm font-medium">{isFav ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {listing.apartment_name || 'Independent Property'}
              </h1>
              <p className="text-gray-500 mt-1">{listing.locality}</p>
              <span className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${listing.is_live ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {listing.is_live ? '● Live' : '● Offline'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                ₹{(listing.price / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-gray-400 mt-1">
                ₹{listing.carpet_area ? Math.round(listing.price / listing.carpet_area).toLocaleString() : 'N/A'}/sqft
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-b py-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{listing.bedroom}</div>
              <div className="text-sm text-gray-500">Bedrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{listing.bathroom}</div>
              <div className="text-sm text-gray-500">Bathrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{listing.balcony}</div>
              <div className="text-sm text-gray-500">Balconies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {listing.floor}/{listing.total_floors}
              </div>
              <div className="text-sm text-gray-500">Floor/Total</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Carpet Area:</span>
              <span className="ml-2 text-gray-900">{listing.carpet_area} sqft</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Super Built-up:</span>
              <span className="ml-2 text-gray-900">{listing.super_built_up_area} sqft</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Furnishing:</span>
              <span className="ml-2 text-gray-900 capitalize">{listing.furnishing}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Listing ID:</span>
              <span className="ml-2 text-gray-400 font-mono text-xs">{listing.listing_id}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Posted:</span>
              <span className="ml-2 text-gray-900">{new Date(listing.posted_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Posted By:</span>
              <span className="ml-2 text-gray-900">{listing.posted_by_name}</span>
            </div>
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Seller</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{listing.posted_by_name}</p>
                <p className="text-gray-500 text-sm mt-1">{listing.posted_by_contact}</p>
              </div>
              <a
                href={`tel:${listing.posted_by_contact}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties — built client-side since /similar endpoint returns 404 */}
      {similar.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Similar Properties</h2>
          <p className="text-xs text-gray-400 mb-4">Same locality · Same BHK · Price ±15% (built client-side — documented /similar endpoint is 404)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map(s => (
              <Link key={s.listing_id} to={`/listings/${s.listing_id}`} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900 truncate text-sm">{s.apartment_name || 'Property'}</div>
                <div className="text-xs text-gray-500 capitalize mt-0.5">{s.locality}</div>
                <div className="text-blue-600 font-bold mt-2">₹{(s.price / 100000).toFixed(1)}L</div>
                <div className="text-xs text-gray-400">{s.carpet_area} sqft · {s.bedroom} BHK</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
