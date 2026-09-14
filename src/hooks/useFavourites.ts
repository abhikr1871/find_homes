import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Listing } from '../types';

export function useFavourites() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<Listing[]>([]);

  // Key depends on the logged-in user so it persists specifically for them
  const storageKey = user ? `ivy_favs_${user.email}` : null;

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setFavourites(JSON.parse(saved));
      } else {
        setFavourites([]);
      }
    }
  }, [storageKey]);

  const addFavourite = (listing: Listing) => {
    if (!storageKey) return;
    setFavourites(prev => {
      // Prevent duplicates
      if (prev.find(f => f.listing_id === listing.listing_id)) return prev;
      const next = [...prev, listing];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const removeFavourite = (listing_id: string) => {
    if (!storageKey) return;
    setFavourites(prev => {
      const next = prev.filter(f => f.listing_id !== listing_id);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const isFavourite = (listing_id: string) => {
    return favourites.some(f => f.listing_id === listing_id);
  };

  return {
    favourites,
    addFavourite,
    removeFavourite,
    isFavourite
  };
}
