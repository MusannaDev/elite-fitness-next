import type { NextApiRequest, NextApiResponse } from 'next';

interface ChatHistoryItem {
	role: 'user' | 'assistant';
	content: string;
}

interface ChatRequestBody {
	message?: string;
	route?: string;
	path?: string;
	onlineUsers?: number;
	history?: ChatHistoryItem[];
}

interface ChatResponseBody {
	reply: string;
	source: 'openai' | 'fallback';
}

interface OpenAIResponseContentItem {
	text?: string;
}

interface OpenAIResponseOutputItem {
	content?: OpenAIResponseContentItem[];
}

interface OpenAIResponsePayload {
	output_text?: string;
	output?: OpenAIResponseOutputItem[];
}

const buildPageContext = (route?: string, path?: string): string => {
	const value = `${route ?? ''} ${path ?? ''}`.toLowerCase();

	if (value.includes('/property')) {
		return 'Property pages include listing cards and detail sections with room, bath, size, location, and deal type information.';
	}
	if (value.includes('/product')) {
		return 'Product pages include nutrition or product details, stock info, and message/review sections.';
	}
	if (value.includes('/equipment')) {
		return 'Equipment pages include equipment specifications, category tags, stock info, and related equipment.';
	}
	if (value.includes('/clothes')) {
		return 'Clothes pages include material, size, color details, inventory, and related clothing cards.';
	}
	if (value.includes('/trainer')) {
		return 'Trainer pages show trainer profile details, expertise, reviews, and direct message options.';
	}
	if (value.includes('/agent')) {
		return 'Agent pages show profile, listings, contact options, and related market activity.';
	}
	if (value.includes('/sales-manager')) {
		return 'Sales manager pages show profile, sales support role, contact options, and related cards.';
	}
	if (value.includes('/member')) {
		return 'Member pages show profile stats, posts, listed items, and activity sections.';
	}
	if (value.includes('/order')) {
		return 'Order pages include shipping, confirmation status, and purchase workflow data.';
	}

	return 'This is an Elite Fitness marketplace page with listing, detail, review, and contact workflows.';
};

const buildFallbackReply = (message: string, onlineUsers: number): string => {
	const normalized = message.toLowerCase();

	if (/(sales\s*manager|salesmanager|sales managers?)/.test(normalized)) {
		return 'Sales managers handle lead follow-up, pricing guidance, negotiation support, and closing coordination.';
	}
	if (/(trainer|coach|instructor)/.test(normalized)) {
		return 'Trainers build workout plans, monitor progress, and guide users based on goals and fitness level.';
	}
	if (/(order|buy|purchase|checkout|cart)/.test(normalized)) {
		return 'To order an item, open its detail page, confirm details and availability, then proceed through checkout.';
	}
	if (/(property|product|equipment|clothe|clothing)/.test(normalized)) {
		return 'Open the relevant detail page, review specification cards, then use Send Message for direct communication.';
	}

	return `I can help with any page or item. There are currently ${onlineUsers} users online. Ask your exact goal and I will provide step-by-step guidance.`;
};

const extractOutputText = (payload: OpenAIResponsePayload): string => {
	if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
		return payload.output_text.trim();
	}

	if (Array.isArray(payload.output)) {
		const chunks = payload.output
			.flatMap((item) => (Array.isArray(item.content) ? item.content : []))
			.map((content) => (typeof content.text === 'string' ? content.text.trim() : ''))
			.filter(Boolean);

		if (chunks.length > 0) {
			return chunks.join('\n').trim();
		}
	}

	return '';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponseBody | { error: string }>) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	let rawBody: ChatRequestBody = {};
	try {
		rawBody = typeof req.body === 'string' ? (JSON.parse(req.body) as ChatRequestBody) : ((req.body ?? {}) as ChatRequestBody);
	} catch (error) {
		return res.status(400).json({ error: 'Invalid request body' });
	}

	const message = typeof rawBody.message === 'string' ? rawBody.message.trim() : '';
	const route = typeof rawBody.route === 'string' ? rawBody.route : '';
	const path = typeof rawBody.path === 'string' ? rawBody.path : '';
	const onlineUsers = typeof rawBody.onlineUsers === 'number' ? rawBody.onlineUsers : 0;
	const history = Array.isArray(rawBody.history)
		? rawBody.history
				.filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
				.slice(-12)
		: [];

	if (!message) {
		return res.status(400).json({ error: 'Message is required' });
	}

	const fallbackReply = buildFallbackReply(message, onlineUsers);
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return res.status(200).json({ reply: fallbackReply, source: 'fallback' });
	}

	const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
	const pageContext = buildPageContext(route, path);
	const historyText = history.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join('\n');

	const systemPrompt =
		'You are Elite Smart Chat, an assistant for the Elite Fitness marketplace. ' +
		'Always reply in English. Be accurate, concise, and action-oriented. ' +
		'You can help with property, product, equipment, clothes, trainer, agent, sales manager, member, and order pages. ' +
		'Do not invent exact prices, stock counts, or personal data unless provided in the user message/context. ' +
		'When exact live data is unknown, explain where in the UI the user can verify it.';

	const userPrompt =
		`Current route: ${route || 'unknown'}\n` +
		`Current path: ${path || 'unknown'}\n` +
		`Page context: ${pageContext}\n` +
		`Online users: ${onlineUsers}\n` +
		`Recent chat history:\n${historyText || 'No history'}\n\n` +
		`User question: ${message}\n\n` +
		'Give a practical answer for this platform in 2-5 sentences.';

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 7000);

		const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				temperature: 0.3,
				max_output_tokens: 260,
				input: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
			}),
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

		if (!openAiResponse.ok) {
			return res.status(200).json({ reply: fallbackReply, source: 'fallback' });
		}

		const payload = (await openAiResponse.json()) as OpenAIResponsePayload;
		const aiReply = extractOutputText(payload);
		if (!aiReply) {
			return res.status(200).json({ reply: fallbackReply, source: 'fallback' });
		}

		return res.status(200).json({ reply: aiReply, source: 'openai' });
	} catch (error) {
		console.error('chat-assistant error:', error);
		return res.status(200).json({ reply: fallbackReply, source: 'fallback' });
	}
}
