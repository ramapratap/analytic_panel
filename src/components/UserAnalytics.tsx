import React, { useEffect, useState } from 'react';
import { Users, Search, Eye, TrendingUp, UserCheck, X } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import SegmentationChart from './shared/SegmentationChart';
import UserFlowChart from './shared/UserFlowChart';
import LoadingSkeleton from './shared/LoadingSkeleton';

const UserAnalytics: React.FC = () => {
  const { data, loading, fetchData } = useApi();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userModalData, setUserModalData] = useState<any>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  useEffect(() => {
    if (!data.completeAnalytics) {
      fetchData('https://mnowapi.web-dimension.com/api/v1/analytics', 'completeAnalytics', 'GET');
    }
  }, []);

  // Process user data from complete analytics
  const getUserData = () => {
    if (!data.completeAnalytics) return [];
    
    const requests = data.completeAnalytics;
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
          avgProcessingTime: 0,
          totalProcessingTime: 0,
        });
      }
      
      const user = userMap.get(userId);
      user.totalRequests++;
      if (request.resStatus === 200) {
        user.successfulRequests++;
      }
      user.categories.add(request.category);
      user.totalProcessingTime += request.processingTime || 0;
      
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
      avgProcessingTime: (user.totalProcessingTime / user.totalRequests).toFixed(2),
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
    if (!data.completeAnalytics) return null;
    
    const requests = data.completeAnalytics;
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

  // Function to fetch individual user details
  const fetchUserDetails = async (userId: string) => {
    setLoadingUserDetails(true);
    try {
      await fetchData(`https://mnowapi.web-dimension.com/api/v1/analytics/user/${userId}`, 'userAnalytics', 'GET');
      setUserModalData(data.userAnalytics);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  if (loading.completeAnalytics) {
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
                Viewing Details
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedUser ? '1' : '0'}
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

      {/* User List */}
      <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            All Users ({users.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => {
              const isSelected = selectedUser === user.id;
              const engagementBadge = user.engagementScore >= 80 ? 
                { label: 'High', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' } :
                user.engagementScore >= 40 ? 
                { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' } :
                { label: 'Low', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' };

              return (
                <div 
                  key={user.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => fetchUserDetails(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        User ID: {user.id}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.totalRequests} requests • {user.categories.length} categories
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Last active: {new Date(user.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${engagementBadge.color}`}>
                        {engagementBadge.label}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user.successRate}% success
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.avgProcessingTime}ms avg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && userModalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    User Details: {selectedUser}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserModalData(null);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {userModalData?.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Summary Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Requests:</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{userModalData.summary.totalRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Success Rate:</span>
                          <span className="text-green-600 dark:text-green-400">{userModalData.summary.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Categories Used:</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{userModalData.summary.categoryCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Avg Processing Time:</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{userModalData.summary.avgProcessingTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Most Used Category:</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{userModalData.summary.mostUsedCategory}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Categories Used
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {userModalData.summary.categoriesUsed?.map((category: string, index: number) => (
                          <span
                            key={index}
                            className={`inline-block px-2 py-1 text-xs rounded-full mr-1 mb-1 ${
                              theme === 'dark'
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {userModalData?.userRequests && (
                  <div className="mt-6">
                    <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Recent Requests ({userModalData.userRequests.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userModalData.userRequests.map((request: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {request.category}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(request.timeStamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                request.resStatus === 200
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                {request.resStatus === 200 ? 'Success' : 'Error'}
                              </div>
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {request.processingTime}ms
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingUserDetails && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex items-center justify-center">
          <div className={`p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Loading user details...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;