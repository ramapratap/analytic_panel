import React, { useEffect, useState } from 'react';
import { Users, Search, Eye, TrendingUp, UserCheck } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import UserTable from './shared/UserTable';
import UserFlowChart from './shared/UserFlowChart';
import SegmentationChart from './shared/SegmentationChart';
import LoadingSkeleton from './shared/LoadingSkeleton';

const UserAnalytics: React.FC = () => {
  const { data, loading, fetchData } = useApi();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!data.userAnalytics) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics/user/919015190754', 'userAnalytics', 'GET');
    }
  }, []);

  // Process user data
  const getUserData = () => {
    if (!data.userAnalytics?.userRequests) return [];
    
    const requests = data.userAnalytics.userRequests;
    const userMap = new Map();

    requests.forEach((request: any) => {
      const userId = request.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          totalRequests: 0,
          successfulRequests: 0,
          categories: new Set(),
          lastActivity: request.timeStamp,
          firstActivity: request.timeStamp,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
        });
      }
      
      const user = userMap.get(userId);
      user.totalRequests++;
      if (request.resStatus === 200) {
        user.successfulRequests++;
      }
      user.categories.add(request.category);
      
      if (new Date(request.timeStamp) > new Date(user.lastActivity)) {
        user.lastActivity = request.timeStamp;
      }
      if (new Date(request.timeStamp) < new Date(user.firstActivity)) {
        user.firstActivity = request.timeStamp;
      }
    });

    return Array.from(userMap.values()).map(user => ({
      ...user,
      categories: Array.from(user.categories),
      successRate: ((user.successfulRequests / user.totalRequests) * 100).toFixed(1),
      engagementScore: Math.min(100, (user.totalRequests * 10 + user.categories.length * 5)),
    }));
  };

  // Filter users based on search
  const getFilteredUsers = () => {
    const users = getUserData();
    if (!searchTerm) return users;
    
    return users.filter(user =>
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.categories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Get segmentation data
  const getSegmentationData = () => {
    const users = getUserData();
    
    const segments = {
      'High Engagement': users.filter(u => u.engagementScore >= 80).length,
      'Medium Engagement': users.filter(u => u.engagementScore >= 40 && u.engagementScore < 80).length,
      'Low Engagement': users.filter(u => u.engagementScore < 40).length,
    };

    return {
      labels: Object.keys(segments),
      datasets: [{
        data: Object.values(segments),
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      }]
    };
  };

  // Get user behavior flow data
  const getFlowData = () => {
    if (!data.userAnalytics?.userRequests) return null;
    
    const requests = data.userAnalytics.userRequests;
    const categoryFlow = new Map();
    
    requests.forEach((request: any) => {
      const category = request.category;
      if (!categoryFlow.has(category)) {
        categoryFlow.set(category, 0);
      }
      categoryFlow.set(category, categoryFlow.get(category) + 1);
    });

    return Array.from(categoryFlow.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  if (loading.userAnalytics) {
    return <LoadingSkeleton type="users" />;
  }

  const users = getFilteredUsers();
  const segmentationData = getSegmentationData();
  const flowData = getFlowData();

  // Summary statistics
  const totalUsers = users.length;
  const avgEngagement = users.reduce((sum, user) => sum + user.engagementScore, 0) / totalUsers || 0;
  const activeUsers = users.filter(user => {
    const lastActivity = new Date(user.lastActivity);
    const now = new Date();
    const daysDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            User Analytics Deep Dive
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed user behavior analysis and segmentation
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Users
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Users (7d)
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Engagement
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {avgEngagement.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Selected Users
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedUsers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="relative">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search users by ID or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SegmentationChart
          title="User Segmentation"
          data={segmentationData}
        />
        
        {flowData && (
          <UserFlowChart
            title="User Behavior Flow"
            data={flowData}
          />
        )}
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        expandedUser={expandedUser}
        setExpandedUser={setExpandedUser}
      />
    </div>
  );
};

export default UserAnalytics;