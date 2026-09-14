export interface Listing {
  listing_id: string;
  project_id?: string;
  apartment_name: string;
  locality: string;
  bedroom: number;
  bathroom: number;
  balcony: number;
  floor: number;
  total_floors: number;
  furnishing: string;
  carpet_area: number;
  super_built_up_area: number;
  price: number;
  is_live: boolean;
  posted_by_name: string;
  posted_by_contact: string;
  posted_at: string;
  description: string;
  latitude: number;
  longitude: number;
  source_url: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  limit: number;
  offset: number;
  count: number;
  total: number;
  has_more: boolean;
}

export interface Rental extends Listing {
  // Rentals share most physical properties with Listings, but price represents monthly rent
}

export interface Project {
  project_id: string;
  project_url: string;
  city_id: number;
  apartment_name: string;
  developer_name: string;
  locality: string;
  project_status: string;
  total_units: number;
  total_towers: number;
  total_floors: number;
  launch_date: string;
  possession_date: string;
  rera_number: string;
  min_area_sqft: number;
  max_area_sqft: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  total_listings: number;
  price_min: number;
  price_max: number;
}
