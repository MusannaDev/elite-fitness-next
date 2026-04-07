import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';

interface TopTrainerCardProps {
	trainer: Member;
	likeTrainerHandler: any;
	followTrainerHandler: any;
}

const TopTrainerCard = (props: TopTrainerCardProps) => {
	const { trainer, likeTrainerHandler, followTrainerHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const trainerImage = trainer?.memberImage
		? `${REACT_APP_API_URL}/${trainer.memberImage}`
		: '/img/profile/defaultUser.svg';

	const isFollowing = trainer?.meFollowed?.[0]?.myFollowing;
	const isLiked = trainer?.meLiked?.[0]?.myFavorite;

	return (
		<Stack className="top-trainer-card">
			{/* ── Image area ── */}
			<Box className="tr-img-area" onClick={() => router.push({ pathname: '/member', query: { memberId: trainer._id } })}>
				<img src={trainerImage} alt={trainer.memberNick} className="tr-img" />
				<Box className="tr-grid-overlay" />

				{/* PRO badge */}
				<Box className="tr-pro-badge">
					<Typography>PRO</Typography>
				</Box>

				{/* Name + role overlay */}
				<Box className="tr-identity">
					<Typography className="tr-name">{trainer.memberNick}</Typography>
					<Typography className="tr-role">// CERTIFIED TRAINER</Typography>
				</Box>
			</Box>

			{/* ── Stats ── */}
			<Stack className="tr-stats" direction="row">
				<Box className="tr-stat">
					<Typography className="tr-stat-num">{trainer.memberFollowers ?? 0}</Typography>
					<Typography className="tr-stat-lbl">Followers</Typography>
				</Box>
				<Box className="tr-stat">
					<Typography className="tr-stat-num">{trainer.memberProducts ?? 0}</Typography>
					<Typography className="tr-stat-lbl">Products</Typography>
				</Box>
				<Box className="tr-stat">
					<Typography className="tr-stat-num">{trainer.memberRank ?? 0}</Typography>
					<Typography className="tr-stat-lbl">Ranking</Typography>
				</Box>
			</Stack>

			{/* ── Actions ── */}
			<Stack className="tr-actions" direction="row">
				<Box
					className={`tr-action-btn ${isLiked ? 'liked' : ''}`}
					onClick={() => likeTrainerHandler(user, trainer._id)}
				>
					<FavoriteIcon style={{ fontSize: 16 }} />
					<Typography>{trainer.memberLikes ?? 0}</Typography>
				</Box>

				<Box className="tr-action-btn">
					<RemoveRedEyeIcon style={{ fontSize: 16 }} />
					<Typography>{trainer.memberViews ?? 0}</Typography>
				</Box>

				<Box className="tr-action-btn">
					<ChatBubbleOutlineIcon style={{ fontSize: 16 }} />
					<Typography>{trainer.memberComments ?? 0}</Typography>
				</Box>

				<Box
					className={`tr-follow-btn ${isFollowing ? 'following' : ''}`}
					onClick={() => followTrainerHandler(user, trainer._id)}
				>
					{isFollowing
						? <PersonRemoveIcon style={{ fontSize: 16 }} />
						: <PersonAddIcon style={{ fontSize: 16 }} />
					}
					<Typography>{isFollowing ? 'Unfollow' : '+ Follow'}</Typography>
				</Box>
			</Stack>

		</Stack>
	);
};

export default TopTrainerCard;
