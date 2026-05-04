import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'elite-theme-mode';

interface ThemeModeContextValue {
	themeMode: ThemeMode;
	setThemeMode: (mode: ThemeMode) => void;
	toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [themeMode, setThemeMode] = useState<ThemeMode>('light');

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const savedThemeMode = localStorage.getItem(THEME_STORAGE_KEY);
		if (savedThemeMode === 'dark' || savedThemeMode === 'light') {
			setThemeMode(savedThemeMode);
		}
	}, []);

	useEffect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-theme', themeMode);
		document.body.setAttribute('data-theme', themeMode);
		localStorage.setItem(THEME_STORAGE_KEY, themeMode);

		// Keep legacy page wrappers in sync even when a page is not wired to context classes.
		const rootIds = ['pc-wrap', 'mobile-wrap', 'community-list-page', 'community-detail-page'];
		rootIds.forEach((id) => {
			const element = document.getElementById(id);
			if (!element) return;
			element.classList.remove('light', 'dark');
			element.classList.add(themeMode);
		});
	}, [themeMode]);

	const value = useMemo<ThemeModeContextValue>(
		() => ({
			themeMode,
			setThemeMode,
			toggleThemeMode: () => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
		}),
		[themeMode],
	);

	return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => {
	const context = useContext(ThemeModeContext);
	if (!context) throw new Error('useThemeMode must be used within ThemeModeProvider');
	return context;
};
