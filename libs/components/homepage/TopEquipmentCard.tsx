import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Equipment } from '../../types/equipment/equipment';
import { CommentGroup } from '../../enums/comment.enum';
import EquipmentComments from '../comment/EquipmentComments';

interface TopEquipmentCardProps {
	equipment: Equipment;
	likeHandler: any;
}

const TopEquipmentCard = (props: TopEquipmentCardProps) => {
	const { equipment, likeHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const pushDetailHandler = async (equipmentId: string) => {
		await router.push({ pathname: '/equipment/detail', query: { id: equipmentId } });
	};

	return (
		<Stack className="top-equipment-card">
			{/* Horizontal: image LEFT — specs RIGHT */}
			<Box className="equip-main-row">
				{/* Image side */}
				<Box className="equip-image-side" onClick={() => pushDetailHandler(equipment._id)}>
					<Box
						className="equip-image"
						style={{ backgroundImage: `url(${REACT_APP_API_URL}/${equipment?.equipmentImages?.[0]})` }}
					/>
					{equipment.isBestseller && (
						<Box className="equip-bestseller"><Typography>Best Seller</Typography></Box>
					)}
				</Box>

				{/* Spec side */}
				<Stack className="equip-spec-side">
					<Typography className="equip-name" onClick={() => pushDetailHandler(equipment._id)}>
						{equipment.equipmentName}
					</Typography>
					<Typography className="equip-brand">{equipment.equipmentBrand}</Typography>

					<Stack className="equip-specs-list">
						<Stack direction="row" alignItems="center" className="spec-row">
							<CategoryIcon />
							<Typography className="spec-label">Category</Typography>
							<Typography className="spec-val">{equipment.equipmentCategory}</Typography>
						</Stack>
						{equipment.equipmentWeightCapacity && (
							<Stack direction="row" alignItems="center" className="spec-row">
								<FitnessCenterIcon />
								<Typography className="spec-label">Capacity</Typography>
								<Typography className="spec-val">{equipment.equipmentWeightCapacity}</Typography>
							</Stack>
						)}
						{equipment.equipmentLocation && (
							<Stack direction="row" alignItems="center" className="spec-row">
								<PlaceIcon />
								<Typography className="spec-label">For</Typography>
								<Typography className="spec-val">{equipment.equipmentLocation}</Typography>
							</Stack>
						)}
					</Stack>

					<Stack className="equip-footer" direction="row" alignItems="center" justifyContent="space-between">
						<Box>
							<Typography className="equip-price">${equipment.equipmentPrice}</Typography>
							<Typography className="equip-stock">{equipment.equipmentLeftCount} in stock</Typography>
						</Box>
						<Stack direction="row" alignItems="center" gap="3px">
							<IconButton size="small" className="equip-btn">
								<RemoveRedEyeIcon style={{ fontSize: 14 }} />
							</IconButton>
							<Typography className="equip-count">{equipment.equipmentViews}</Typography>

							<IconButton
								size="small"
								className={`equip-btn ${equipment?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
								onClick={() => likeHandler(user, equipment._id)}
							>
								<FavoriteIcon
									style={{
										fontSize: 14,
										color: equipment?.meLiked?.[0]?.myFavorite ? '#ef4444' : undefined,
									}}
								/>
							</IconButton>
							<Typography className="equip-count">{equipment.equipmentLikes}</Typography>

							<IconButton
								size="small"
								className={`equip-btn comment-btn ${commentOpen ? 'active' : ''}`}
								onClick={() => setCommentOpen(!commentOpen)}
							>
								<ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
								<KeyboardArrowUpIcon
									style={{
										fontSize: 10,
										transform: commentOpen ? 'rotate(0deg)' : 'rotate(180deg)',
										transition: 'transform 0.25s',
									}}
								/>
							</IconButton>
						</Stack>
					</Stack>
				</Stack>
			</Box>

			<Collapse in={commentOpen}>
				<Box className="equip-comment-section">
					<EquipmentComments
						commentGroup={CommentGroup.EQUIPMENT}
						commentRefId={equipment._id}
						memberId={user?._id}
					/>
				</Box>
			</Collapse>
		</Stack>
	);
};

export default TopEquipmentCard;
