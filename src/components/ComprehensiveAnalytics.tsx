import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Filter, Download, BarChart, Table, Calendar, SortAsc, SortDesc, Eye, EyeOff } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import DataTable from './shared/DataTable';
import ChartView from './shared/ChartView';
import FilterPanel from './shared/FilterPanel';
import AdvancedExportModal from './shared/AdvancedExportModal';
import LoadingSkeleton from './shared/LoadingSkeleton';

interface AnalyticsData {
  id: number;
  category: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: string;
  avgProcessingTime: string;
  uniqueUsers: number;
  lastActivity: string;
}

const ComprehensiveAnalytics: React.FC = () => {
  const { data, loading, error, fetchData } = useApi();
  const { theme } = useTheme();
  
  // View and interaction states
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    category: '',
    status: '',
    minRequests: '',
    maxRequests: '',
    successRateRange: { min: '', max: '' },
  });

  // Advanced search states
  const [advancedFilters, setAdvancedFilters] = useState({
    processingTimeRange: { min: '', max: '' },
    userCountRange: { min: '', max: '' },
    includeZeroErrors: true,
    sortByTrend: false,
  });

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(new Set([
    'category', 'totalRequests', 'successCount', 'errorCount', 
    'successRate', 'avgProcessingTime', 'uniqueUsers', 'lastActivity'
  ]));

  useEffect(() => {
    if (!data.categoriesAnalytics) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics/categories', 'categoriesAnalytics', 'GET');
    }
  }, [data.categoriesAnalytics, fetchData]);

  // Memoized data processing
  const processedData = useMemo((): AnalyticsData[] => {
    if (!data.categoriesAnalytics) return [];
    
    return data.categoriesAnalytics.map((category: any, index: number) => ({
      id: index + 1,
      category: category.category,
      totalRequests: category.totalRequests,
      successCount: category.successCount,
      errorCount: category.errorCount,
      successRate: category.successRate?.toFixed(2) || '0',
      avgProcessingTime: category.avgProcessingTime?.toFixed(2) || '0',
      uniqueUsers: category.uniqueUserCount || 0,
      lastActivity: new Date().toLocaleDateString(),
    }));
  }, [data.categoriesAnalytics]);

  // Advanced filtering logic
  const filteredData = useMemo(() => {
    let filtered = [...processedData];

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.category.toLowerCase().includes(searchLower) ||
        item.id.toString().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item =>
        item.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'success') {
        filtered = filtered.filter(item => parseFloat(item.successRate) > 90);
      } else if (filters.status === 'error') {
        filtered = filtered.filter(item => parseFloat(item.successRate) <= 90);
      }
    }

    // Request count range
    if (filters.minRequests) {
      filtered = filtered.filter(item => item.totalRequests >= parseInt(filters.minRequests));
    }
    if (filters.maxRequests) {
      filtered = filtered.filter(item => item.totalRequests <= parseInt(filters.maxRequests));
    }

    // Success rate range
    if (filters.successRateRange.min) {
      filtered = filtered.filter(item => parseFloat(item.successRate) >= parseFloat(filters.successRateRange.min));
    }
    if (filters.successRateRange.max) {
      filtered = filtered.filter(item => parseFloat(item.successRate) <= parseFloat(filters.successRateRange.max));
    }

    // Advanced filters
    if (advancedFilters.processingTimeRange.min) {
      filtered = filtered.filter(item => parseFloat(item.avgProcessingTime) >= parseFloat(advancedFilters.processingTimeRange.min));
    }
    if (advancedFilters.processingTimeRange.max) {
      filtered = filtered.filter(item => parseFloat(item.avgProcessingTime) <= parseFloat(advancedFilters.processingTimeRange.max));
    }

    if (advancedFilters.userCountRange.min) {
      filtered = filtered.filter(item => item.uniqueUsers >= parseInt(advancedFilters.userCountRange.min));
    }
    if (advancedFilters.userCountRange.max) {
      filtered = filtered.filter(item => item.uniqueUsers <= parseInt(advancedFilters.userCountRange.max));
    }

    if (!advancedFilters.includeZeroErrors) {
      filtered = filtered.filter(item => item.errorCount > 0);
    }

    return filtered;
  }, [processedData, searchTerm, filters, advancedFilters]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof AnalyticsData];
      const bValue = b[sortConfig.key as keyof AnalyticsData];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: sortedData.slice(startIndex, endIndex),
      totalItems: sortedData.length,
      totalPages: Math.ceil(sortedData.length / itemsPerPage),
    };
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleExport = useCallback((config: any) => {
    const exportData = {
      data: config.columns.length ? 
        sortedData.map(item => {
          const filtered: any = {};
          config.columns.forEach((col: string) => {
            if (col in item) filtered[col] = item[col as keyof AnalyticsData];
          });
          return filtered;
        }) : sortedData,
      metadata: {
        totalRecords: sortedData.length,
        exportDate: new Date().toISOString(),
        filters: { ...filters, ...advancedFilters },
        format: config.format,
      }
    };

    // Create download
    const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.${config.format}`;
    
    if (config.format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (config.format === 'csv') {
      const headers = Object.keys(exportData.data[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.data.map((row: any) => headers.map(header => row[header]).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    console.log(`Exported ${exportData.data.length} items as ${config.format}`);
    setShowExportModal(false);
  }, [sortedData, filters, advancedFilters]);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: { start: '', end: '' },
      category: '',
      status: '',
      minRequests: '',
      maxRequests: '',
      successRateRange: { min: '', max: '' },
    });
    setAdvancedFilters({
      processingTimeRange: { min: '', max: '' },
      userCountRange: { min: '', max: '' },
      includeZeroErrors: true,
      sortByTrend: false,
    });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  }, []);

  if (loading.categoriesAnalytics) {
    return <LoadingSkeleton type="table" />;
  }

  if (error.categoriesAnalytics) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Failed to load analytics data: {error.categoriesAnalytics}
        </div>
        <button
          onClick={() => fetchData('https://mnowapi.web-dimension.com/api/v1/analytics/categories', 'categoriesAnalytics', 'GET')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const allColumns = [
    { key: 'category', label: 'Category', sortable: true },
    { key: 'totalRequests', label: 'Total Requests', sortable: true },
    { key: 'successCount', label: 'Success Count', sortable: true },
    { key: 'errorCount', label: 'Error Count', sortable: true },
    { key: 'successRate', label: 'Success Rate (%)', sortable: true },
    { key: 'avgProcessingTime', label: 'Avg Time (ms)', sortable: true },
    { key: 'uniqueUsers', label: 'Unique Users', sortable: true },
    { key: 'lastActivity', label: 'Last Activity', sortable: true },
  ];

  const visibleColumnsArray = allColumns.filter(col => visibleColumns.has(col.key));

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Comprehensive Analytics
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Advanced analysis with filtering • {paginatedData.totalItems.toLocaleString()} records
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {viewMode === 'table' ? (
              <>
                <BarChart className="h-4 w-4 mr-2" />
                Chart View
              </>
            ) : (
              <>
                <Table className="h-4 w-4 mr-2" />
                Table View
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search categories or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          
          <div className="flex items-center gap-2">
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
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                showAdvancedSearch
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showAdvancedSearch ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Advanced
            </button>
          </div>
        </div>

        {/* Basic Filters */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        )}

        {/* Advanced Search */}
        {showAdvancedSearch && (
          <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Advanced Filters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Request Count Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRequests}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRequests: e.target.value }))}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRequests}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxRequests: e.target.value }))}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Success Rate Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min %"
                    min="0"
                    max="100"
                    value={filters.successRateRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      successRateRange: { ...prev.successRateRange, min: e.target.value }
                    }))}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    placeholder="Max %"
                    min="0"
                    max="100"
                    value={filters.successRateRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      successRateRange: { ...prev.successRateRange, max: e.target.value }
                    }))}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Processing Time (ms)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedFilters.processingTimeRange.min}
                    onChange={(e) => setAdvancedFilters(prev => ({ 
                      ...prev, 
                      processingTimeRange: { ...prev.processingTimeRange, min: e.target.value }
                    }))}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedFilters.processingTimeRange.max}
                    onChange={(e) => setAdvancedFilters(prev => ({ 
                      ...prev, 
                      processingTimeRange: { ...prev.processingTimeRange, max: e.target.value }
                    }))}
                    className={`w-full px-2 py-1 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Options
                </label>
                <div className="space-y-1">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={advancedFilters.includeZeroErrors}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, includeZeroErrors: e.target.checked }))}
                      className="mr-2 h-3 w-3"
                    />
                    Include zero errors
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Column Visibility Controls */}
        <div className="mt-4 flex items-center justify-between border-t pt-4 border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Visible Columns:
            </span>
            <div className="flex flex-wrap gap-1">
              {allColumns.map((column) => (
                <button
                  key={column.key}
                  onClick={() => toggleColumnVisibility(column.key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    visibleColumns.has(column.key)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {column.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Rows per page:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 text-xs rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {paginatedData.totalItems.toLocaleString()}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Records</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {sortedData.reduce((sum, item) => sum + item.totalRequests, 0).toLocaleString()}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              {sortedData.reduce((sum, item) => sum + item.successCount, 0).toLocaleString()}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Successful</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {sortedData.reduce((sum, item) => sum + item.errorCount, 0).toLocaleString()}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Errors</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {viewMode === 'table' ? (
          <DataTable
            columns={visibleColumnsArray}
            data={paginatedData.data}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={paginatedData.totalPages}
            totalItems={paginatedData.totalItems}
            onPageChange={setCurrentPage}
          />
        ) : (
          <ChartView data={sortedData} />
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <AdvancedExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          totalItems={paginatedData.totalItems}
          data={sortedData}
        />
      )}
    </div>
  );
};

export default ComprehensiveAnalytics;