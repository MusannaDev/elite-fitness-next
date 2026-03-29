import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';
import { CommentGroup } from '../../enums/comment.enum';
import MemberComments from '../comment/MemberComments';

interface TopSalesManagerCardProps {
	manager: Member;
	likeManagerHandler: any;
	followManagerHandler: any;
}

const TopSalesManagerCard = (props: TopSalesManagerCardProps) => {
	const { manager, likeManagerHandler, followManagerHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const managerImage = manager?.memberImage
		? `${REACT_APP_API_URL}/${manager.memberImage}`
		: '/img/profile/defaultUser.svg';

	const pushDetailHandler = async (memberId: string) => {
		await router.push({ pathname: '/member', query: { memberId } });
	};

	return (
		<Stack className="top-sales-manager-card">
			{/* Leaderboard row */}
			<Box className="sm-main-row">
				{/* Rank */}
				<Box className="sm-rank">
					<Typography className="sm-rank-num">
						{String(manager.memberRank ?? 0).padStart(2, '0')}
					</Typography>
				</Box>

				{/* Circular avatar */}
				<Box
					className="sm-avatar"
					style={{ backgroundImage: `url(${managerImage})` }}
					onClick={() => pushDetailHandler(manager._id)}
				/>

				{/* Name + desc */}
				<Box className="sm-info">
					<Box className="sm-name-row">
						<Typography className="sm-name" onClick={() => pushDetailHandler(manager._id)}>
							{manager.memberNick}
						</Typography>
						<Box className="sm-role-badge"><Typography>SM</Typography></Box>
					</Box>
					{manager.memberDesc && (
						<Typography className="sm-desc">{manager.memberDesc}</Typography>
					)}
				</Box>

				{/* Stats */}
				<Stack className="sm-stats" direction="row">
					<Box className="sm-stat">
						<ShoppingBagIcon style={{ fontSize: 14 }} />
						<Typography className="sm-stat-num">{manager.memberProducts ?? 0}</Typography>
						<Typography className="sm-stat-lbl">Products</Typography>
					</Box>
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

				{/* Actions */}
				<Stack className="sm-actions" direction="row" alignItems="center">
					<IconButton
						size="small"
						className={`sm-follow-btn ${manager?.meFollowed?.[0]?.myFollowing ? 'following' : ''}`}
						onClick={() => followManagerHandler(user, manager._id)}
					>
						{manager?.meFollowed?.[0]?.myFollowing ? (
							<PersonRemoveIcon style={{ fontSize: 13 }} />
						) : (
							<PersonAddIcon style={{ fontSize: 13 }} />
						)}
					</IconButton>
					<IconButton
						size="small"
						className={`sm-like-btn ${manager?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
						onClick={() => likeManagerHandler(user, manager._id)}
					>
						<FavoriteIcon style={{ fontSize: 13 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberLikes}</Typography>
					<IconButton size="small" className="sm-view-btn">
						<RemoveRedEyeIcon style={{ fontSize: 13 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberViews}</Typography>
					<IconButton
						size="small"
						className={`sm-comment-btn ${commentOpen ? 'active' : ''}`}
						onClick={() => setCommentOpen(!commentOpen)}
					>
						<ChatBubbleOutlineIcon style={{ fontSize: 13 }} />
						<KeyboardArrowUpIcon
							style={{
								fontSize: 10,
								transform: commentOpen ? 'rotate(0deg)' : 'rotate(180deg)',
								transition: 'transform 0.25s',
							}}
						/>
					</IconButton>
				</Stack>
			</Box>

			<Collapse in={commentOpen}>
				<Box className="sm-comment-panel">
					<MemberComments
						commentGroup={CommentGroup.MEMBER}
						commentRefId={manager._id}
						memberId={user?._id}
					/>
				</Box>
			</Collapse>
		</Stack>
	);
};

export default TopSalesManagerCard;
