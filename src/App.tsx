import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import ComprehensiveAnalytics from './components/ComprehensiveAnalytics';
import UserAnalytics from './components/UserAnalytics';
import QRSmartLinksPerformance from './components/QRSmartLinksPerformance';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/shared/ErrorBoundary';
import OfflineIndicator from './components/shared/OfflineIndicator';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ApiProvider } from './context/ApiContext';
import './App.css';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState('executive');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const screens = [
    { id: 'executive', name: 'Executive Dashboard', component: ExecutiveDashboard },
    { id: 'analytics', name: 'Analytics', component: ComprehensiveAnalytics },
    { id: 'users', name: 'User Analytics', component: UserAnalytics },
    { id: 'performance', name: 'QR & Smart Links', component: QRSmartLinksPerformance },
  ];

  const ActiveComponent = screens.find(screen => screen.id === activeScreen)?.component || ExecutiveDashboard;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close mobile menu
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      
      // Ctrl/Cmd + 1-4 for quick navigation
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        const numbers = ['1', '2', '3', '4'];
        const index = numbers.indexOf(event.key);
        if (index !== -1) {
          event.preventDefault();
          setActiveScreen(screens[index].id);
          setIsMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, screens]);

  // Auto-save theme preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Offline Indicator */}
        <OfflineIndicator />
        
        {/* Enhanced Header */}
        <header className={`sticky top-0 z-50 transition-colors duration-200 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b backdrop-blur-sm bg-opacity-95`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`md:hidden p-2 rounded-md transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                
                <div className="ml-2 md:ml-0">
                  <h1 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Analytics Dashboard
                  </h1>
                  <div className={`hidden sm:block text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Real-time insights • {screens.find(s => s.id === activeScreen)?.name}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Quick Navigation Hint */}
                <div className={`hidden lg:flex items-center text-xs ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    ⌘1-4
                  </kbd>
                  <span className="ml-1">Quick nav</span>
                </div>
                
                {/* System Status Indicator */}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" 
                       title="System operational"></div>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Live
                  </span>
                </div>
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation Breadcrumb */}
          <div className={`md:hidden px-4 pb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="text-xs">
              {screens.find(s => s.id === activeScreen)?.name}
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Enhanced Sidebar Navigation */}
          <Navigation
            screens={screens}
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          {/* Main Content with Error Boundary */}
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <ErrorBoundary
                  fallback={
                    <div className="text-center py-12">
                      <div className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Unable to load this section
                      </div>
                      <p className={`text-sm mb-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        There was an error loading the {screens.find(s => s.id === activeScreen)?.name} section.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Reload Page
                      </button>
                    </div>
                  }
                >
                  <ActiveComponent />
                </ErrorBoundary>
              </div>
            </div>
            
            {/* Footer */}
            <footer className={`mt-12 border-t py-6 ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Analytics Dashboard v2.0.0 • Last updated: {new Date().toLocaleDateString()}
                  </div>
                  <div className={`mt-2 sm:mt-0 text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <span>Powered by React & TypeScript</span>
                    <span className="mx-2">•</span>
                    <button 
                      onClick={() => {
                        if ('serviceWorker' in navigator) {
                          navigator.serviceWorker.ready.then(registration => {
                            registration.unregister();
                          });
                        }
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                      className="hover:underline"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </main>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Global Loading Indicator */}
        <div id="global-loading" className="hidden">
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Loading...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Monitor (Development) */}
        {(
          <div className="fixed bottom-4 right-4 z-40">
            <div className={`px-3 py-2 rounded-lg text-xs ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                : 'bg-white text-gray-700 border border-gray-200'
            } shadow-lg`}>
              <div>Render: {performance.now().toFixed(0)}ms</div>
              <div>Theme: {theme}</div>
              <div>Screen: {activeScreen}</div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;