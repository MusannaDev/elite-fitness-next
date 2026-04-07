import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';

interface MessagePayload {
	event: string;
	text: string;
	memberData?: Partial<Member> | null;
}
interface InfoPayload {
	event: string;
	totalClients: number;
	memberData?: Partial<Member> | null;
	action: string;
}
interface ChatHistoryItem {
	role: 'user' | 'assistant';
	content: string;
}

const AI_MEMBER_ID = 'elite-ai-assistant';
const AI_MEMBER: Partial<Member> = {
	_id: AI_MEMBER_ID,
	memberNick: 'Elite AI',
	memberImage: '',
};

const quickPrompts = ['Membership plans', 'Find a trainer', 'Technical support'];

const buildAiReply = (message: string, onlineUsers: number): string => {
	const normalized = message.toLowerCase().trim();
	const isQuestion = /\?/.test(normalized) || /^(what|how|why|where|when|who|which|can|do|does|is|are)\b/.test(normalized);

	const topicReplies: Array<{ pattern: RegExp; reply: string }> = [
		{
			pattern: /(hello|hi|hey)\b/,
			reply: 'Hello. Welcome to Elite Fitness chat. I can help with property, product, equipment, trainers, and account questions.',
		},
		{
			pattern: /(order|buy|purchase|cart|checkout)/,
			reply: 'To place an order, open the item detail page, review price and specs, then continue through checkout. You can also use filters to find the best match first.',
		},
		{
			pattern: /(price|cost|payment|subscription|membership)/,
			reply: 'For pricing, open Menu > Pricing. Compare plans by features and duration, then choose the one that matches your training goals and budget.',
		},
		{
			pattern: /(trainer|coach|instructor)/,
			reply: 'Trainers create workout plans, monitor progress, and adjust programs based on your goals. Use trainer filters by specialization, rating, and experience.',
		},
		{
			pattern: /(agent|agent detail)/,
			reply: 'Agents help with listings, client communication, and deal coordination. On Agent Detail pages, use Send Message to contact them directly.',
		},
		{
			pattern: /(sales\s*manager|salesmanager|salesmanagers|sales managers?)/,
			reply: 'Sales managers handle lead follow-up, pricing guidance, negotiation, and closing support. They help you choose the best offer and move the deal forward.',
		},
		{
			pattern: /(property|rent|barter|apartment|gym)/,
			reply: 'For property search, use filters like Rooms, Bath, Size, Location, and Rent/Barter tags. Then open Detail to compare specs and contact options.',
		},
		{
			pattern: /(product|equipment|clothe|clothing|gear)/,
			reply: 'Product and Equipment detail pages include key specs and stock info. Compare detail cards, then send a message to confirm availability before purchase.',
		},
		{
			pattern: /(review|rating|comment)/,
			reply: 'You can leave a review in the review section on each detail page. Keep feedback specific: quality, usability, and your overall experience.',
		},
		{
			pattern: /(support|technical|error|bug|issue|problem|help)/,
			reply: 'For technical support, check browser console and network requests first, then retry the action. If the issue continues, share the exact page and error text.',
		},
		{
			pattern: /(login|sign in|signup|sign up|register|account|password)/,
			reply: 'For account issues, verify your login credentials and session state first. If needed, reset your password and sign in again.',
		},
		{
			pattern: /(thanks|thank you)/,
			reply: 'You are welcome. Feel free to ask anything else.',
		},
	];

	const matched = topicReplies.find((topic) => topic.pattern.test(normalized));
	if (matched) return matched.reply;

	if (isQuestion) {
		return 'Great question. In this platform, the fastest path is: open the related detail page, review the info cards and tags, then use Send Message for direct action. I can also give a precise step-by-step answer for your exact goal.';
	}

	return `Message received. ${onlineUsers} users are online now. I can help with orders, pricing, trainers, sales managers, properties, products, and technical support.`;
};

