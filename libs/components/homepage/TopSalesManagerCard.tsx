import React from 'react';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { Member } from '../../types/member/member';

interface TopSalesManagerCardProps {
	manager: Member;
	likeManagerHandler: any;
	followManagerHandler: any;
}

const TopSalesManagerCard = (props: TopSalesManagerCardProps) => {
	const { manager, likeManagerHandler, followManagerHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const managerImage = manager?.memberImage
		? `${NEXT_PUBLIC_API_URL}/${manager.memberImage}`
		: '/img/profile/defaultUser.svg';

	const isFollowing = manager?.meFollowed?.[0]?.myFollowing;
	const isLiked = manager?.meLiked?.[0]?.myFavorite;

	return (
		<Stack className="top-sales-manager-card">
			{/* Rank badge */}
			<Box className="sm-rank-badge">
				<Typography>#{String(manager.memberRank ?? 0).padStart(2, '0')}</Typography>
			</Box>

			{/* Profile image */}
			<Box className="sm-img-wrap">
				<img src={managerImage} alt={manager.memberNick} className="sm-img" />
			</Box>

			{/* Card body */}
			<Box className="sm-body">
				{/* Name */}
				<Typography
					className="sm-name"
					onClick={() => router.push({ pathname: '/member', query: { memberId: manager._id } })}
				>
					{manager.memberNick}
				</Typography>

				{/* Role */}
				<Typography className="sm-role">Sales Manager</Typography>

				{/* Description */}
				{manager.memberDesc && (
					<Typography className="sm-desc">{manager.memberDesc}</Typography>
				)}

				{/* Stats */}
				<Stack className="sm-stats" direction="row">
					<Box className="sm-stat">
						<CheckroomIcon style={{ fontSize: 14 }} />
						<Typography className="sm-stat-num">{manager.memberClothes ?? 0}</Typography>
						<Typography className="sm-stat-lbl">Clothes</Typography>
					</Box>
					<Box className="sm-stat">
						<FitnessCenterIcon style={{ fontSize: 14 }} />
						<Typography className="sm-stat-num">{manager.memberEquipments ?? 0}</Typography>
						<Typography className="sm-stat-lbl">Equip</Typography>
					</Box>
				</Stack>

				{/* Divider */}
				<Box className="sm-divider" />

				{/* Actions */}
				<Stack className="sm-action-row" direction="row" alignItems="center">
					<IconButton
						size="small"
						className={`sm-icon-btn ${isLiked ? 'liked' : ''}`}
						onClick={() => likeManagerHandler(user, manager._id)}
					>
						<FavoriteIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberLikes ?? 0}</Typography>

					<IconButton size="small" className="sm-icon-btn">
						<RemoveRedEyeIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberViews ?? 0}</Typography>

					<IconButton size="small" className="sm-icon-btn">
						<ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberComments ?? 0}</Typography>

					<Box className="sm-spacer" />

					{/* Profile button */}
					<IconButton
						size="small"
						className="sm-icon-btn sm-profile-icon"
						onClick={() => router.push({ pathname: '/member', query: { memberId: manager._id } })}
					>
						<AccountCircleIcon style={{ fontSize: 14 }} />
					</IconButton>

					{/* Follow button */}
					<IconButton
						size="small"
						className={`sm-icon-btn sm-follow-icon ${isFollowing ? 'following' : ''}`}
						onClick={() => followManagerHandler(user, manager._id)}
					>
						{isFollowing
							? <PersonRemoveIcon style={{ fontSize: 14 }} />
							: <PersonAddIcon style={{ fontSize: 14 }} />
						}
					</IconButton>
				</Stack>
			</Box>

		</Stack>
	);
};

export default TopSalesManagerCard;
