import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useMemo } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { ThemeModeProvider } from '../libs/contexts/ThemeModeContext';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);
	// @ts-ignore
	const theme = useMemo(() => createTheme(light), []);

	return (
		<ApolloProvider client={client}>
			<ThemeModeProvider>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Component {...pageProps} />
				</ThemeProvider>
			</ThemeModeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
