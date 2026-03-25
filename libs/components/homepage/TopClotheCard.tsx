import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Chip, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Clothe } from '../../types/clothes/clothes';
import { CommentGroup } from '../../enums/comment.enum';
import ClotheComments from '../comment/ClotheComments';

interface TopClothesCardProps {
	clothe: Clothe;
	likeHandler: any;
}

const TopClothesCard = (props: TopClothesCardProps) => {
	const { clothe, likeHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const pushDetailHandler = async (clotheId: string) => {
		await router.push({ pathname: '/clothes/detail', query: { id: clotheId } });
	};

	return (
		<Stack className="top-clothes-card">
			<Box className="clothes-image-wrap" onClick={() => pushDetailHandler(clothe._id)}>
				<Box
					className="clothes-image"
					style={{
						backgroundImage: `url(${REACT_APP_API_URL}/${clothe?.clotheImages?.[0]})`,
					}}
				/>
				<Box className="price-pill">
					<Typography>${clothe.clothePrice}</Typography>
				</Box>
				{clothe.isBestseller && (
					<Box className="bestseller-pill">
						<Typography>Bestseller</Typography>
					</Box>
				)}
			</Box>

			<Box className="clothes-body">
				<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
					<Box>
						<Typography className="clothes-name" onClick={() => pushDetailHandler(clothe._id)}>
							{clothe.clotheName}
						</Typography>
						<Typography className="clothes-brand">{clothe.clotheBrand}</Typography>
					</Box>
					<Stack direction="row" className="clothes-meta-tags" gap="4px" flexWrap="wrap" maxWidth="100px">
						<Chip className="meta-pill" label={clothe.clotheSize} size="small" />
						<Chip className="meta-pill gender" label={clothe.clotheGender} size="small" />
					</Stack>
				</Stack>

				<Stack direction="row" gap="6px" mt="10px" flexWrap="wrap">
					{clothe.clotheColor && (
						<Box className="color-dot-wrap">
							<Box className="color-dot" style={{ background: clothe.clotheColor.toLowerCase() }} />
							<Typography className="color-label">{clothe.clotheColor}</Typography>
						</Box>
					)}
					{clothe.clotheMaterial && (
						<Chip className="material-chip" label={clothe.clotheMaterial} size="small" />
					)}
				</Stack>

				<Stack direction="row" className="clothes-footer" justifyContent="space-between" alignItems="center" mt="12px">
					<Stack direction="row" alignItems="center" gap="4px" className="stock-info">
						<CheckroomIcon style={{ fontSize: 13 }} />
						<Typography>{clothe.clotheLeftCount} left</Typography>
					</Stack>

					<Stack direction="row" alignItems="center" gap="4px">
						<IconButton size="small" className="action-btn">
							<RemoveRedEyeIcon style={{ fontSize: 13 }} />
						</IconButton>
						<Typography className="count">{clothe.clotheViews}</Typography>

						<IconButton
							size="small"
							className={`action-btn ${clothe?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
							onClick={() => likeHandler(user, clothe._id)}
						>
							<FavoriteIcon
								style={{
									fontSize: 13,
									color: clothe?.meLiked?.[0]?.myFavorite ? '#ef4444' : undefined,
								}}
							/>
						</IconButton>
						<Typography className="count">{clothe.clotheLikes}</Typography>

						<IconButton
							size="small"
							className={`action-btn comment-btn ${commentOpen ? 'active' : ''}`}
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
				</Stack>

				<Collapse in={commentOpen}>
					<Box className="comment-section">
						<ClotheComments
							commentGroup={CommentGroup.CLOTHES}
							commentRefId={clothe._id}
							memberId={user?._id}
						/>
					</Box>
				</Collapse>
			</Box>
		</Stack>
	);
};

export default TopClothesCard;