import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
	isDark: boolean;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
	isDark: true,
	toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem('elite-theme');
		const dark = saved !== null ? saved === 'dark' : false;
		setIsDark(dark);
		document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	}, []);

	const toggleTheme = () => {
		const next = !isDark;
		setIsDark(next);
		localStorage.setItem('elite-theme', next ? 'dark' : 'light');
		document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
	};

	return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
