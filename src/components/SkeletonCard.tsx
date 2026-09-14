export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* Property Image Placeholder Area */}
      <div className="h-48 bg-gray-200"></div>
      
      {/* Content Area */}
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        
        <div className="h-8 bg-gray-200 rounded w-1/3 mt-6"></div>
      </div>
    </div>
  );
}
