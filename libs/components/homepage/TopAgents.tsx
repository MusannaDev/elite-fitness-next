import React, { MouseEvent, useState } from 'react';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { GET_AGENTS } from '../../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [topAgents, setTopAgents] = useState<Member[]>([]);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { refetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list);
		},
	});

	const likeAgentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: initialInput });
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
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-agents">
				<Stack className="agents-list">
					{topAgents.map((agent) => {
						const agentImage = agent?.memberImage
							? `${REACT_APP_API_URL}/${agent.memberImage}`
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

	return (
		<Stack className="top-agents">
			<Swiper
				effect="coverflow"
				grabCursor
				centeredSlides
				slidesPerView={3}
				loop
				speed={600}
				coverflowEffect={{ rotate: 30, stretch: 0, depth: 120, modifier: 1, slideShadows: true }}
				pagination={{ clickable: true }}
				navigation
				modules={[EffectCoverflow, Pagination, Navigation]}
				className="agents-swiper"
			>
				{topAgents.map((agent) => {
					const agentImage = agent?.memberImage
						? `${REACT_APP_API_URL}/${agent.memberImage}`
						: '/img/profile/defaultUser.svg';
					const isFollowing = agent?.meFollowed?.[0]?.myFollowing;
					const isLiked = agent?.meLiked?.[0]?.myFavorite;

					return (
						<SwiperSlide
							key={agent._id}
							style={{ backgroundImage: `url(${agentImage})` }}
						>
							{/* Rank badge — always visible top-right */}
							<Box className="slide-rank-badge">
								<Typography>#{agent.memberRank ?? '-'}</Typography>
							</Box>

							{/* Content overlay — revealed on active slide */}
							<Box className="slide-inner">
								<Box className="slide-content">
									{/* Role label */}
									<Typography className="slide-agent-role">FITNESS AGENT</Typography>

									{/* Name */}
									<Typography
										className="slide-agent-name"
										onClick={() => router.push({ pathname: '/member', query: { memberId: agent._id } })}
									>
										{agent.memberNick}
									</Typography>

									{/* Description */}
									{agent.memberDesc && (
										<Typography className="slide-agent-desc">{agent.memberDesc}</Typography>
									)}

									{/* Stats chips */}
									<Stack className="slide-stats" direction="row" gap="8px" flexWrap="wrap" justifyContent="center">
										<Stack direction="row" alignItems="center" gap="4px" className="slide-chip">
											<HomeWorkIcon style={{ fontSize: 12 }} />
											<Typography>{agent.memberProperties ?? 0} listings</Typography>
										</Stack>
										<Stack direction="row" alignItems="center" gap="4px" className="slide-chip">
											<RemoveRedEyeIcon style={{ fontSize: 12 }} />
											<Typography>{agent.memberViews ?? 0} views</Typography>
										</Stack>
										<Stack direction="row" alignItems="center" gap="4px" className="slide-chip">
											<EmojiEventsIcon style={{ fontSize: 12 }} />
											<Typography>{agent.memberPoints ?? 0} pts</Typography>
										</Stack>
									</Stack>

									{/* Actions */}
									<Stack className="slide-action-row" direction="row" gap="8px" alignItems="center">
										<IconButton
											className={`slide-icon-btn ${isFollowing ? 'following' : ''}`}
											onClick={(e: MouseEvent<HTMLButtonElement>) => {
												e.stopPropagation();
												followAgentHandler(user, agent._id);
											}}
										>
											{isFollowing
												? <PersonRemoveIcon style={{ fontSize: 15 }} />
												: <PersonAddIcon style={{ fontSize: 15 }} />
											}
										</IconButton>
										<IconButton
											className={`slide-icon-btn ${isLiked ? 'liked' : ''}`}
											onClick={(e: MouseEvent<HTMLButtonElement>) => {
												e.stopPropagation();
												likeAgentHandler(user, agent._id);
											}}
										>
											<FavoriteIcon style={{ fontSize: 15 }} />
										</IconButton>
										<Typography className="slide-like-count">{agent.memberLikes ?? 0}</Typography>
										<Link href={`/member?memberId=${agent._id}`}>
											<Box className="slide-explore-btn">EXPLORE</Box>
										</Link>
									</Stack>
								</Box>
							</Box>
						</SwiperSlide>
					);
				})}
			</Swiper>
		</Stack>
	);
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
