import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, BarChart, Table, Calendar } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import DataTable from './shared/DataTable';
import ChartView from './shared/ChartView';
import FilterPanel from './shared/FilterPanel';
import ExportModal from './shared/ExportModal';
import LoadingSkeleton from './shared/LoadingSkeleton';

const ComprehensiveAnalytics: React.FC = () => {
  const { data, loading, error, fetchData } = useApi();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    category: '',
    status: '',
  });

  useEffect(() => {
    if (!data.completeAnalytics) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics', 'completeAnalytics', 'GET');
    }
  }, []);

  // Process data for table display
  const getTableData = () => {
    if (!data.completeAnalytics) return [];
    
    return data.completeAnalytics.map((category: any, index: number) => ({
      id: index + 1,
      category: category.category,
      totalRequests: category.totalRequests,
      successCount: category.successCount,
      errorCount: category.errorCount,
      successRate: ((category.successCount / category.totalRequests) * 100).toFixed(2),
      avgProcessingTime: category.avgProcessingTime?.toFixed(2) || '0',
      uniqueUsers: category.uniqueUserCount || 0,
      lastActivity: new Date().toLocaleDateString(), // Mock data
    }));
  };

  // Filter and sort data
  const getFilteredData = () => {
    let filtered = getTableData();

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item =>
        item.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Apply date range filter (mock implementation since we don't have date fields in the current data)
    if (filters.dateRange.start && filters.dateRange.end) {
      // This would need actual date fields from the API to work properly
      // For now, we'll leave this as a placeholder
    }

    // Apply status filter
    if (filters.status) {
      if (filters.status === 'success') {
        filtered = filtered.filter(item => parseFloat(item.successRate) > 90);
      } else if (filters.status === 'error') {
        filtered = filtered.filter(item => parseFloat(item.successRate) <= 90);
      }
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  // Pagination
  const getPaginatedData = () => {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = getFilteredData();
    // Mock export functionality
    console.log(`Exporting ${dataToExport.length} items as ${format}`);
    setShowExportModal(false);
  };

  if (loading.completeAnalytics) {
    return <LoadingSkeleton type="table" />;
  }

  const { data: paginatedData, totalItems, totalPages } = getPaginatedData();

  const columns = [
    { key: 'category', label: 'Category', sortable: true },
    { key: 'totalRequests', label: 'Total Requests', sortable: true },
    { key: 'successCount', label: 'Success', sortable: true },
    { key: 'errorCount', label: 'Errors', sortable: true },
    { key: 'successRate', label: 'Success Rate (%)', sortable: true },
    { key: 'avgProcessingTime', label: 'Avg Time (s)', sortable: true },
    { key: 'uniqueUsers', label: 'Unique Users', sortable: true },
    { key: 'lastActivity', label: 'Last Activity', sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Comprehensive Analytics
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed analysis of all analytics data with advanced filtering
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {viewMode === 'table' ? <BarChart size={16} /> : <Table size={16} />}
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showFilters
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={() => setFilters({ dateRange: { start: '', end: '' }, category: '', status: '' })}
          />
        )}
      </div>

      {/* Content */}
      <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={paginatedData}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        ) : (
          <ChartView data={getFilteredData()} />
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default ComprehensiveAnalytics;