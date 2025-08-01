import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface LoadingSkeletonProps {
  type: 'dashboard' | 'table' | 'users' | 'performance';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  const { theme } = useTheme();
  
  const skeletonClass = `animate-pulse ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded`;

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className={`h-8 w-64 ${skeletonClass}`} />
        <div className={`h-4 w-96 ${skeletonClass}`} />
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className={`h-4 w-24 ${skeletonClass}`} />
                <div className={`h-8 w-16 ${skeletonClass}`} />
                <div className={`h-4 w-12 ${skeletonClass}`} />
              </div>
              <div className={`h-12 w-12 rounded-lg ${skeletonClass}`} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-4">
              <div className={`h-6 w-32 ${skeletonClass}`} />
              <div className={`h-64 w-full ${skeletonClass}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className={`h-8 w-64 ${skeletonClass}`} />
        <div className={`h-4 w-96 ${skeletonClass}`} />
      </div>
      
      {/* Search and filters */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`h-10 w-full ${skeletonClass}`} />
      </div>
      
      {/* Table */}
      <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6 space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-12 w-full ${skeletonClass}`} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className={`h-8 w-64 ${skeletonClass}`} />
        <div className={`h-4 w-96 ${skeletonClass}`} />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-4">
              <div className={`h-12 w-12 rounded-lg ${skeletonClass}`} />
              <div className="space-y-2">
                <div className={`h-4 w-24 ${skeletonClass}`} />
                <div className={`h-6 w-16 ${skeletonClass}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-4">
              <div className={`h-6 w-32 ${skeletonClass}`} />
              <div className={`h-64 w-full ${skeletonClass}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerformanceSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className={`h-8 w-64 ${skeletonClass}`} />
        <div className={`h-4 w-96 ${skeletonClass}`} />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-4">
              <div className={`h-12 w-12 rounded-lg ${skeletonClass}`} />
              <div className="space-y-2">
                <div className={`h-4 w-24 ${skeletonClass}`} />
                <div className={`h-6 w-16 ${skeletonClass}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-6">
            <div className={`h-6 w-32 ${skeletonClass}`} />
            {[...Array(2)].map((_, j) => (
              <div key={j} className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="space-y-4">
                  <div className={`h-6 w-32 ${skeletonClass}`} />
                  <div className={`h-64 w-full ${skeletonClass}`} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  switch (type) {
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'users':
      return renderUsersSkeleton();
    case 'performance':
      return renderPerformanceSkeleton();
    default:
      return renderDashboardSkeleton();
  }
};

export default LoadingSkeleton;