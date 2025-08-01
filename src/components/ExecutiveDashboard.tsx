import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import KPICard from './shared/KPICard';
import ChartCard from './shared/ChartCard';
import ActivityCard from './shared/ActivityCard';
import LoadingSkeleton from './shared/LoadingSkeleton';

const ExecutiveDashboard: React.FC = () => {
  const { data, loading, fetchData, refreshAllData } = useApi();
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    await refreshAllData();
    setIsRefreshing(false);
  };

  // Generate KPI data from API responses
  const getKPIData = () => {
    if (!data.summary) return [];
    
    const summary = data.summary;
    return [
      {
        title: 'Total Requests',
        value: summary.totalRequests?.toLocaleString() || '0',
        trend: '+12.5%',
        icon: Activity,
        color: 'blue' as 'blue',
      },
      {
        title: 'Success Rate',
        value: `${summary.successRate?.toFixed(1) || '0'}%`,
        trend: '+2.1%',
        icon: TrendingUp,
        color: 'green' as 'green',
      },
      {
        title: 'Unique Users',
        value: summary.uniqueUserCount?.toLocaleString() || '0',
        trend: '+8.3%',
        icon: Users,
        color: 'purple' as 'purple',
      },
      {
        title: 'Error Rate',
        value: `${summary.errorRate?.toFixed(2) || '0'}%`,
        trend: '-1.2%',
        icon: AlertCircle,
        color: 'red' as 'red',
      },
    ];
  };

  // Generate chart data
  const getTrendData = () => {
    if (!data.completeAnalytics) return null;
    
    const categories = data.completeAnalytics;
    return {
      labels: categories.map((cat: any) => cat.category.substring(0, 20)),
      datasets: [{
        label: 'Total Requests',
        data: categories.map((cat: any) => cat.totalRequests),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }]
    };
  };

  const getPerformanceData = () => {
    if (!data.completeAnalytics) return null;
    
    const categories = data.completeAnalytics;
    return {
      labels: categories.map((cat: any) => cat.category.substring(0, 15) + '...'),
      datasets: [{
        label: 'Success Count',
        data: categories.map((cat: any) => cat.successCount),
        backgroundColor: '#10B981',
      }, {
        label: 'Error Count',
        data: categories.map((cat: any) => cat.errorCount),
        backgroundColor: '#EF4444',
      }]
    };
  };

  const getDistributionData = () => {
    if (!data.completeAnalytics) return null;
    
    const categories = data.completeAnalytics.slice(0, 5);
    return {
      labels: categories.map((cat: any) => cat.category),
      datasets: [{
        data: categories.map((cat: any) => cat.totalRequests),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
      }]
    };
  };

  const getRecentActivities = () => {
    if (!data.userAnalytics?.userRequests) return [];
    
    return data.userAnalytics.userRequests.slice(0, 10).map((request: any) => ({
      id: request._id,
      action: request.category,
      user: request.userId,
      time: new Date(request.timeStamp).toLocaleString(),
      status: request.resStatus === 200 ? 'success' as const : 'error' as const,
      details: `${request.userAgent?.substring(0, 50)}...`,
    }));
  };

  if (loading.summary && loading.completeAnalytics && loading.userAnalytics) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const kpiData = getKPIData();
  const trendData = getTrendData();
  const performanceData = getPerformanceData();
  const distributionData = getDistributionData();
  const activities = getRecentActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Executive Dashboard
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Overview of key performance metrics and trends
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts */}
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
            subtitle="Success vs Error rates"
            type="bar"
            data={performanceData}
            className="lg:col-span-2"
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ActivityCard
          title="Recent Activity"
          activities={activities}
          className="xl:col-span-2"
        />
        
        {/* Quick Actions */}
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors">
              <div className="font-medium text-blue-700 dark:text-blue-300">Generate Report</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Create comprehensive analytics report</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition-colors">
              <div className="font-medium text-green-700 dark:text-green-300">Export Data</div>
              <div className="text-sm text-green-600 dark:text-green-400">Download analytics data</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors">
              <div className="font-medium text-purple-700 dark:text-purple-300">Schedule Alert</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Set up performance alerts</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;