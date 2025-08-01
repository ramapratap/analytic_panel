import React from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface User {
  id: string;
  totalRequests: number;
  successfulRequests: number;
  categories: string[];
  lastActivity: string;
  firstActivity: string;
  userAgent: string;
  ipAddress: string;
  successRate: string;
  engagementScore: number;
}

interface UserTableProps {
  users: User[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  expandedUser: string | null;
  setExpandedUser: (userId: string | null) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  setSelectedUsers,
  expandedUser,
  setExpandedUser,
}) => {
  const { theme } = useTheme();

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(
      selectedUsers.includes(userId)
        ? selectedUsers.filter(id => id !== userId)
        : [...selectedUsers, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length
        ? []
        : users.map(user => user.id)
    );
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 80) return { label: 'High', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' };
    if (score >= 40) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' };
    return { label: 'Low', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' };
  };

  return (
    <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            User Details ({users.length})
          </h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Select All
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((user) => {
            const isExpanded = expandedUser === user.id;
            const isSelected = selectedUsers.includes(user.id);
            const engagementBadge = getEngagementBadge(user.engagementScore);

            return (
              <div key={user.id} className={`border rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleUserSelect(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex items-center space-x-2">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.id}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.totalRequests} requests • {user.categories.length} categories
                          </p>
                        </div>
                      </div>
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
                          Score: {user.engagementScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={`px-4 pb-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Activity Stats
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Requests:</span>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{user.totalRequests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Successful:</span>
                            <span className="text-green-600 dark:text-green-400">{user.successfulRequests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Failed:</span>
                            <span className="text-red-600 dark:text-red-400">{user.totalRequests - user.successfulRequests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>First Activity:</span>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {new Date(user.firstActivity).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Last Activity:</span>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {new Date(user.lastActivity).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Categories ({user.categories.length})
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {user.categories.map((category, index) => (
                            <span
                              key={index}
                              className={`inline-block px-2 py-1 text-xs rounded-full mr-1 mb-1 ${
                                theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Technical Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>IP Address:</span>
                          <p className={`font-mono text-xs mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.ipAddress}
                          </p>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>User Agent:</span>
                          <p className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.userAgent}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserTable;