import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';
import { CommentGroup } from '../../enums/comment.enum';
import MemberComments from '../comment/MemberComments';

interface TopAgentCardProps {
	agent: Member;
	likeAgentHandler: any;
	followAgentHandler: any;
}

const TopAgentCard = (props: TopAgentCardProps) => {
	const { agent, likeAgentHandler, followAgentHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const agentImage = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent.memberImage}`
		: '/img/profile/defaultUser.svg';

	const pushDetailHandler = async (memberId: string) => {
		await router.push({ pathname: '/member', query: { memberId } });
	};

	return (
		<Stack className="top-agent-card">
			{/* Circular avatar + name + rank */}
			<Box className="agent-card-header">
				<Box
					className="agent-avatar"
					style={{ backgroundImage: `url(${agentImage})` }}
					onClick={() => pushDetailHandler(agent._id)}
				/>
				<Box className="agent-info-col">
					<Typography className="agent-name" onClick={() => pushDetailHandler(agent._id)}>
						{agent.memberNick}
					</Typography>
					<Typography className="agent-role">FITNESS AGENT</Typography>
				</Box>
				<Box className="agent-rank-pill">
					<Typography>#{agent.memberRank ?? '-'}</Typography>
				</Box>
			</Box>

			{agent.memberDesc && (
				<Typography className="agent-desc">{agent.memberDesc}</Typography>
			)}

			<Stack className="agent-chips" direction="row" flexWrap="wrap">
				<Stack direction="row" alignItems="center" gap="4px" className="a-chip">
					<HomeWorkIcon style={{ fontSize: 12 }} />
					<Typography>{agent.memberProperties ?? 0} listings</Typography>
				</Stack>
				<Stack direction="row" alignItems="center" gap="4px" className="a-chip a-chip-cyan">
					<RemoveRedEyeIcon style={{ fontSize: 12 }} />
					<Typography>{agent.memberViews ?? 0} views</Typography>
				</Stack>
				<Stack direction="row" alignItems="center" gap="4px" className="a-chip">
					<EmojiEventsIcon style={{ fontSize: 12 }} />
					<Typography>{agent.memberPoints ?? 0} pts</Typography>
				</Stack>
			</Stack>

			<Box className="agent-divider" />

			<Box className="agent-actions">
				<Stack direction="row" alignItems="center" gap="4px">
					<IconButton
						size="small"
						className={`follow-btn ${agent?.meFollowed?.[0]?.myFollowing ? 'following' : ''}`}
						onClick={() => followAgentHandler(user, agent._id)}
					>
						{agent?.meFollowed?.[0]?.myFollowing ? (
							<PersonRemoveIcon style={{ fontSize: 14 }} />
						) : (
							<PersonAddIcon style={{ fontSize: 14 }} />
						)}
					</IconButton>
					<IconButton
						size="small"
						className={`like-btn ${agent?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
						onClick={() => likeAgentHandler(user, agent._id)}
					>
						<FavoriteIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="action-count">{agent.memberLikes}</Typography>
				</Stack>

				<IconButton
					size="small"
					className={`comment-toggle ${commentOpen ? 'active' : ''}`}
					onClick={() => setCommentOpen(!commentOpen)}
				>
					<ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
					<Typography className="comment-cnt">{agent.memberComments ?? 0}</Typography>
					<KeyboardArrowUpIcon
						style={{
							fontSize: 12,
							transform: commentOpen ? 'rotate(0deg)' : 'rotate(180deg)',
							transition: 'transform 0.25s',
						}}
					/>
				</IconButton>
			</Box>

			<Collapse in={commentOpen}>
				<Box className="comment-panel">
					<MemberComments
						commentGroup={CommentGroup.MEMBER}
						commentRefId={agent._id}
						memberId={user?._id}
					/>
				</Box>
			</Collapse>
		</Stack>
	);
};

export default TopAgentCard;
