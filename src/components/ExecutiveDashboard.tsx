import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, Users, Activity, AlertCircle, RefreshCw, Download, Eye, BarChart3 } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import KPICard from './shared/KPICard';
import ChartCard from './shared/ChartCard';
import ActivityCard from './shared/ActivityCard';
import LoadingSkeleton from './shared/LoadingSkeleton';
import RealTimeRefresh from './shared/RealTimeRefresh';
import PullToRefresh from './shared/PullToRefresh';
import AdvancedExportModal from './shared/AdvancedExportModal';

const ExecutiveDashboard: React.FC = () => {
  const { data, loading, fetchData, refreshAllData } = useApi();
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    // Initial data fetch
    if (!data.summary) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics/summary', 'summary', 'GET');
    }
    if (!data.completeAnalytics) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics', 'completeAnalytics', 'GET');
    }
    if (!data.userAnalytics) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics/user/919015190754', 'userAnalytics', 'GET');
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAutoRefresh = async () => {
    if (autoRefreshEnabled) {
      await handleRefresh();
    }
  };

  const handleExport = (config: any) => {
    console.log('Exporting dashboard data with config:', config);
    // Implement actual export logic here
    const exportData = {
      summary: data.summary,
      analytics: data.completeAnalytics,
      timestamp: new Date().toISOString(),
      ...config
    };
    
    // Mock export functionality
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  // Generate KPI data from API responses with enhanced metrics
  const getKPIData = () => {
    if (!data.summary) return [];
    
    const summary = data.summary;
    const previousValues = {
      totalRequests: summary.totalRequests * 0.9, // Mock previous data
      successRate: summary.successRate - 2.1,
      uniqueUserCount: summary.uniqueUserCount * 0.92,
      errorRate: summary.errorRate + 1.2,
    };

    const calculateTrend = (current: number, previous: number) => {
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    return [
      {
        title: 'Total Requests',
        value: summary.totalRequests?.toLocaleString() || '0',
        trend: calculateTrend(summary.totalRequests, previousValues.totalRequests),
        icon: Activity,
        color: 'blue' as const,
        subtitle: `${summary.avgProcessingTime?.toFixed(2)}ms avg response`,
      },
      {
        title: 'Success Rate',
        value: `${summary.successRate?.toFixed(1) || '0'}%`,
        trend: calculateTrend(summary.successRate, previousValues.successRate),
        icon: TrendingUp,
        color: 'green' as const,
        subtitle: `${summary.successfulRequests} successful requests`,
      },
      {
        title: 'Unique Users',
        value: summary.uniqueUserCount?.toLocaleString() || '0',
        trend: calculateTrend(summary.uniqueUserCount, previousValues.uniqueUserCount),
        icon: Users,
        color: 'purple' as const,
        subtitle: `${summary.uniqueCategoryCount} categories used`,
      },
      {
        title: 'Error Rate',
        value: `${summary.errorRate?.toFixed(2) || '0'}%`,
        trend: calculateTrend(summary.errorRate, previousValues.errorRate),
        icon: AlertCircle,
        color: 'red' as const,
        subtitle: `${summary.systemErrorCount} system errors`,
      },
    ];
  };

  // Enhanced chart data with better formatting
  const getTrendData = () => {
    if (!data.completeAnalytics) return null;
    
    const categories = data.completeAnalytics.slice(0, 8); // Top 8 categories
    return {
      labels: categories.map((cat: any) => {
        const name = cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category;
        return name;
      }),
      datasets: [{
        label: 'Total Requests',
        data: categories.map((cat: any) => cat.totalRequests),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    };
  };

  const getPerformanceData = () => {
    if (!data.completeAnalytics) return null;
    
    const categories = data.completeAnalytics.slice(0, 6);
    return {
      labels: categories.map((cat: any) => cat.category.substring(0, 12) + '...'),
      datasets: [{
        label: 'Success Count',
        data: categories.map((cat: any) => cat.successCount),
        backgroundColor: '#10B981',
        borderRadius: 4,
      }, {
        label: 'Error Count',
        data: categories.map((cat: any) => cat.errorCount),
        backgroundColor: '#EF4444',
        borderRadius: 4,
      }]
    };
  };

  const getDistributionData = () => {
    if (!data.completeAnalytics) return null;
    
    const categories = data.completeAnalytics.slice(0, 5);
    const total = categories.reduce((sum: number, cat: any) => sum + cat.totalRequests, 0);
    
    return {
      labels: categories.map((cat: any) => `${cat.category} (${((cat.totalRequests / total) * 100).toFixed(1)}%)`),
      datasets: [{
        data: categories.map((cat: any) => cat.totalRequests),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 2,
        borderColor: theme === 'dark' ? '#374151' : '#ffffff',
      }]
    };
  };

  const getRecentActivities = () => {
    if (!data.userAnalytics?.userRequests) return [];
    
    return data.userAnalytics.userRequests.slice(0, 10).map((request: any) => ({
      id: request._id,
      action: request.category,
      user: `User ${request.userId.slice(-4)}`, // Show last 4 digits for privacy
      time: new Date(request.timeStamp).toLocaleString(),
      status: request.resStatus === 200 ? 'success' as const : 'error' as const,
      details: `Processing time: ${request.processingTime}ms | ${request.userAgent?.substring(0, 30)}...`,
    }));
  };

  // System health metrics
  const getSystemHealth = () => {
    if (!data.summary) return null;
    
    return {
      avgResponseTime: data.summary.avgProcessingTime,
      minResponseTime: data.summary.minProcessingTime,
      maxResponseTime: data.summary.maxProcessingTime,
      uptime: 99.9,
      requestsPerSecond: data.summary.totalRequests / (24 * 60 * 60), // Assuming daily data
    };
  };

  if (loading.summary && loading.completeAnalytics && loading.userAnalytics) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const kpiData = getKPIData();
  const trendData = getTrendData();
  const performanceData = getPerformanceData();
  const distributionData = getDistributionData();
  const activities = getRecentActivities();
  const systemHealth = getSystemHealth();

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Executive Dashboard
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time analytics overview • Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <RealTimeRefresh 
              onRefresh={handleAutoRefresh}
              isEnabled={autoRefreshEnabled}
              onToggle={setAutoRefreshEnabled}
            />
            
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* System Health Summary */}
        {systemHealth && (
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              System Health
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {systemHealth.uptime}%
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {systemHealth.avgResponseTime?.toFixed(1)}ms
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {systemHealth.minResponseTime}ms
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Min Response</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                  {systemHealth.maxResponseTime}ms
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Max Response</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {systemHealth.requestsPerSecond?.toFixed(2)}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Req/sec</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trendData && (
            <ChartCard
              title="Request Trends"
              subtitle="Requests by category over time"
              type="line"
              data={trendData}
              className="lg:col-span-2"
            />
          )}
          
          {distributionData && (
            <ChartCard
              title="Category Distribution"
              subtitle="Request distribution by category"
              type="doughnut"
              data={distributionData}
            />
          )}
          
          {performanceData && (
            <ChartCard
              title="Performance Overview"
              subtitle="Success vs Error rates by category"
              type="bar"
              data={performanceData}
              className="lg:col-span-2"
            />
          )}

          {/* Quick Stats Card */}
          <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Categories Active
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data.summary?.uniqueCategoryCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Success Rate
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {data.summary?.successRate?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Users
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data.summary?.uniqueUserCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Data Freshness
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Real-time
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Activity and Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ActivityCard
            title="Recent Activity"
            activities={activities}
            className="xl:col-span-2"
          />
          
          {/* Enhanced Quick Actions */}
          <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowExportModal(true)}
                className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors group"
              >
                <div className="flex items-center">
                  <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <div className="font-medium text-blue-700 dark:text-blue-300">Export Dashboard</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Download comprehensive report</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition-colors group">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-300">View Analytics</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Detailed analytics breakdown</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors group">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <div>
                    <div className="font-medium text-purple-700 dark:text-purple-300">User Insights</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">User behavior analysis</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={handleRefresh}
                className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 transition-colors group"
              >
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                  <div>
                    <div className="font-medium text-orange-700 dark:text-orange-300">Refresh Data</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Update all metrics</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <AdvancedExportModal
            onExport={handleExport}
            onClose={() => setShowExportModal(false)}
            totalItems={data.completeAnalytics?.length || 0}
            data={data}
          />
        )}
      </div>
    </PullToRefresh>
  );
};

export default ExecutiveDashboard;