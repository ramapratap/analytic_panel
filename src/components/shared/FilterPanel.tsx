import React from 'react';
import { Calendar, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FilterPanelProps {
  filters: {
    dateRange: { start: string; end: string };
    category: string;
    status: string;
  };
  setFilters: (filters: any) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, onReset }) => {
  const { theme } = useTheme();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Date Range
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Calendar size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div className="relative flex-1">
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Category
          </label>
          <input
            type="text"
            placeholder="Filter by category..."
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium opacity-0">Reset</label>
          <button
            onClick={onReset}
            className={`w-full px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <X size={16} className="mr-2" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;