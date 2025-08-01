import React, { useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

interface SegmentationChartProps {
  title: string;
  data: any;
}

const SegmentationChart: React.FC<SegmentationChartProps> = ({ title, data }) => {
  const { theme } = useTheme();
  const chartRef = useRef<any>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme === 'dark' ? '#D1D5DB' : '#374151',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
        bodyColor: theme === 'dark' ? '#D1D5DB' : '#374151',
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="chart-container">
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};

export default SegmentationChart;