import React, { useState } from 'react';
import { Code, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useTheme } from '../context/ThemeContext';

const DebugPanel: React.FC = () => {
  const { data, loading, error } = useApi();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDataKey, setSelectedDataKey] = useState<string>('summary');

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Open Debug Panel"
        >
          <Code size={20} />
        </button>
      </div>
    );
  }

  const dataKeys = Object.keys(data) as Array<keyof typeof data>;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <div className={`rounded-lg border shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Code size={16} />
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Debug Panel
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <EyeOff size={16} />
          </button>
        </div>

        {/* Data Key Selector */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <select
            value={selectedDataKey}
            onChange={(e) => setSelectedDataKey(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {dataKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading:
              </span>
              <div className="flex items-center space-x-1">
                {loading[selectedDataKey] ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-blue-600 rounded-full border-t-transparent" />
                    <span className="text-xs text-blue-600">Loading</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">Ready</span>
                  </>
                )}
              </div>
            </div>

            {error[selectedDataKey] && (
              <div className="flex items-center space-x-1">
                <AlertCircle size={12} className="text-red-600" />
                <span className="text-xs text-red-600">
                  {error[selectedDataKey]}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Data:
              </span>
              <span className={`text-xs ${
                data[selectedDataKey as keyof typeof data] ? 'text-green-600' : 'text-red-600'
              }`}>
                {data[selectedDataKey as keyof typeof data] ? 'Available' : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="p-4 max-h-48 overflow-y-auto">
          <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Data Preview:
          </h4>
          <pre className={`text-xs p-2 rounded border overflow-x-auto ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-600 text-gray-300'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            {JSON.stringify(data[selectedDataKey as keyof typeof data], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;