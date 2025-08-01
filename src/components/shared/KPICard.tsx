import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
};

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color, 
  subtitle,
  loading = false,
  onClick 
}) => {
  const { theme } = useTheme();
  const colors = colorMap[color];

  const isPositiveTrend = trend.startsWith('+');
  const isNegativeTrend = trend.startsWith('-');

  if (loading) {
    return (
      <div className={`p-6 rounded-xl border card-hover ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`h-4 w-24 rounded mb-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div className={`h-8 w-16 rounded mb-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div className={`h-3 w-12 rounded ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
            </div>
            <div className={`h-12 w-12 rounded-lg ${colors.bg}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-6 rounded-xl border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg' : ''
      } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      hover:border-opacity-60 ${onClick ? `hover:${colors.border}` : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          
          <div className="flex items-baseline space-x-2">
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {value}
            </p>
            
            <div className={`flex items-center text-sm font-medium ${
              isPositiveTrend && color === 'green' ? 'text-green-600 dark:text-green-400' :
              isNegativeTrend && color === 'red' ? 'text-red-600 dark:text-red-400' :
              colors.trend
            }`}>
              <span className={`inline-flex items-center ${
                isPositiveTrend ? 'text-green-600 dark:text-green-400' :
                isNegativeTrend ? 'text-red-600 dark:text-red-400' :
                colors.trend
              }`}>
                {isPositiveTrend && (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isNegativeTrend && (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {trend}
              </span>
            </div>
          </div>
          
          {subtitle && (
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colors.bg} ml-4 flex-shrink-0`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
      
      {/* Progress indicator for trends */}
      <div className="mt-4">
        <div className={`w-full h-1 rounded-full ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-1 rounded-full transition-all duration-500 ${
              isPositiveTrend ? 'bg-green-500' :
              isNegativeTrend ? 'bg-red-500' :
              colors.icon.includes('blue') ? 'bg-blue-500' :
              colors.icon.includes('purple') ? 'bg-purple-500' :
              'bg-gray-500'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(parseFloat(trend.replace('%', '').replace('+', '').replace('-', ''))) * 10, 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KPICard;