import React from 'react';
import { BarChart3, Users, TrendingUp, QrCode } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Screen {
  id: string;
  name: string;
  component: React.ComponentType;
}

interface NavigationProps {
  screens: Screen[];
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const iconMap = {
  executive: BarChart3,
  analytics: TrendingUp,
  users: Users,
  performance: QrCode,
};

const Navigation: React.FC<NavigationProps> = ({
  screens,
  activeScreen,
  setActiveScreen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { theme } = useTheme();

  const handleScreenChange = (screenId: string) => {
    setActiveScreen(screenId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed md:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border-r
        `}
        style={{ top: '4rem' }}
      >
        <div className="flex flex-col h-full pt-6">
          <div className="flex-1 px-4 space-y-2">
            {screens.map((screen) => {
              const Icon = iconMap[screen.id as keyof typeof iconMap] || BarChart3;
              const isActive = activeScreen === screen.id;
              
              return (
                <button
                  key={screen.id}
                  onClick={() => handleScreenChange(screen.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{screen.name}</span>
                </button>
              );
            })}
          </div>
          
          <div className={`px-4 py-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Version 1.0.0
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;