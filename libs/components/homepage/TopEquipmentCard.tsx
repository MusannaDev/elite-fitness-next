import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Chip, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PlaceIcon from '@mui/icons-material/Place';
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
			<Box className="equipment-image-wrap" onClick={() => pushDetailHandler(equipment._id)}>
				<Box
					className="equipment-image"
					style={{
						backgroundImage: `url(${REACT_APP_API_URL}/${equipment?.equipmentImages?.[0]})`,
					}}
				/>
				{equipment.isBestseller && (
					<Box className="bestseller-tag">
						<Typography>Best Seller</Typography>
					</Box>
				)}
			</Box>

			<Box className="equipment-body">
				<Typography className="equipment-name" onClick={() => pushDetailHandler(equipment._id)}>
					{equipment.equipmentName}
				</Typography>
				<Typography className="equipment-brand">{equipment.equipmentBrand}</Typography>

				<Stack direction="row" gap="8px" mt="10px" flexWrap="wrap">
					<Chip
						className="equip-chip category"
						label={equipment.equipmentCategory}
						size="small"
					/>
					{equipment.equipmentWeightCapacity && (
						<Chip
							className="equip-chip capacity"
							icon={<FitnessCenterIcon style={{ fontSize: 11 }} />}
							label={`${equipment.equipmentWeightCapacity}`}
							size="small"
						/>
					)}
					{equipment.equipmentLocation && (
						<Chip
							className="equip-chip location"
							icon={<PlaceIcon style={{ fontSize: 11 }} />}
							label={equipment.equipmentLocation}
							size="small"
						/>
					)}
				</Stack>

				<Stack direction="row" className="equipment-footer" justifyContent="space-between" alignItems="center" mt="14px">
					<Box>
						<Typography className="equipment-price">${equipment.equipmentPrice}</Typography>
						<Typography className="equipment-stock">{equipment.equipmentLeftCount} in stock</Typography>
					</Box>

					<Stack direction="row" alignItems="center" gap="4px">
						<IconButton size="small" className="equip-action-btn">
							<RemoveRedEyeIcon style={{ fontSize: 14 }} />
						</IconButton>
						<Typography className="equip-count">{equipment.equipmentViews}</Typography>

						<IconButton
							size="small"
							className={`equip-action-btn ${equipment?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
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
							className={`equip-action-btn comment-btn ${commentOpen ? 'active' : ''}`}
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

				<Collapse in={commentOpen}>
					<Box className="comment-section">
						<EquipmentComments
							commentGroup={CommentGroup.EQUIPMENT}
							commentRefId={equipment._id}
							memberId={user?._id}
						/>
					</Box>
				</Collapse>
			</Box>
		</Stack>
	);
};

export default TopEquipmentCard;