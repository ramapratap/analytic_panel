import React, { useEffect } from 'react';
import { QrCode, Link, TrendingUp, MousePointer } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';
import ChartCard from './shared/ChartCard';
import LoadingSkeleton from './shared/LoadingSkeleton';

const QRSmartLinksPerformance: React.FC = () => {
  const { data, loading, fetchData } = useApi();
  const { theme } = useTheme();

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          fetchData('https://s-qc.in/fetchQrById/688b10f5fa588e8292a81ed5', 'qrAnalytics', 'GET'),
          fetchData('https://s-qc.in/fetchSmartLinkByUser/676410d092064c3242909930', 'smartLinks', 'POST')
        ]);
      } catch (error) {
        console.error('Error initializing QR/Smart Links data:', error);
      }
    };

    initData();
  }, [fetchData]);

  // Process QR Analytics Data
  const getQRData = () => {
    if (!data.qrAnalytics) return null;
    
    const qrData = data.qrAnalytics;
    return {
      totalScans: qrData.qr_scan_count || qrData.analytics?.averageDailyScans || 0,
      deviceBreakdown: qrData.analytics?.deviceBreakdown || {},
      timeStats: qrData.analytics?.timeStats || {},
      dailyScans: qrData.analytics?.timeStats?.dailyScans || {},
    };
  };

  // Process Smart Links Data
  const getSmartLinksData = () => {
    if (!data.smartLinks) return [];
    
    let linksArray: any[] = [];
    
    // Handle different data structures
    if (Array.isArray(data.smartLinks)) {
      linksArray = data.smartLinks;
    } else if (data.smartLinks && typeof data.smartLinks === 'object') {
      // Check if it has a 'data' property
      if ('data' in data.smartLinks && Array.isArray((data.smartLinks as any).data)) {
        linksArray = (data.smartLinks as any).data;
      } else {
        // If it's a single object, wrap it in an array
        linksArray = [data.smartLinks];
      }
    }
    
    if (!Array.isArray(linksArray)) return [];
    
    return linksArray.map((link: any) => ({
      id: link._id || link.id || Math.random().toString(),
      name: link.name || 'Unnamed Link',
      clickRate: link.clickRate || 0,
      totalClicks: link.totalClicks || 0,
      isActive: link.isActive !== undefined ? link.isActive : true,
      createdAt: link.createdAt || Date.now(),
      lastClickedAt: link.lastClickedAt || null,
      redirectLink: link.redirect_link || link.redirectLink || '#',
    }));
  };

  // Generate QR device breakdown chart
  const getQRDeviceData = () => {
    const qrData = getQRData();
    if (!qrData?.deviceBreakdown) return null;

    const breakdown = qrData.deviceBreakdown;
    const hasData = (breakdown.mobile || 0) + (breakdown.tablet || 0) + (breakdown.desktop || 0) > 0;
    
    if (!hasData) return null;

    return {
      labels: ['Mobile', 'Tablet', 'Desktop'],
      datasets: [{
        data: [
          breakdown.mobile || 0,
          breakdown.tablet || 0,
          breakdown.desktop || 0,
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      }]
    };
  };

  // Generate QR daily scans trend
  const getQRTrendData = () => {
    const qrData = getQRData();
    if (!qrData?.dailyScans) return null;

    const scans = qrData.dailyScans;
    const dates = Object.keys(scans).sort().slice(-7); // Last 7 days
    
    if (dates.length === 0) return null;
    
    return {
      labels: dates.map(date => new Date(date).toLocaleDateString()),
      datasets: [{
        label: 'Daily Scans',
        data: dates.map(date => scans[date] || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }]
    };
  };

  // Generate Smart Links performance chart
  const getSmartLinksChart = () => {
    const links = getSmartLinksData().slice(0, 10);
    if (!links.length) return null;

    return {
      labels: links.map((link: any) => {
        const name = link.name || 'Unnamed';
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      }),
      datasets: [{
        label: 'Total Clicks',
        data: links.map((link: any) => link.totalClicks),
        backgroundColor: '#10B981',
      }]
    };
  };

  // Get comparison data
  const getComparisonData = () => {
    const qrData = getQRData();
    const smartLinks = getSmartLinksData();
    
    const totalQRScans = qrData?.totalScans || 0;
    const totalSmartLinkClicks = smartLinks.reduce((sum: number, link: any) => sum + (link.totalClicks || 0), 0);
    
    if (totalQRScans === 0 && totalSmartLinkClicks === 0) return null;
    
    return {
      labels: ['QR Code Scans', 'Smart Link Clicks'],
      datasets: [{
        data: [totalQRScans, totalSmartLinkClicks],
        backgroundColor: ['#3B82F6', '#10B981'],
      }]
    };
  };

  const isLoading = loading.qrAnalytics || loading.smartLinks;

  if (isLoading && !data.qrAnalytics && !data.smartLinks) {
    return <LoadingSkeleton type="performance" />;
  }

  const qrData = getQRData();
  const smartLinks = getSmartLinksData();
  const qrDeviceData = getQRDeviceData();
  const qrTrendData = getQRTrendData();
  const smartLinksChart = getSmartLinksChart();
  const comparisonData = getComparisonData();

  // Calculate summary stats
  const totalQRScans = qrData?.totalScans || 0;
  const totalSmartLinks = smartLinks.length;
  const totalClicks = smartLinks.reduce((sum: number, link: any) => sum + (link.totalClicks || 0), 0);
  const activeLinks = smartLinks.filter((link: any) => link.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          QR & Smart Links Performance
        </h1>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive performance analysis of QR codes and smart links
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total QR Scans
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalQRScans.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Link className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Smart Links
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalSmartLinks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MousePointer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Clicks
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border card-hover ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Links
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activeLinks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* QR Analytics Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              QR Code Analytics
            </h2>
          </div>
          
          {qrTrendData ? (
            <ChartCard
              title="Daily Scan Trends"
              subtitle="QR code scans over the last 7 days"
              type="line"
              data={qrTrendData}
            />
          ) : (
            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Daily Scan Trends
              </h3>
              <div className="text-center py-8">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No scan trend data available
                </p>
              </div>
            </div>
          )}
          
          {qrDeviceData ? (
            <ChartCard
              title="Device Breakdown"
              subtitle="QR scans by device type"
              type="doughnut"
              data={qrDeviceData}
            />
          ) : (
            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Device Breakdown
              </h3>
              <div className="text-center py-8">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No device breakdown data available
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Smart Links Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Smart Links Performance
            </h2>
          </div>
          
          {smartLinksChart ? (
            <ChartCard
              title="Top Performing Links"
              subtitle="Links with highest click counts"
              type="bar"
              data={smartLinksChart}
            />
          ) : (
            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Top Performing Links
              </h3>
              <div className="text-center py-8">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No smart links data available
                </p>
              </div>
            </div>
          )}
          
          {/* Smart Links Table */}
          <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Smart Links
            </h3>
            {smartLinks.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {smartLinks.slice(0, 10).map((link: any) => (
                  <div
                    key={link.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {link.name}
                        </p>
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {link.redirectLink}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {link.totalClicks} clicks
                        </p>
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${link.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {link.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No smart links found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      {comparisonData && (
        <ChartCard
          title="QR vs Smart Links Comparison"
          subtitle="Performance comparison between QR codes and smart links"
          type="doughnut"
          data={comparisonData}
          className="max-w-md mx-auto"
        />
      )}
    </div>
  );
};

export default QRSmartLinksPerformance;