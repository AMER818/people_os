import React, { useState, useEffect } from 'react';
import { secureStorage } from './utils/secureStorage';
import { RBACProvider } from '@/contexts/RBACContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import ModuleSkeleton from './components/ui/ModuleSkeleton';
import { useTheme } from './contexts/ThemeContext';
import { useUIStore } from './store/uiStore';

// Lazy Load Core Components
const Login = React.lazy(() => import('./modules/Login'));
const AuthenticatedApp = React.lazy(() => import('./AuthenticatedApp'));

const DATA_VERSION = '1.7';

// Immediate check before component initialization
if (typeof window !== 'undefined') {
  const savedVersion = secureStorage.getItem('data_version');
  if (savedVersion !== DATA_VERSION) {
    // Preserve authentication state during version updates
    const token = secureStorage.getItem('token');
    const email = secureStorage.getItem('user_email');

    secureStorage.clear(); // Ensure clean slate for application data

    // Re-secure
    if (token) {
      secureStorage.setItem('token', token);
    }
    if (email) {
      secureStorage.setItem('user_email', email);
    }

    secureStorage.setItem('data_version', DATA_VERSION);
    window.location.reload();
  }
}

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const { colorTheme, setActiveModule } = useUIStore();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!secureStorage.getItem('token');
  });

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Color Theme
  useEffect(() => {
    document.body.classList.remove('theme-quartz', 'theme-cyber', 'theme-forest', 'theme-sunset');
    document.body.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  // Listen for global logout events (from 401 interceptor)
  useEffect(() => {
    const handleGlobalLogout = () => {
      handleLogout();
    };
    window.addEventListener('auth:logout', handleGlobalLogout);
    return () => window.removeEventListener('auth:logout', handleGlobalLogout);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Data fetching is handled by AuthenticatedApp on mount
    // Small delay to ensure state propagation if needed, but likely fine strictly here
    setTimeout(() => {
      setActiveModule('dashboard');
    }, 100);
  };

  const handleLogout = () => {
    secureStorage.removeItem('token');
    secureStorage.removeItem('current_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <React.Suspense fallback={<ModuleSkeleton />}>
        <Login onLogin={handleLogin} />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<ModuleSkeleton />}>
      <AuthenticatedApp onLogout={handleLogout} />
    </React.Suspense>
  );
};

const App: React.FC = () => {
  return (
    <LayoutProvider>
      <RBACProvider>
        <AppContent />
      </RBACProvider>
    </LayoutProvider>
  );
};

export default App;
