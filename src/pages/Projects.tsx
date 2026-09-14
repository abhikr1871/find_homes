import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import type { Project, PaginatedResponse } from '../types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async (currentOffset: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiFetch<PaginatedResponse<Project>>(`/v1/projects?offset=${currentOffset}&limit=50`);
      
      setProjects(prev => append ? [...prev, ...data.results] : data.results);
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(0, false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextOffset = offset + 50;
      setOffset(nextOffset);
      fetchProjects(nextOffset, true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Developer Projects</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, idx) => (
          <div key={`${project.project_id}-${idx}`} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{project.builder_name}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="col-span-2">
                  <span className="text-gray-500">Location:</span> <span className="font-semibold text-gray-900">{project.locality}, {project.city}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{project.total_listings}</span> Properties
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="text-sm text-gray-500 mb-1">Price Range</div>
                <div className="text-lg font-bold text-blue-600">
                  {/* DEFENSIVE PROGRAMMING: We discovered price_max is in Crores, not Rupees! */}
                  ₹{(project.price_min).toFixed(2)}L - ₹{(project.price_max * 100).toFixed(2)}L
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  *Max price converted from Crores (API Anomaly Fix)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Projects'}
          </button>
        </div>
      )}
    </div>
  );
}
