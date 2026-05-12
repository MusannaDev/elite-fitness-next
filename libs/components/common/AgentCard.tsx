import React, { useState, useEffect, useCallback, useRef } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Messages } from '../../config';

const LS_KEY = (userId: string) => `agent_follows_${userId}`;

const getLocalFollow = (userId: string, agentId: string): boolean => {
	if (!userId || !agentId || typeof window === 'undefined') return false;
	try {
		const stored = JSON.parse(localStorage.getItem(LS_KEY(userId)) || '{}');
		return stored[agentId] === true;
	} catch {
		return false;
	}
};

const setLocalFollow = (userId: string, agentId: string, following: boolean) => {
	if (!userId || !agentId || typeof window === 'undefined') return;
	try {
		const stored = JSON.parse(localStorage.getItem(LS_KEY(userId)) || '{}');
		if (following) {
			stored[agentId] = true;
		} else {
			delete stored[agentId];
		}
		localStorage.setItem(LS_KEY(userId), JSON.stringify(stored));
	} catch {}
};

const HEX_COLORS = [
	{ bg: '#7F77DD' },
	{ bg: '#1D9E75' },
	{ bg: '#D85A30' },
	{ bg: '#D4537E' },
	{ bg: '#378ADD' },
	{ bg: '#BA7517' },
];

const W = 282;
const H = 326;

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
	followMemberHandler?: any;
	colorIndex?: number;
	refetch?: () => void;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler, colorIndex = 0, refetch } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const color = HEX_COLORS[colorIndex % HEX_COLORS.length];

	const imagePath: string = agent?.memberImage
		? `${NEXT_PUBLIC_API_URL}/${agent.memberImage}`
		: '';

	const initials = agent?.memberFullName
		? agent.memberFullName
				.split(' ')
				.map((w: string) => w[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: (agent?.memberNick || 'AG').slice(0, 2).toUpperCase();

	const serverFollowing = !!(agent?.meFollowed && agent.meFollowed[0]?.myFollowing);
	const [isFollowing, setIsFollowing] = useState<boolean>(
		serverFollowing || getLocalFollow(user?._id, agent?._id),
	);
	const [localFollowers, setLocalFollowers] = useState<number>(agent?.memberFollowers || 0);
	const isLiked = agent?.meLiked && agent.meLiked[0]?.myFavorite;

	const followInteracted = useRef(false);

	useEffect(() => {
		if (followInteracted.current) return;
		const fromServer = !!(agent?.meFollowed && agent.meFollowed[0]?.myFollowing);
		const fromLocal = getLocalFollow(user?._id, agent?._id);
		setIsFollowing(fromServer || fromLocal);
		setLocalFollowers(agent?.memberFollowers || 0);
	}, [agent?.meFollowed, agent?.memberFollowers, user?._id]);

	/** APOLLO **/
	const [followMember] = useMutation(SUBSCRIBE);
	const [unfollowMember] = useMutation(UNSUBSCRIBE);

	const followHandler = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!user._id) {
				sweetMixinErrorAlert(Messages.error2).then();
				return;
			}
			followInteracted.current = true;
			const wasFollowing = isFollowing;
			setIsFollowing(!wasFollowing);
			setLocalFollowers((prev) => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));
			try {
				if (wasFollowing) {
					await unfollowMember({ variables: { input: agent?._id } });
				} else {
					await followMember({ variables: { input: agent?._id } });
				}
				setLocalFollow(user._id, agent?._id, !wasFollowing);
				if (refetch) refetch();
			} catch (err: any) {
				// rollback
				setIsFollowing(wasFollowing);
				setLocalFollowers((prev) => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
				sweetMixinErrorAlert(err.message).then();
			}
		},
		[isFollowing, agent?._id, user, followMember, unfollowMember, refetch],
	);

	// Default background: use image if available, otherwise fallback color
	const hexBg = imagePath
		? `url(${imagePath}) center/cover no-repeat`
		: color.bg;

	if (device === 'mobile') {
		return (
			<div className="agent-card-mobile">
				<strong>{agent?.memberFullName ?? agent?.memberNick}</strong>
			</div>
		);
	}

	return (
		<div
			className="agent-hex-wrap"
			style={{ width: W, minWidth: W, maxWidth: W, flexShrink: 0 }}
		>
			<Link
				href={{ pathname: '/agent/detail', query: { agentId: agent?._id } }}
				className="agent-hex-outer"
				style={{ display: 'block', width: W, height: H, flexShrink: 0 }}
			>
				<div
					className="agent-hex-shape"
					style={{
						width: W,
						height: H,
						background: hexBg,
						clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
					}}
				>
					{/* Hover da ko'rinadigan overlay */}
					<div className="hex-overlay">
						<div className="hex-avatar">
							{imagePath ? (
								<img src={imagePath} alt={initials} className="hex-avatar__img" />
							) : (
								<svg width="40" height="40" viewBox="0 0 24 24" fill="none">
									<circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.9)" />
									<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" />
								</svg>
							)}
						</div>
						<span className="hex-name">{agent?.memberFullName ?? agent?.memberNick}</span>
						<span className="hex-role">Agent</span>
						<div className="hex-stats">
							<span className="hex-stat">
								<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
									<circle cx="8" cy="8" r="2" />
								</svg>
								{agent?.memberViews ?? 0}
							</span>
							<span className="hex-stat">
								<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3.1 2 5 2c1.1 0 2.1.5 2.8 1.3L8 4l.2-.7C8.9 2.5 9.9 2 11 2c1.9 0 3.5 1.6 3.5 3.5 0 4-6.5 8-6.5 8z" strokeLinecap="round" />
								</svg>
								{agent?.memberLikes ?? 0}
							</span>
						</div>
						<span className="hex-props">{agent?.memberProperties ?? 0} ta mulk</span>
					</div>
				</div>
			</Link>

			<div className="hex-actions" style={{ width: W }}>
				{user?._id !== agent?._id && (
					<button
						className={`follow-btn ${isFollowing ? 'following' : ''}`}
						onClick={followHandler}
					>
						{isFollowing ? (
							<>
								<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
									<path d="M2 8l4 4 8-8" />
								</svg>
								Unfollow · {localFollowers}
							</>
						) : (
							<>+ Follow · {localFollowers}</>
						)}
					</button>
				)}

				<button
					className={`like-icon-btn ${isLiked ? 'liked' : ''}`}
					onClick={() => likeMemberHandler(user, agent?._id)}
				>
					<svg width="14" height="14" viewBox="0 0 16 16" fill={isLiked ? '#D4537E' : 'none'} stroke={isLiked ? '#D4537E' : 'currentColor'} strokeWidth="1.5">
						<path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3.1 2 5 2c1.1 0 2.1.5 2.8 1.3L8 4l.2-.7C8.9 2.5 9.9 2 11 2c1.9 0 3.5 1.6 3.5 3.5 0 4-6.5 8-6.5 8z" strokeLinecap="round" />
					</svg>
					<span className="icon-count">{agent?.memberLikes ?? 0}</span>
				</button>

				<button className={`follow-icon-btn ${isFollowing ? 'following' : ''}`}>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
						<circle cx="6" cy="5" r="3" />
						<path d="M1 13c0-2.8 2.2-5 5-5" strokeLinecap="round" />
						<path d="M12 9v4M10 11h4" strokeLinecap="round" />
					</svg>
					<span className="icon-count">{localFollowers}</span>
				</button>
			</div>
		</div>
	);
};

export default AgentCard;
