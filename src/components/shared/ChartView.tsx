import React from 'react';
import ChartCard from './ChartCard';

interface ChartViewProps {
  data: any[];
}

const ChartView: React.FC<ChartViewProps> = ({ data }) => {
  // Generate chart data from table data
  const getChartData = () => {
    const top10 = data.slice(0, 10);
    
    return {
      labels: top10.map(item => item.category.substring(0, 15) + '...'),
      datasets: [
        {
          label: 'Total Requests',
          data: top10.map(item => item.totalRequests),
          backgroundColor: '#3B82F6',
        },
        {
          label: 'Success Count',
          data: top10.map(item => item.successCount),
          backgroundColor: '#10B981',
        },
        {
          label: 'Error Count',
          data: top10.map(item => item.errorCount),
          backgroundColor: '#EF4444',
        },
      ]
    };
  };

  const getSuccessRateData = () => {
    const top10 = data.slice(0, 10);
    
    return {
      labels: top10.map(item => item.category.substring(0, 15) + '...'),
      datasets: [{
        label: 'Success Rate (%)',
        data: top10.map(item => parseFloat(item.successRate)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }]
    };
  };

  const chartData = getChartData();
  const successRateData = getSuccessRateData();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Category Performance"
          subtitle="Requests, success and error counts by category"
          type="bar"
          data={chartData}
        />
        
        <ChartCard
          title="Success Rate Trends"
          subtitle="Success rate percentage by category"
          type="line"
          data={successRateData}
        />
      </div>
    </div>
  );
};

export default ChartView;