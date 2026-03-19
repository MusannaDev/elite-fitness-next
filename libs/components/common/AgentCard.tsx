import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';

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
	followMemberHandler: any;
	colorIndex?: number;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler, followMemberHandler, colorIndex = 0 } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const color = HEX_COLORS[colorIndex % HEX_COLORS.length];

	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent.memberImage}`
		: '';

	const initials = agent?.memberFullName
		? agent.memberFullName
				.split(' ')
				.map((w: string) => w[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: (agent?.memberNick || 'AG').slice(0, 2).toUpperCase();

	const isFollowing = agent?.meFollowed && agent.meFollowed[0]?.myFollowing;
	const isLiked = agent?.meLiked && agent.meLiked[0]?.myFavorite;

	// default background: rasm bo'lsa rasm, bo'lmasa rang
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
				<button
					className={`follow-btn ${isFollowing ? 'following' : ''}`}
					onClick={() => followMemberHandler(user, agent?._id)}
					style={
						isFollowing
							? {
									background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #4f46e5 100%)',
									border: 'none',
									color: '#fff',
									boxShadow: '0 0 16px rgba(139, 92, 246, 0.55), 0 0 32px rgba(99, 102, 241, 0.3)',
							  }
							: { borderColor: color.bg }
					}
				>
					{isFollowing ? (
						<>
							<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<path d="M2 8l4 4 8-8" />
							</svg>
							Followed · {agent?.memberFollowings ?? 0}
						</>
					) : (
						<>+ Follow · {agent?.memberFollowings ?? 0}</>
					)}
				</button>

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
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={isFollowing ? '#7c3aed' : 'currentColor'} strokeWidth="1.5">
						<circle cx="6" cy="5" r="3" />
						<path d="M1 13c0-2.8 2.2-5 5-5" strokeLinecap="round" />
						<path d="M12 9v4M10 11h4" strokeLinecap="round" />
					</svg>
					<span className="icon-count">{agent?.memberFollowings ?? 0}</span>
				</button>
			</div>
		</div>
	);
};

export default AgentCard;