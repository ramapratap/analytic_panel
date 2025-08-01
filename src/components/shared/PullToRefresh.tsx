import React, { useState, useRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children, 
  threshold = 80 
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current && window.scrollY === 0 && !isRefreshing) {
      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
        setIsPulling(distance > threshold);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
    startY.current = 0;
    currentY.current = 0;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {(pullDistance > 0 || isRefreshing) && (
        <div className="flex justify-center py-4 text-blue-500">
          <div className={`transform transition-transform duration-200 ${
            isPulling || isRefreshing ? 'rotate-180' : ''
          }`}>
            <ChevronDown 
              className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;