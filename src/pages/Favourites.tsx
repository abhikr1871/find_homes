import { useFavourites } from '../hooks/useFavourites';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Favourites() {
  const { isAuthenticated } = useAuth();
  const { favourites, removeFavourite } = useFavourites();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-6">You must be logged in to view your saved properties.</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Your Saved Properties</h1>
      </div>

      {favourites.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">You haven't saved any properties yet!</p>
          <p className="text-sm text-gray-400 mt-2">Go to the Listings page and click the heart icon to save them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((listing, idx) => (
            <div key={`${listing.listing_id}-${idx}`} className="bg-white rounded-lg shadow overflow-hidden flex flex-col relative border-2 border-red-100">
              <button 
                onClick={() => removeFavourite(listing.listing_id)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-50 text-red-500"
                title="Remove from Favourites"
              >
                ❤️
              </button>
              
              <div className="p-6 flex-1 pt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {listing.apartment_name || 'Independent Property'}
                    </h3>
                    <p className="text-sm text-gray-500">{listing.locality}</p>
                  </div>
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

                <div className="mt-6 border-t pt-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{(listing.price / 100000).toFixed(2)}L
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
