import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
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
			{/* Large photo */}
			<Box className="manager-photo-wrap" onClick={() => pushDetailHandler(manager._id)}>
				<Box className="manager-photo" style={{ backgroundImage: `url(${managerImage})` }} />
				<Box className="manager-role-badge">
					<Typography>SM</Typography>
				</Box>
			</Box>

			{/* Info */}
			<Box className="manager-body">
				<Stack direction="row" alignItems="center" gap="8px" mb="2px" flexWrap="wrap">
					<Typography className="manager-name" onClick={() => pushDetailHandler(manager._id)}>
						{manager.memberNick}
					</Typography>
					<Box className="sales-badge">
						<Typography>Sales Manager</Typography>
					</Box>
				</Stack>

				{manager.memberDesc && (
					<Typography className="manager-desc">{manager.memberDesc}</Typography>
				)}

				<Stack direction="row" gap="10px" mt="10px" flexWrap="wrap">
					<Stack direction="row" alignItems="center" gap="4px" className="sales-stat">
						<ShoppingBagIcon style={{ fontSize: 12 }} />
						<Typography>{manager.memberProducts ?? 0} products</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="4px" className="sales-stat">
						<CheckroomIcon style={{ fontSize: 12 }} />
						<Typography>{manager.memberClothes ?? 0} clothes</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="4px" className="sales-stat">
						<FitnessCenterIcon style={{ fontSize: 12 }} />
						<Typography>{manager.memberEquipments ?? 0} equip</Typography>
					</Stack>
				</Stack>
			</Box>

			{/* Actions */}
			<Stack className="manager-actions" direction="row" alignItems="center" justifyContent="space-between">
				<Stack direction="row" alignItems="center" gap="4px">
					<IconButton
						size="small"
						className={`follow-btn ${manager?.meFollowed?.[0]?.myFollowing ? 'following' : ''}`}
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
						className={`like-btn ${manager?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
						onClick={() => likeManagerHandler(user, manager._id)}
					>
						<FavoriteIcon style={{ fontSize: 13 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberLikes}</Typography>

					<IconButton size="small" className="view-btn">
						<RemoveRedEyeIcon style={{ fontSize: 13 }} />
					</IconButton>
					<Typography className="sm-count">{manager.memberViews}</Typography>
				</Stack>

				<IconButton
					size="small"
					className={`comment-toggle ${commentOpen ? 'active' : ''}`}
					onClick={() => setCommentOpen(!commentOpen)}
				>
					<ChatBubbleOutlineIcon style={{ fontSize: 13 }} />
					<Typography className="comment-count">{manager.memberComments ?? 0}</Typography>
					<KeyboardArrowUpIcon
						style={{
							fontSize: 11,
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
						commentRefId={manager._id}
						memberId={user?._id}
					/>
				</Box>
			</Collapse>
		</Stack>
	);
};

export default TopSalesManagerCard;
