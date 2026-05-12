import React, { MouseEvent, useEffect, useState } from 'react';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { GET_AGENTS } from '../../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Direction, Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sortByEngagement } from '../../utils/ranking';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [topAgents, setTopAgents] = useState<Member[]>([]);
	const [selectedAgentId, setSelectedAgentId] = useState<string>('');
	const topAgentsInput: AgentsInquiry = {
		...initialInput,
		sort: 'memberLikes',
		direction: Direction.DESC,
	};

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { refetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: topAgentsInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(
				sortByEngagement(
					data?.getAgents?.list ?? [],
					(agent: Member) => ({
						likes: agent.memberLikes,
						views: agent.memberViews,
						comments: agent.memberComments,
						rank: agent.memberRank,
					}),
					topAgentsInput.limit,
				),
			);
		},
	});
	const likeAgentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: topAgentsInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const followAgentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			const isFollowing = topAgents.find((a) => a._id === id)?.meFollowed?.[0]?.myFollowing;
			if (isFollowing) {
				await unsubscribe({ variables: { input: id } });
			} else {
				await subscribe({ variables: { input: id } });
			}
			await refetch({ input: topAgentsInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	useEffect(() => {
		if (!topAgents.length) {
			setSelectedAgentId('');
			return;
		}
		setSelectedAgentId((prev) => {
			const hasSelected = topAgents.some((agent) => agent._id === prev);
			return hasSelected ? prev : topAgents[0]._id;
		});
	}, [topAgents]);

	const goAgentDetail = (agentId?: string) => {
		if (!agentId) return;
		router.push({ pathname: '/agent/detail', query: { agentId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-agents">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">Elite Network</Typography>
						<Typography className="section-title">Top Agents</Typography>
					</Stack>
				</Stack>
				<Stack className="agents-list">
					{topAgents.map((agent) => {
						const agentImage = agent?.memberImage
							? `${NEXT_PUBLIC_API_URL}/${agent.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Box
								key={agent._id}
								className="mobile-agent-card"
								onClick={() => router.push({ pathname: '/member', query: { memberId: agent._id } })}
							>
								<Box className="mobile-agent-img" style={{ backgroundImage: `url(${agentImage})` }} />
								<Box className="mobile-agent-info">
									<Typography className="mobile-agent-role">FITNESS AGENT</Typography>
									<Typography className="mobile-agent-name">{agent.memberNick}</Typography>
								</Box>
							</Box>
						);
					})}
				</Stack>
			</Stack>
		);
	}

	const featuredAgent =
		topAgents.find((agent) => agent._id === selectedAgentId) ?? topAgents[0];
	const stackedAgents = topAgents
		.filter((agent) => agent._id !== featuredAgent?._id)
		.slice(0, 4);
	const featuredAgentImage = featuredAgent?.memberImage
		? `${NEXT_PUBLIC_API_URL}/${featuredAgent.memberImage}`
		: '/img/profile/defaultUser.svg';
	const featuredFollowing = !!featuredAgent?.meFollowed?.[0]?.myFollowing;
	const featuredLiked = !!featuredAgent?.meLiked?.[0]?.myFavorite;

	return (
		<Stack className="top-agents">
			<Stack className="container">
				{topAgents.length === 0 ? (
					<Box className="empty-list">
						<Typography>No top agents yet</Typography>
					</Box>
				) : (
					<Box className="agents-editorial-wrap">
						<Box className="agents-intro-panel" style={{ backgroundImage: `url(${featuredAgentImage})` }}>
							<Box className="agents-intro-overlay" />
							<Box className="agents-intro-content">
								<Typography className="intro-kicker">ELITE NETWORK</Typography>
								<Typography className="intro-title">Top Agents</Typography>
								<Typography className="intro-display">
									Trusted
									<br />
									Advisors.
								</Typography>
								<Typography className="intro-sub">
									Ranked by likes, views, and real member engagement to help users find trusted specialists fast.
								</Typography>

								<Box className="intro-featured">
									<Box className="featured-avatar" style={{ backgroundImage: `url(${featuredAgentImage})` }} />
									<Box className="featured-meta">
										<Typography
											className="featured-name clickable"
											onClick={() => goAgentDetail(featuredAgent?._id)}
										>
											{featuredAgent?.memberNick}
										</Typography>
										<Typography className="featured-rank">#{featuredAgent?.memberRank ?? '-'} Ranked Agent</Typography>
									</Box>
								</Box>

								<Stack className="intro-actions" direction="row" alignItems="center">
									<button
										type="button"
										className="intro-btn primary"
										onClick={() => goAgentDetail(featuredAgent?._id)}
										>
											View Profile {'->'}
										</button>
									{user?._id !== featuredAgent?._id && (
										<button
											type="button"
											className={`intro-btn secondary ${featuredFollowing ? 'following' : ''}`}
											onClick={() => followAgentHandler(user, featuredAgent?._id)}
										>
											{featuredFollowing ? 'Unfollow' : 'Follow'}
										</button>
									)}
									<IconButton
										className={`intro-like-btn ${featuredLiked ? 'liked' : ''}`}
										onClick={() => likeAgentHandler(user, featuredAgent?._id)}
									>
										<FavoriteIcon style={{ fontSize: 15 }} />
									</IconButton>
								</Stack>
							</Box>
						</Box>

						<Box className="agents-stack-panel">
							{stackedAgents.map((agent, index) => {
								const agentImage = agent?.memberImage
									? `${NEXT_PUBLIC_API_URL}/${agent.memberImage}`
									: '/img/profile/defaultUser.svg';
								const isFollowing = agent?.meFollowed?.[0]?.myFollowing;
								const isLiked = agent?.meLiked?.[0]?.myFavorite;

								return (
									<Box
										key={agent._id}
										className="stack-agent-card"
									>
										<span className="stack-rank">#{agent.memberRank ?? index + 2}</span>
										<Box
											className="stack-avatar"
											style={{ backgroundImage: `url(${agentImage})` }}
											onClick={() => setSelectedAgentId(agent._id)}
										/>
										<Box className="stack-meta">
											<Typography className="stack-role">FITNESS AGENT</Typography>
											<Typography
												className="stack-name clickable"
												onClick={() => goAgentDetail(agent._id)}
											>
												{agent.memberNick}
											</Typography>
											<Stack className="stack-stats" direction="row">
												<span>
													<RemoveRedEyeIcon style={{ fontSize: 12 }} />
													{agent.memberViews ?? 0}
												</span>
												<span>
													<FavoriteIcon style={{ fontSize: 12 }} />
													{agent.memberLikes ?? 0}
												</span>
												<span>
													<HomeWorkIcon style={{ fontSize: 12 }} />
													{agent.memberProperties ?? 0}
												</span>
											</Stack>
										</Box>
										<Stack
											className="stack-actions"
											direction="row"
											onClick={(e: React.MouseEvent<HTMLDivElement>) => {
												e.stopPropagation();
											}}
										>
											<IconButton
												className={`stack-icon-btn ${isFollowing ? 'following' : ''}`}
												onClick={(e: MouseEvent<HTMLButtonElement>) => {
													e.stopPropagation();
													followAgentHandler(user, agent._id);
												}}
											>
												{isFollowing ? (
													<PersonRemoveIcon style={{ fontSize: 14 }} />
												) : (
													<PersonAddIcon style={{ fontSize: 14 }} />
												)}
											</IconButton>
											<IconButton
												className={`stack-icon-btn ${isLiked ? 'liked' : ''}`}
												onClick={(e: MouseEvent<HTMLButtonElement>) => {
													e.stopPropagation();
													likeAgentHandler(user, agent._id);
												}}
											>
												<FavoriteIcon style={{ fontSize: 14 }} />
											</IconButton>
										</Stack>
									</Box>
								);
							})}
						</Box>
					</Box>
				)}

				{topAgents.length > 0 && (
					<Link href="/member?memberType=AGENT" className="agents-view-strip">
						<div>
							<strong>View All Agents</strong>
							<span>Complete ranked list of verified specialists</span>
						</div>
						<i>{'->'}</i>
					</Link>
				)}
			</Stack>
		</Stack>
	);
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'memberLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
