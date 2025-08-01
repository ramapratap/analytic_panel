import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'error';
  details: string;
}

interface ActivityCardProps {
  title: string;
  activities: Activity[];
  className?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, activities, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              {activity.status === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activity.action}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                User: {activity.user}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} truncate`}>
                {activity.details}
              </p>
              <div className="flex items-center mt-1">
                <Clock className={`h-3 w-3 mr-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityCard;