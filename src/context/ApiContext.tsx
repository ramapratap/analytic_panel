import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface ApiData {
  userAnalytics: {
    userRequests: any[];
    summary: any;
    pagination: any;
  } | null;
  summary: {
    totalRequests: number;
    successCount: number;
    systemErrorCount: number;
    successfulRequests: number;
    clientErrorRequests: number;
    serverErrorRequests: number;
    minProcessingTime: number;
    maxProcessingTime: number;
    avgProcessingTime: number;
    uniqueUserCount: number;
    uniqueCategoryCount: number;
    successRate: number;
    errorRate: number;
  } | null;
  completeAnalytics: any[] | null;
  categoriesAnalytics: any[] | null;
  smartLinks: any[] | null;
  qrAnalytics: any | null;
}

interface ApiContextType {
  data: ApiData;
  loading: { [key: string]: boolean };
  error: { [key: string]: string | null };
  fetchData: (endpoint: string, key: keyof ApiData, method?: string, requestBody?: any) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

const API_ENDPOINTS = {
  userAnalytics: {
    url: 'https://mnowapi.web-dimension.com/api/v1/analytics/user/919015190754',
    method: 'GET'
  },
  summary: {
    url: 'https://mnowapi.web-dimension.com/api/v1/analytics/summary',
    method: 'GET'
  },
  completeAnalytics: {
    url: 'https://mnowapi.web-dimension.com/api/v1/analytics',
    method: 'GET'
  },
  categoriesAnalytics: {
    url: 'https://mnowapi.web-dimension.com/api/v1/analytics/categories',
    method: 'GET'
  },
  smartLinks: {
    url: 'https://s-qc.in/fetchSmartLinkByUser/676410d092064c3242909930',
    method: 'POST'
  },
  qrAnalytics: {
    url: 'https://s-qc.in/fetchQrById/688b10f5fa588e8292a81ed5',
    method: 'GET'
  }
};

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [data, setData] = useState<ApiData>({
    userAnalytics: null,
    summary: null,
    completeAnalytics: null,
    categoriesAnalytics: null,
    smartLinks: null,
    qrAnalytics: null,
  });

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string | null }>({});

  const fetchData = useCallback(async (endpoint: string, key: keyof ApiData, method = 'GET', requestBody?: any) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: null }));

    try {
      const response = await axiosInstance({
        url: endpoint,
        method,
        data: method === 'POST' ? requestBody : undefined
      });

      const result = response.data;
      let extractedData;

      // Handle different response structures
      if (result.success || result.status) {
        switch (key) {
          case 'summary':
            extractedData = result.data?.summary || null;
            break;
          case 'completeAnalytics':
            extractedData = result.data?.analytics || null;
            break;
          case 'categoriesAnalytics':
            extractedData = result.data?.categories || null;
            break;
          case 'userAnalytics':
            extractedData = result.data || null;
            break;
          case 'smartLinks':
            extractedData = result.data || null;
            break;
          case 'qrAnalytics':
            extractedData = result.data?.qrData || result.data || null;
            break;
          default:
            extractedData = result.data || result;
        }
      } else {
        extractedData = result;
      }

      setData(prev => ({ ...prev, [key]: extractedData }));
      console.log(`Successfully fetched ${key}:`, extractedData);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(prev => ({ ...prev, [key]: errorMessage }));
      console.error(`Error fetching ${key}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    const promises = Object.entries(API_ENDPOINTS).map(([key, config]) =>
      fetchData(config.url, key as keyof ApiData, config.method)
    );
    
    try {
      await Promise.allSettled(promises);
      console.log('All data refresh completed');
    } catch (error) {
      console.error('Error during data refresh:', error);
    }
  }, [fetchData]);

  return (
    <ApiContext.Provider value={{ data, loading, error, fetchData, refreshAllData }}>
      {children}
    </ApiContext.Provider>
  );
};