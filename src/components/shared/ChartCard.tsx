import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, type, data, className = '' }) => {
  const { theme } = useTheme();
  const chartRef = useRef<any>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        },
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={data} options={options} />;
      case 'bar':
        return <Bar ref={chartRef} data={data} options={options} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={data} options={options} />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard;