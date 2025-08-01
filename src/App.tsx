import  { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import ComprehensiveAnalytics from './components/ComprehensiveAnalytics';
import UserAnalytics from './components/UserAnalytics';
import QRSmartLinksPerformance from './components/QRSmartLinksPerformance';
import Navigation from './components/Navigation';
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-200`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className={`text-xl font-bold ml-2 md:ml-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Analytics Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <Navigation
          screens={screens}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}

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