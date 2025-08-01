import React from 'react';
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ExportModalProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  onClose: () => void;
  totalItems: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ onExport, onClose, totalItems }) => {
  const { theme } = useTheme();

  const exportOptions = [
    {
      format: 'csv' as const,
      icon: FileText,
      title: 'CSV Export',
      description: 'Comma-separated values file for spreadsheet applications',
      size: `~${Math.ceil(totalItems * 0.5)}KB`,
    },
    {
      format: 'excel' as const,
      icon: FileSpreadsheet,
      title: 'Excel Export',
      description: 'Microsoft Excel format with formatting and formulas',
      size: `~${Math.ceil(totalItems * 0.8)}KB`,
    },
    {
      format: 'pdf' as const,
      icon: FileText,
      title: 'PDF Report',
      description: 'Formatted PDF report with charts and tables',
      size: `~${Math.ceil(totalItems * 1.2)}KB`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Export Data
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose your preferred export format for {totalItems.toLocaleString()} records:
            </p>
            
            <div className="space-y-3">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.format}
                    onClick={() => onExport(option.format)}
                    className={`w-full p-4 rounded-lg border transition-colors text-left ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {option.title}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {option.description}
                        </p>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {option.size}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;