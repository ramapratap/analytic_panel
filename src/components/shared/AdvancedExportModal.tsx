import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeCharts: boolean;
  dateRange: { start: string; end: string };
  columns: string[];
}

interface AdvancedExportModalProps {
  onExport: (config: ExportConfig) => void;
  onClose: () => void;
  totalItems: number;
  data: any;
}

const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({ 
  onExport, 
  onClose, 
  totalItems, 
  data 
}) => {
  const { theme } = useTheme();
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedColumns, setSelectedColumns] = useState(new Set(['all']));

  const columns = [
    { id: 'category', label: 'Category' },
    { id: 'totalRequests', label: 'Total Requests' },
    { id: 'successCount', label: 'Success Count' },
    { id: 'errorCount', label: 'Error Count' },
    { id: 'successRate', label: 'Success Rate' },
    { id: 'avgProcessingTime', label: 'Avg Processing Time' },
    { id: 'uniqueUsers', label: 'Unique Users' }
  ];

  const exportOptions = [
    {
      format: 'csv' as const,
      icon: FileText,
      title: 'CSV Export',
      description: 'Comma-separated values for spreadsheet applications',
      size: `~${Math.ceil(totalItems * 0.5)}KB`,
    },
    {
      format: 'excel' as const,
      icon: FileSpreadsheet,
      title: 'Excel Export',
      description: 'Microsoft Excel format with formatting',
      size: `~${Math.ceil(totalItems * 0.8)}KB`,
    },
    {
      format: 'pdf' as const,
      icon: FileText,
      title: 'PDF Report',
      description: 'Formatted PDF report with charts',
      size: `~${Math.ceil(totalItems * 1.2)}KB`,
    },
    {
      format: 'json' as const,
      icon: FileText,
      title: 'JSON Data',
      description: 'Raw JSON data for developers',
      size: `~${Math.ceil(totalItems * 0.6)}KB`,
    },
  ];

  const handleColumnToggle = (columnId: string) => {
    const newSelected = new Set(selectedColumns);
    if (columnId === 'all') {
      if (newSelected.has('all')) {
        newSelected.clear();
      } else {
        newSelected.clear();
        newSelected.add('all');
        columns.forEach(col => newSelected.add(col.id));
      }
    } else {
      if (newSelected.has(columnId)) {
        newSelected.delete(columnId);
        newSelected.delete('all');
      } else {
        newSelected.add(columnId);
        if (newSelected.size === columns.length + 1) {
          newSelected.add('all');
        }
      }
    }
    setSelectedColumns(newSelected);
  };

  const handleExport = () => {
    const exportConfig: ExportConfig = {
      format: exportFormat,
      includeCharts,
      dateRange,
      columns: Array.from(selectedColumns).filter(col => col !== 'all')
    };
    onExport(exportConfig);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Advanced Export Options
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Export Format Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {exportOptions.map(({ format, icon: Icon, title, description, size }) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        exportFormat === format
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : theme === 'dark'
                            ? 'border-gray-600 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Icon className="h-5 w-5 mr-2" />
                        <span className="font-medium">{title}</span>
                      </div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {description}
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {size}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Start date"
                    />
                  </div>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className={`px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Column Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Columns to Export
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.has('all')}
                      onChange={() => handleColumnToggle('all')}
                      className="mr-2 h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {columns.map(column => (
                    <label key={column.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColumns.has(column.id)}
                        onChange={() => handleColumnToggle(column.id)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    disabled={exportFormat !== 'pdf'}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <span className={`text-sm ${exportFormat !== 'pdf' ? 'opacity-50' : ''}`}>
                    Include charts and visualizations (PDF only)
                  </span>
                </label>
              </div>

              {/* Export Summary */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Export Summary
                </h4>
                <div className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <div>Records: {totalItems.toLocaleString()}</div>
                  <div>Format: {exportFormat.toUpperCase()}</div>
                  <div>Columns: {selectedColumns.has('all') ? 'All' : selectedColumns.size - 1}</div>
                  <div>Include Charts: {includeCharts ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedColumns.size === 0 || (selectedColumns.size === 1 && selectedColumns.has('all'))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedExportModal;
