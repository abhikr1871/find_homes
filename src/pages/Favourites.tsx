import { useFavourites } from '../hooks/useFavourites';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';

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
            <PropertyCard
              key={`${listing.listing_id}-${idx}`}
              id={listing.listing_id}
              type="listing"
              title={listing.apartment_name || 'Independent Property'}
              subtitle={listing.locality}
              isLive={listing.is_live}
              priceStr={`₹${(listing.price / 100000).toFixed(2)}L`}
              isFav={true}
              onToggleFav={() => removeFavourite(listing.listing_id)}
              path={`/listings/${listing.listing_id}`}
              metrics={[
                { label: 'Bedrooms', value: `${listing.bedroom || '-'} BHK` },
                { label: 'Bathrooms', value: `${listing.bathroom || '-'} Baths` },
                { label: 'Area', value: `${listing.carpet_area || '-'} sqft` },
                { label: 'Floor', value: `${listing.floor || '-'} of ${listing.total_floors || '-'}` }
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
