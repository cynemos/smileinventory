import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Sun, Moon, User, LogOut, HelpCircle } from 'lucide-react';
import { signOut } from '../lib/supabase';
import { fetchLowStockProducts } from '../store/slices/alertsSlice';
import type { AppDispatch, RootState } from '../store';
import { Link } from 'react-router-dom';

function Header() {
  const [isDark, setIsDark] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { lowStockProducts } = useSelector((state: RootState) => state.alerts);

  useEffect(() => {
    dispatch(fetchLowStockProducts());
    
    // Rafraîchir les alertes toutes les 5 minutes
    const interval = setInterval(() => {
      dispatch(fetchLowStockProducts());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center">
              <svg
                className="h-8 w-8 text-primary-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 0 1 10 10c0 4.42-2.87 8.17-6.84 9.5a2 2 0 0 1-2.32 0C8.87 20.17 6 16.42 6 12A10 10 0 0 1 12 2z" />
                <path d="M12 6v12" />
                <path d="M8 10h8" />
              </svg>
              <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">Gestion de stock - Cabinet Dentaire</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to="/alerts"
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <Bell className="h-5 w-5" />
              {lowStockProducts.length > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </Link>
            <div className="relative">
              <button
                type="button"
                className="flex items-center rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <User className="h-6 w-6" />
              </button>
            </div>
            <Link
              to="/help"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
