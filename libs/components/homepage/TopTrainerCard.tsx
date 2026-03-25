import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';
import { CommentGroup } from '../../enums/comment.enum';
import MemberComments from '../comment/MemberComments';

interface TopTrainerCardProps {
	trainer: Member;
	likeTrainerHandler: any;
	followTrainerHandler: any;
}

const TopTrainerCard = (props: TopTrainerCardProps) => {
	const { trainer, likeTrainerHandler, followTrainerHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const trainerImage = trainer?.memberImage
		? `${REACT_APP_API_URL}/${trainer.memberImage}`
		: '/img/profile/defaultUser.svg';

	const pushDetailHandler = async (memberId: string) => {
		await router.push({ pathname: '/member', query: { memberId } });
	};

	return (
		<Stack className="top-trainer-card">
			{/* Large photo */}
			<Box className="trainer-photo-wrap" onClick={() => pushDetailHandler(trainer._id)}>
				<Box className="trainer-photo" style={{ backgroundImage: `url(${trainerImage})` }} />
				<Box className="trainer-badge">
					<Typography>PRO</Typography>
				</Box>
			</Box>

			{/* Info */}
			<Box className="trainer-body">
				<Typography className="trainer-name" onClick={() => pushDetailHandler(trainer._id)}>
					{trainer.memberNick}
				</Typography>
				<Typography className="trainer-type">Certified Trainer</Typography>

				<Stack className="trainer-stats" direction="row" mt="12px">
					<Box className="stat-item">
						<Typography className="stat-num">{trainer.memberFollowers ?? 0}</Typography>
						<Typography className="stat-lbl">Followers</Typography>
					</Box>
					<Box className="stat-divider" />
					<Box className="stat-item">
						<Typography className="stat-num">{trainer.memberProducts ?? 0}</Typography>
						<Typography className="stat-lbl">Programs</Typography>
					</Box>
					<Box className="stat-divider" />
					<Box className="stat-item">
						<Typography className="stat-num">{trainer.memberPoints ?? 0}</Typography>
						<Typography className="stat-lbl">Points</Typography>
					</Box>
				</Stack>
			</Box>

			{/* Actions */}
			<Stack className="trainer-actions" direction="row" alignItems="center" justifyContent="space-between">
				<Stack direction="row" alignItems="center" gap="4px">
					<IconButton
						size="small"
						className={`follow-btn ${trainer?.meFollowed?.[0]?.myFollowing ? 'following' : ''}`}
						onClick={() => followTrainerHandler(user, trainer._id)}
					>
						{trainer?.meFollowed?.[0]?.myFollowing ? (
							<PersonRemoveIcon style={{ fontSize: 14 }} />
						) : (
							<PersonAddIcon style={{ fontSize: 14 }} />
						)}
					</IconButton>
					<IconButton
						size="small"
						className={`like-btn ${trainer?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
						onClick={() => likeTrainerHandler(user, trainer._id)}
					>
						<FavoriteIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="count-text">{trainer.memberLikes}</Typography>
					<IconButton size="small" className="view-btn">
						<RemoveRedEyeIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="count-text">{trainer.memberViews}</Typography>
				</Stack>

				<IconButton
					size="small"
					className={`comment-toggle-btn ${commentOpen ? 'active' : ''}`}
					onClick={() => setCommentOpen(!commentOpen)}
				>
					<ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
					<Typography className="comment-count">{trainer.memberComments ?? 0}</Typography>
					<KeyboardArrowUpIcon
						style={{
							fontSize: 12,
							transform: commentOpen ? 'rotate(0deg)' : 'rotate(180deg)',
							transition: 'transform 0.25s',
						}}
					/>
				</IconButton>
			</Stack>

			<Collapse in={commentOpen} className="comment-panel">
				<MemberComments
					commentGroup={CommentGroup.MEMBER}
					commentRefId={trainer._id}
					memberId={user?._id}
				/>
			</Collapse>
		</Stack>
	);
};

export default TopTrainerCard;
