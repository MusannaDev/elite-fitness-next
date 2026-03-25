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
			{/* Large photo */}
			<Box className="agent-photo-wrap" onClick={() => pushDetailHandler(agent._id)}>
				<Box className="agent-photo" style={{ backgroundImage: `url(${agentImage})` }} />
				<Box className="agent-badge">
					<Typography>AGENT</Typography>
				</Box>
			</Box>

			{/* Info */}
			<Box className="agent-body">
				<Stack direction="row" alignItems="center" gap="8px" mb="2px">
					<Typography className="agent-name" onClick={() => pushDetailHandler(agent._id)}>
						{agent.memberNick}
					</Typography>
				</Stack>

				{agent.memberDesc && (
					<Typography className="agent-desc">{agent.memberDesc}</Typography>
				)}

				<Stack direction="row" gap="16px" mt="10px">
					<Stack direction="row" alignItems="center" gap="4px" className="agent-stat">
						<HomeWorkIcon style={{ fontSize: 13 }} />
						<Typography>{agent.memberProperties ?? 0} listings</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="4px" className="agent-stat">
						<EmojiEventsIcon style={{ fontSize: 13 }} />
						<Typography>Rank #{agent.memberRank ?? '-'}</Typography>
					</Stack>
				</Stack>
			</Box>

			{/* Actions */}
			<Stack className="agent-actions" direction="row" alignItems="center" justifyContent="space-between">
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

					<IconButton size="small" className="view-btn">
						<RemoveRedEyeIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="action-count">{agent.memberViews}</Typography>
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
			</Stack>

			<Collapse in={commentOpen} style={{ width: '100%' }}>
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
