import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import type { Listing, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import submissionData from '../data/submission.json';

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

  const categoryColors: Record<string, string> = {
    auth: 'bg-red-100 text-red-700',
    pagination: 'bg-orange-100 text-orange-700',
    units: 'bg-yellow-100 text-yellow-700',
    filters: 'bg-pink-100 text-pink-700',
    sorting: 'bg-rose-100 text-rose-700',
    timestamps: 'bg-teal-100 text-teal-700',
    completeness: 'bg-purple-100 text-purple-700',
    missing_endpoint: 'bg-gray-100 text-gray-700',
    undocumented_endpoint: 'bg-emerald-100 text-emerald-700',
    fraud: 'bg-red-200 text-red-800',
    data_quality: 'bg-amber-100 text-amber-800',
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
        <p className="text-sm text-gray-500 mb-4">26 discrepancies between the API reference and the actual running API</p>
        <div className="space-y-4">
          {submissionData.findings.map((lie, i) => (
            <div key={i} className="flex flex-col p-5 bg-white border border-gray-200 hover:border-gray-300 transition-colors rounded-xl shadow-sm">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 font-bold text-sm border border-red-100">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                    <code className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{lie.endpoint}</code>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${categoryColors[lie.category] || 'bg-gray-100 text-gray-700'}`}>{lie.category}</span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="font-semibold text-orange-800 text-xs uppercase tracking-wider mb-1">What Documentation Claimed</div>
                      <p className="text-gray-700">{lie.documented}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                      <div className="font-semibold text-emerald-800 text-xs uppercase tracking-wider mb-1">Actual Server Behavior</div>
                      <p className="text-gray-700">{lie.actual}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">How Found: </span>
                    {lie.how_found}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Impact: </span>
                    {lie.impact}
                  </div>
                  
                  {lie.evidence && lie.evidence.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Evidence ({lie.evidence.length})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {lie.evidence.slice(0, 10).map((id, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">{id}</span>
                        ))}
                        {lie.evidence.length > 10 && (
                          <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded text-xs">+{lie.evidence.length - 10} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