const Chat = () => {
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [pendingAiReplies, setPendingAiReplies] = useState<number>(0);
	const isMountedRef = useRef<boolean>(true);
	const textInput = useRef<HTMLInputElement | null>(null);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const isAiTyping = pendingAiReplies > 0;
	const chatStatusText = useMemo(() => {
		if (isAiTyping) return 'AI is typing...';
		return 'Auto reply ON';
	}, [isAiTyping]);

	/** LIFECYCLE **/

	useEffect(() => {
		if (!socket) return;

		const handleSocketMessage = (msg: MessageEvent) => {
			let data: any = null;
			try {
				data = JSON.parse(msg.data);
			} catch (error) {
				console.warn('Invalid socket payload:', msg.data);
				return;
			}
			console.log('WebSocket message:', data);

			switch (data.event) {
				case 'info':
					const newInfo: InfoPayload = data;
					setOnlineUsers(newInfo.totalClients);
					break;
				case 'getMessages':
					const list: MessagePayload[] = data.list;
					setMessagesList((prev) => {
						const localAiMessages = prev.filter((item) => item.memberData?._id === AI_MEMBER_ID);
						return [...(list ?? []), ...localAiMessages];
					});
					break;
				case 'message':
					const newMessage: MessagePayload = data;
					setMessagesList((prev) => [...prev, newMessage]);
					break;
			}
		};

		socket.addEventListener('message', handleSocketMessage);
		return () => {
			socket.removeEventListener('message', handleSocketMessage);
		};
	}, [socket]);

	useEffect(() => {
		setOpen(false);
		setOpenButton(false);
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 120);
		return () => clearTimeout(timeoutId);
	}, [router.pathname]);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setMessageInput(text);
	}, []);

	const getMemberImage = useCallback((memberData?: Partial<Member> | null) => {
		const memberImage = memberData?.memberImage;
		if (!memberImage) return '/img/profile/defaultUser.svg';
		if (memberImage.startsWith('http')) return memberImage;
		return `${REACT_APP_API_URL}/${memberImage}`;
	}, []);

	const triggerAiReply = useCallback(
		async (userText: string) => {
			setPendingAiReplies((prev) => prev + 1);

			try {
				const delay = 520 + Math.round(Math.random() * 480);
				await new Promise((resolve) => setTimeout(resolve, delay));
				if (!isMountedRef.current) return;

				const history: ChatHistoryItem[] = messagesList
					.filter((entry) => {
						if (!entry.text?.trim()) return false;
						return entry.memberData?._id === user?._id || entry.memberData?._id === AI_MEMBER_ID;
					})
					.slice(-10)
					.map((entry) => ({
						role: entry.memberData?._id === user?._id ? 'user' : 'assistant',
						content: entry.text.trim(),
					}));

				let replyText = buildAiReply(userText, onlineUsers);

				try {
					const response = await fetch('/api/chat-assistant', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							message: userText,
							route: router.pathname,
							path: router.asPath,
							onlineUsers,
							history,
						}),
					});

					if (response.ok) {
						const data = await response.json();
						const responseText = typeof data?.reply === 'string' ? data.reply.trim() : '';
						if (responseText) replyText = responseText;
					}
				} catch (error) {
					console.warn('AI endpoint failed, using local fallback:', error);
				}

				if (!isMountedRef.current) return;

				setMessagesList((prev) => [
					...prev,
					{
						event: 'message',
						text: replyText,
						memberData: AI_MEMBER,
					},
				]);
			} finally {
				if (isMountedRef.current) {
					setPendingAiReplies((prev) => Math.max(0, prev - 1));
				}
			}
		},
		[messagesList, onlineUsers, router.asPath, router.pathname, user?._id],
	);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		try {
			if (e.key === 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const onClickHandler = () => {
		const trimmedMessage = messageInput.trim();
		if (!trimmedMessage) {
			sweetErrorAlert(Messages.error4);
			return;
		}

		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ event: 'message', data: trimmedMessage }));
		} else {
			setMessagesList((prev) => [
				...prev,
				{
					event: 'message',
					text: trimmedMessage,
					memberData: {
						_id: user?._id,
						memberNick: user?.memberNick,
						memberImage: user?.memberImage,
					},
				},
			]);
		}

		triggerAiReply(trimmedMessage);
		setMessageInput('');
	};

	const applyQuickPrompt = (prompt: string) => {
		setMessageInput(prompt);
		if (textInput.current) {
			textInput.current.focus();
		}
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat} aria-label={'Toggle chat'}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<Box className={'chat-top-main'} component={'div'}>
						<div className={'chat-brand-icon'}>
							<SmartToyRoundedIcon />
						</div>
						<div className={'chat-brand-copy'}>
							<strong>Elite Smart Chat</strong>
							<span>{onlineUsers} users online</span>
						</div>
					</Box>
					<div className={'chat-status-pill'}>
						<AutoAwesomeRoundedIcon />
						<span>{chatStatusText}</span>
					</div>
				</Box>

				<Box className={'chat-content'} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box className={'welcome-card'} component={'div'}>
								<div className={'welcome-title'}>How can I help?</div>
								<div className={'welcome-text'}>
									Type your message and the AI assistant will reply automatically.
								</div>
							</Box>

							{messagesList.map((ele: MessagePayload, index: number) => {
								const { text, memberData } = ele;
								const isOwnMessage = memberData?._id === user?._id;
								const isAiMessage = memberData?._id === AI_MEMBER_ID;

								return isOwnMessage ? (
									<Box
										key={`chat-own-${index}-${text}`}
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-right'}>{text}</div>
									</Box>
								) : (
									<Box
										key={`chat-left-${index}-${text}`}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										sx={{ m: '10px 0px' }}
										component={'div'}
									>
										{isAiMessage ? (
											<div className={'chat-ai-avatar'}>
												<SmartToyRoundedIcon />
											</div>
										) : (
											<Avatar alt={'chat-user'} src={getMemberImage(memberData)} />
										)}
										<div className={`msg-left ${isAiMessage ? 'ai' : ''}`}>{text}</div>
									</Box>
								);
							})}

							{isAiTyping ? (
								<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<div className={'chat-ai-avatar'}>
										<SmartToyRoundedIcon />
									</div>
									<div className={'typing-bubble'}>
										<span></span>
										<span></span>
										<span></span>
									</div>
								</Box>
							) : null}
						</Stack>
					</ScrollableFeed>
				</Box>

				<Box className={'chat-quick-actions'} component={'div'}>
					{quickPrompts.map((prompt) => (
						<button key={prompt} className={'quick-action'} onClick={() => applyQuickPrompt(prompt)}>
							{prompt}
						</button>
					))}
				</Box>

				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={textInput}
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type your message...'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler} aria-label={'Send message'}>
						<SendIcon />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
