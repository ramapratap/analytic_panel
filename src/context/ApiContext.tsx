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

// Mock data for development - replace with actual API calls when CORS is resolved
const mockData = {
  summary: {
    totalRequests: 70,
    successCount: 70,
    systemErrorCount: 0,
    successfulRequests: 70,
    clientErrorRequests: 0,
    serverErrorRequests: 0,
    minProcessingTime: 0,
    maxProcessingTime: 193,
    avgProcessingTime: 2.89,
    uniqueUserCount: 22,
    uniqueCategoryCount: 6,
    successRate: 100,
    errorRate: 0
  },
  completeAnalytics: [
    {
      category: "Bro mujhe nahi pata 🤷‍♂️",
      totalRequests: 15,
      successCount: 15,
      errorCount: 0,
      avgProcessingTime: 0,
      uniqueUserCount: 5
    },
    {
      category: "Miss fancy-pants 👀",
      totalRequests: 8,
      successCount: 8,
      errorCount: 0,
      avgProcessingTime: 0,
      uniqueUserCount: 3
    },
    {
      category: "Beauty queen ✨",
      totalRequests: 12,
      successCount: 12,
      errorCount: 0,
      avgProcessingTime: 0,
      uniqueUserCount: 4
    },
    {
      category: "Home decor obsessed 🪴",
      totalRequests: 10,
      successCount: 10,
      errorCount: 0,
      avgProcessingTime: 1,
      uniqueUserCount: 2
    },
    {
      category: "Changes outfit many times👗",
      totalRequests: 25,
      successCount: 25,
      errorCount: 0,
      avgProcessingTime: 1,
      uniqueUserCount: 8
    }
  ],
  userAnalytics: {
    userRequests: [
      {
        _id: "688c99f2b7b0d7ac024e191f",
        userId: "919015190754",
        category: "Home decor obsessed 🪴",
        resStatus: 200,
        resType: "Success",
        userAgent: "axios/1.7.7",
        processingTime: 1,
        timeStamp: "2025-08-01T10:41:54.241Z",
        ipAddress: "35.154.183.225"
      },
      {
        _id: "688c998764b54728e39b6f15",
        userId: "919015190754",
        category: "Beauty queen ✨",
        resStatus: 200,
        resType: "Success",
        userAgent: "axios/1.7.7",
        processingTime: 0,
        timeStamp: "2025-08-01T10:40:07.591Z",
        ipAddress: "35.154.183.225"
      },
      {
        _id: "688c85a5454725e2e5d035ad",
        userId: "919015190754",
        category: "Bro mujhe nahi pata 🤷‍♂️",
        resStatus: 200,
        resType: "Success",
        userAgent: "axios/1.7.7",
        processingTime: 0,
        timeStamp: "2025-08-01T09:15:17.656Z",
        ipAddress: "35.154.183.225"
      }
    ],
    summary: {
      totalRequests: 5,
      successCount: 5,
      systemErrorCount: 0,
      lastRequest: "2025-08-01T10:41:54.241Z",
      firstRequest: "2025-08-01T08:54:25.540Z",
      categoriesUsed: ["Home decor obsessed 🪴", "Changes outfit many times👗", "Beauty queen ✨", "Bro mujhe nahi pata 🤷‍♂️"],
      avgProcessingTime: 0.4,
      categoryCount: 4,
      successRate: 100,
      mostUsedCategory: "Beauty queen ✨"
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 5,
      pages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  },
  smartLinks: [
    {
      _id: "688a2484630120ee66b2ca2a",
      name: "testing smartlink",
      short_id: "peBNEkeW",
      redirect_link: "https://www.smart-qrcodes.com",
      totalClicks: 2186,
      isActive: true,
      clickRate: 1093,
      age: 167891994,
      isExpired: false,
      lastClickedAt: "2025-07-30T14:05:13.081Z",
      createdAt: "2025-07-30T13:56:20.872Z"
    },
    {
      _id: "688a1eb76a44244fb774630b",
      name: "Kids wear",
      short_id: "C4EbCFMa",
      redirect_link: "https://www.myntra.com/kids",
      totalClicks: 6,
      isActive: true,
      clickRate: 3,
      age: 169377725,
      isExpired: false,
      lastClickedAt: "2025-08-01T09:32:48.907Z",
      createdAt: "2025-07-30T13:31:35.141Z"
    }
  ],
  qrAnalytics: {
    qr_url: "https://wa.me/message/SBRN26B4QZJSH1",
    qr_name: "M-NOW",
    qr_short_id: "aMcznnKd",
    qr_scan_count: 5,
    qr_type: "dynamic",
    analytics: {
      deviceBreakdown: {
        mobile: 4,
        tablet: 0,
        desktop: 0
      },
      browserBreakdown: {
        chrome: 3,
        firefox: 0,
        safari: 0,
        edge: 0,
        other: 2
      },
      osBreakdown: {
        windows: 1,
        macos: 0,
        linux: 0,
        ios: 3,
        android: 1,
        other: 0
      },
      timeStats: {
        hourlyScans: {
          "5": 1,
          "6": 1,
          "7": 1,
          "8": 1,
          "12": 1
        },
        dailyScans: {
          "2025-07-31": 2,
          "2025-08-01": 3
        },
        monthlyScans: {
          "2025-07": 2,
          "2025-08": 3
        }
      },
      peakScanDay: {},
      locationBreakdown: {
        "Unknown": 5
      },
      averageDailyScans: 2.5,
      firstScan: "2025-07-31T06:45:31.121Z",
      lastScan: "2025-08-01T12:00:18.417Z"
    }
  }
};

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
    smartLinks: null,
    qrAnalytics: null,
  });

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string | null }>({});

  const fetchData = useCallback(async (endpoint: string, key: keyof ApiData, method = 'GET', requestBody?: any) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: null }));

    try {
      // First try to fetch from API
      let response;
      try {
        response = await axiosInstance({
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

      } catch (apiError: any) {
        // If API fails (CORS, network, etc.), use mock data
        console.warn(`API fetch failed for ${key}, using mock data:`, apiError.message);
        
        // Use mock data as fallback
        const mockValue = mockData[key as keyof typeof mockData];
        if (mockValue) {
          setData(prev => ({ ...prev, [key]: mockValue }));
          console.log(`Using mock data for ${key}:`, mockValue);
        } else {
          throw new Error(`No mock data available for ${key}`);
        }
      }

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