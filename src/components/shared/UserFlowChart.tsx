import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface UserFlowChartProps {
  title: string;
  data: [string, number][];
}

const UserFlowChart: React.FC<UserFlowChartProps> = ({ title, data }) => {
  const { theme } = useTheme();

  const maxValue = Math.max(...data.map(item => item[1]));

  return (
    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <div className="space-y-3">
        {data.map(([category, count], index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {category}
              </span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {count.toLocaleString()}
              </span>
            </div>
            <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{ width: `${(count / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>No flow data available</p>
        </div>
      )}
    </div>
  );
};

export default UserFlowChart;