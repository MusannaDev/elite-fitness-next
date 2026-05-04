import type { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';
import https from 'https';

export const config = {
	api: {
		bodyParser: false,
	},
};

const targetUrl = process.env.REACT_APP_API_GRAPHQL_INTERNAL_URL || 'http://host.docker.internal:4001/graphql';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const target = new URL(targetUrl);
	const transport = target.protocol === 'https:' ? https : http;
	const headers = { ...req.headers };

	delete headers.host;
	delete headers.connection;

	const proxyReq = transport.request(
		{
			protocol: target.protocol,
			hostname: target.hostname,
			port: target.port,
			path: `${target.pathname}${target.search}`,
			method: req.method,
			headers,
		},
		(proxyRes) => {
			res.statusCode = proxyRes.statusCode || 502;

			Object.entries(proxyRes.headers).forEach(([key, value]) => {
				if (value !== undefined) res.setHeader(key, value);
			});

			proxyRes.pipe(res);
		},
	);

	proxyReq.on('error', (error) => {
		console.error('GraphQL proxy error:', error);
		if (!res.headersSent) res.status(502).json({ message: 'GraphQL proxy error' });
	});

	req.pipe(proxyReq);
}
