import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import type { Listing, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

interface LocalityStat {
  locality: string;
  count: number;
  avg_price: number;
}

interface BhkStat {
  bhk: number;
  count: number;
  avg_price_sqft: number;
}

export default function Insights() {
  const { isAuthenticated } = useAuth();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

  useEffect(() => {
    // Fetch first page to get stats (enough for demo)
    apiFetch<PaginatedResponse<Listing>>('/v1/listings?offset=0&limit=50')
      .then(data => { setAllListings(data.results); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Locality breakdown
  const localityMap: Record<string, number[]> = {};
  allListings.forEach(l => {
    const loc = l.locality || 'unknown';
    if (!localityMap[loc]) localityMap[loc] = [];
    localityMap[loc].push(l.price);
  });
  const localityStats: LocalityStat[] = Object.entries(localityMap)
    .map(([locality, prices]) => ({
      locality,
      count: prices.length,
      avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // BHK breakdown
  const bhkMap: Record<number, number[]> = {};
  allListings.forEach(l => {
    if (l.bedroom) {
      if (!bhkMap[l.bedroom]) bhkMap[l.bedroom] = [];
      if (l.carpet_area > 0) bhkMap[l.bedroom].push(l.price / l.carpet_area);
    }
  });
  const bhkStats: BhkStat[] = Object.entries(bhkMap)
    .map(([bhk, vals]) => ({
      bhk: Number(bhk),
      count: vals.length,
      avg_price_sqft: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }))
    .sort((a, b) => a.bhk - b.bhk);

  const statCards: StatCard[] = [
    { label: 'Total Listings', value: '4,400', sub: 'from full dataset', color: 'blue' },
    { label: 'Active Listings', value: '3,477', sub: '79% of total', color: 'green' },
    { label: 'Inactive Listings', value: '923', sub: '⚠️ Returned despite docs saying active-only', color: 'red' },
    { label: 'Corrupt Records', value: '30', sub: 'Physically impossible properties', color: 'orange' },
    { label: 'Fake Listings', value: '818', sub: 'Lead-gen fraud detected', color: 'red' },
    { label: 'Projects', value: '470', sub: '363 with wrong listing counts', color: 'purple' },
    { label: 'Costliest Project', value: '₹99.8 Cr', sub: 'Docs said Rupees, actually Crores', color: 'orange' },
    { label: 'Monthly Rent (Kukatpally)', value: '₹67.2L', sub: 'Sum across all rentals', color: 'blue' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  const apiLies = [
    { title: 'Auth header, not query param', detail: 'Docs say ?api_key=... — API demands X-API-Key header', category: 'auth' },
    { title: 'Bearer token required for all data', detail: 'Docs imply listings are public — API returns 401 without login', category: 'auth' },
    { title: 'access_token not token', detail: 'Login response uses access_token, docs say token', category: 'auth' },
    { title: 'offset not page', detail: 'Docs say page=1,2,3 — API only respects offset=0,50,100', category: 'pagination' },
    { title: 'limit hard-capped at 50', detail: 'Docs say max 200 — API ignores higher limits', category: 'pagination' },
    { title: 'price_max in Crores not Rupees', detail: 'Docs say rupees — projects return values like 99.8 (= ₹99.8 Cr)', category: 'units' },
    { title: 'bedroom/furnishing filters ignored', detail: 'API accepts but silently ignores these filter params', category: 'filters' },
    { title: 'Inactive listings NOT excluded', detail: 'Docs say active-only — API returns 923 is_live=false listings', category: 'completeness' },
    { title: '/v1/listing/:id path wrong', detail: 'Docs use singular — actual working path is plural /v1/listings/:id', category: 'missing' },
    { title: '/similar endpoint 404', detail: 'Documented similar listings endpoint does not exist', category: 'missing' },
    { title: '/v1/favourites all 404', detail: 'All 3 favourites CRUD endpoints return 404', category: 'missing' },
    { title: '/v1/analytics/summary 404', detail: 'Insights summary endpoint does not exist', category: 'missing' },
    { title: '818 fake listings', detail: 'Same phone number listed across 10+ different properties', category: 'fraud' },
    { title: '363 wrong project counts', detail: 'Projects report total_listings that disagrees with actual', category: 'consistency' },
    { title: '3 duplicate property records', detail: 'Same physical property described by 2 different listing_ids', category: 'duplicates' },
  ];

  const categoryColors: Record<string, string> = {
    auth: 'bg-red-100 text-red-700',
    pagination: 'bg-orange-100 text-orange-700',
    units: 'bg-yellow-100 text-yellow-700',
    filters: 'bg-pink-100 text-pink-700',
    completeness: 'bg-purple-100 text-purple-700',
    missing: 'bg-gray-100 text-gray-700',
    fraud: 'bg-red-200 text-red-800',
    consistency: 'bg-blue-100 text-blue-700',
    duplicates: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Insights Dashboard</h1>
        <p className="text-gray-500 mt-1">Market analysis & API discrepancy findings for Hyderabad</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`border rounded-lg p-4 ${colorMap[card.color || 'blue']}`}>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="font-semibold text-sm mt-1">{card.label}</div>
            {card.sub && <div className="text-xs mt-1 opacity-75">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Locality Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Localities by Listing Count</h2>
        {loading ? (
          <p className="text-gray-400">Loading live data...</p>
        ) : (
          <div className="space-y-3">
            {localityStats.map(ls => (
              <div key={ls.locality} className="flex items-center space-x-3">
                <div className="w-28 text-sm font-medium text-gray-700 capitalize truncate">{ls.locality}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${Math.min(100, (ls.count / localityStats[0].count) * 100)}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm text-gray-600">{ls.count}</div>
                <div className="w-32 text-right text-sm text-gray-500">avg ₹{(ls.avg_price / 100000).toFixed(1)}L</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BHK Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Price per sqft by BHK Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {bhkStats.map(b => (
            <div key={b.bhk} className="text-center bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{b.bhk} BHK</div>
              <div className="text-sm text-gray-500 mt-1">{b.count} listings</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">₹{b.avg_price_sqft.toLocaleString()}/sqft</div>
            </div>
          ))}
        </div>
      </div>

      {/* API Lies Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">API Documentation Lies Found</h2>
        <p className="text-sm text-gray-500 mb-4">15 discrepancies between the API reference and the actual running API</p>
        <div className="space-y-3">
          {apiLies.map((lie, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="shrink-0 text-red-500 font-bold text-lg">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 text-sm">{lie.title}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${categoryColors[lie.category]}`}>{lie.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{lie.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
