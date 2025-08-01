import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Pause } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface RealTimeRefreshProps {
  onRefresh: () => Promise<void>;
  interval?: number;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

const RealTimeRefresh: React.FC<RealTimeRefreshProps> = ({
  onRefresh,
  interval = 30000,
  isEnabled = true,
  onToggle
}) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(interval / 1000);
  const [isActive, setIsActive] = useState(isEnabled);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onRefresh();
            return interval / 1000;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, interval, onRefresh]);

  const toggleAutoRefresh = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
    if (newState) {
      setTimeLeft(interval / 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleAutoRefresh}
        className={`p-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
        title={isActive ? 'Disable auto-refresh' : 'Enable auto-refresh'}
      >
        {isActive ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>
      
      <div className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {isActive ? formatTime(timeLeft) : 'Paused'}
      </div>
    </div>
  );
};

export default RealTimeRefresh;