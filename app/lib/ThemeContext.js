import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
  pink: {
    name: 'Light Pink',
    bgGradient: ['#fff0f3', '#ffe4e8', '#ffffff'],
    cardBg: '#ffffff',
    textMain: '#2d1b2e',
    textMuted: '#8b5a6b',
    primary: '#ff6b8a',
    primaryLight: '#ffb3c1',
    primaryMuted: '#fff0f3',
    statBarBg: '#ffe4e8',
  },
  purple: {
    name: 'Dark Purple',
    bgGradient: ['#0a0a0f', '#13131a', '#1e1b4b'],
    cardBg: '#2d1b2e',
    textMain: '#f3e8ff',
    textMuted: '#c084fc',
    primary: '#e94560',
    primaryLight: '#ff6b8a',
    primaryMuted: '#3b0764',
    statBarBg: '#1e1b4b',
  },
  blue: {
    name: 'Ocean Blue',
    bgGradient: ['#e0f2fe', '#bae6fd', '#ffffff'],
    cardBg: '#ffffff',
    textMain: '#0f172a',
    textMuted: '#475569',
    primary: '#0ea5e9',
    primaryLight: '#7dd3fc',
    primaryMuted: '#f0f9ff',
    statBarBg: '#e0f2fe',
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('pink');

  useEffect(() => {
    AsyncStorage.getItem('pet_theme').then((savedTheme) => {
      if (savedTheme && themes[savedTheme]) {
        setThemeName(savedTheme);
      }
    });
  }, []);

  const changeTheme = async (name) => {
    if (themes[name]) {
      setThemeName(name);
      await AsyncStorage.setItem('pet_theme', name);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme: themes[themeName], changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
