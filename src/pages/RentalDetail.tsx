import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import type { Rental } from '../types';
import { useAuth } from '../context/AuthContext';

export default function RentalDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    apiFetch<Rental>(`/v1/rentals/${id}`)
      .then(data => { setRental(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-500">Loading...</div>;
  if (error || !rental) return (
    <div className="bg-red-50 text-red-700 p-6 rounded-lg mt-6">
      <p>{error || 'Rental not found.'}</p>
      <Link to="/rentals" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Rentals</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/rentals" className="text-blue-600 hover:underline text-sm">← Back to Rentals</Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{rental.apartment_name || 'Rental Property'}</h1>
              <p className="text-gray-500 mt-1 capitalize">{rental.locality}</p>
              <span className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${rental.is_live ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {rental.is_live ? '● Available' : '● Unavailable'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">₹{rental.price.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">per month</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-b py-6">
            <div className="text-center"><div className="text-2xl font-bold text-gray-900">{rental.bedroom}</div><div className="text-sm text-gray-500">Bedrooms</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-gray-900">{rental.bathroom}</div><div className="text-sm text-gray-500">Bathrooms</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-gray-900">{rental.carpet_area}</div><div className="text-sm text-gray-500">sqft</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-gray-900 capitalize">{rental.furnishing?.replace('-', ' ')}</div><div className="text-sm text-gray-500">Furnishing</div></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold text-gray-700">Floor:</span><span className="ml-2">{rental.floor} of {rental.total_floors}</span></div>
            <div><span className="font-semibold text-gray-700">Listing ID:</span><span className="ml-2 font-mono text-xs text-gray-400">{rental.listing_id}</span></div>
            <div><span className="font-semibold text-gray-700">Posted:</span><span className="ml-2">{new Date(rental.posted_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
          </div>

          {rental.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{rental.description}</p>
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{rental.posted_by_name}</p>
                <p className="text-gray-500 text-sm mt-1">{rental.posted_by_contact}</p>
              </div>
              <a href={`tel:${rental.posted_by_contact}`} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Call Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
