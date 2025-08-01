import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  icon: typeof LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400',
  },
};

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon: Icon, color }) => {
  const { theme } = useTheme();
  const colors = colorMap[color];

  return (
    <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm mt-2 ${colors.trend}`}>
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;