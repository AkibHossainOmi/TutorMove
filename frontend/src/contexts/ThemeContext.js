import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage or user preference
  useEffect(() => {
    const initializeTheme = () => {
      // First check localStorage for user-specific theme
      const userThemeKey = user?.id ? `theme_${user.id}` : 'theme_guest';
      const savedTheme = localStorage.getItem(userThemeKey);

      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Default to dark mode as per requirement
        setIsDarkMode(true);
      }
      setIsLoading(false);
    };

    initializeTheme();
  }, [user?.id]);

  // Apply theme to document
  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode, isLoading]);

  // Toggle theme and persist to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save per-user preference
    const userThemeKey = user?.id ? `theme_${user.id}` : 'theme_guest';
    localStorage.setItem(userThemeKey, newTheme ? 'dark' : 'light');
  };

  // Set specific theme
  const setTheme = (theme) => {
    const newIsDark = theme === 'dark';
    setIsDarkMode(newIsDark);

    const userThemeKey = user?.id ? `theme_${user.id}` : 'theme_guest';
    localStorage.setItem(userThemeKey, newIsDark ? 'dark' : 'light');
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
