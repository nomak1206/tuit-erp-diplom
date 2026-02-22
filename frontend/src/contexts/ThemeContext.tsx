import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeContextProps {
    themeMode: ThemeType;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<ThemeType>('dark');

    useEffect(() => {
        // Load theme from local storage
        const savedTheme = localStorage.getItem('erp-theme') as ThemeType;
        if (savedTheme) {
            setThemeMode(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        setThemeMode((prev) => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('erp-theme', newTheme);
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
