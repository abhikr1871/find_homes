import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import type { Project, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SkeletonCard from '../components/SkeletonCard';
import PropertyCard from '../components/PropertyCard';

export default function Projects() {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-500 mb-6">You must be logged in to view developer projects.</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Go to Login</Link>
      </div>
    );
  }

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
        {loading && projects.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          projects.map((project, idx) => (
            <PropertyCard
              key={`${project.project_id}-${idx}`}
              id={project.project_id}
              type="project"
              title={project.name || 'Project'}
              subtitle={project.builder_name || 'Builder'}
              badgeStr={project.locality}
              priceStr={`₹${(project.price_min).toFixed(1)}L - ₹${(project.price_max * 100).toFixed(1)}L`}
              path={`/projects/${project.project_id}`}
              metrics={[
                { label: 'City', value: project.city || '-' },
                { label: 'Listings', value: project.total_listings || '0' }
              ]}
            />
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
            {loading ? 'Loading...' : 'Load More Projects'}
          </button>
        </div>
      )}
    </div>
  );
}
