import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Chip, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
			{/* Lookbook image — fills top 75% */}
			<Box className="clothes-img-wrap" onClick={() => pushDetailHandler(clothe._id)}>
				<Box
					className="clothes-img"
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${clothe?.clotheImages?.[0]})` }}
				/>

				{/* Hover overlay showing size / gender / material */}
				<Box className="clothes-hover-overlay">
					{clothe.clotheSize && (
						<Chip className="overlay-chip" label={clothe.clotheSize} size="small" />
					)}
					{clothe.clotheGender && (
						<Chip className="overlay-chip" label={clothe.clotheGender} size="small" />
					)}
					{clothe.clotheMaterial && (
						<Chip className="overlay-chip" label={clothe.clotheMaterial} size="small" />
					)}
				</Box>

				{clothe.isBestseller && (
					<Box className="clothes-bestseller"><Typography>BESTSELLER</Typography></Box>
				)}

				{clothe.clotheColor && (
					<Box className="clothes-color-dot" style={{ background: clothe.clotheColor.toLowerCase() }} />
				)}
			</Box>

			{/* Minimal info strip */}
			<Box className="clothes-info-strip">
				<Stack direction="row" alignItems="flex-start" justifyContent="space-between">
					<Box flex={1} minWidth={0} mr="8px">
						<Typography className="clothes-strip-name" onClick={() => pushDetailHandler(clothe._id)}>
							{clothe.clotheName}
						</Typography>
						<Typography className="clothes-strip-brand">{clothe.clotheBrand}</Typography>
					</Box>
					<Typography className="clothes-strip-price">${clothe.clothePrice}</Typography>
				</Stack>

				<Stack direction="row" alignItems="center" justifyContent="space-between" mt="8px">
					<Typography className="clothes-strip-stock">{clothe.clotheLeftCount} left</Typography>
					<Stack direction="row" alignItems="center" gap="3px">
						<IconButton size="small" className="clothes-action-btn">
							<RemoveRedEyeIcon style={{ fontSize: 13 }} />
						</IconButton>
						<Typography className="clothes-count">{clothe.clotheViews}</Typography>

						<IconButton
							size="small"
							className={`clothes-action-btn ${clothe?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
							onClick={() => likeHandler(user, clothe._id)}
						>
							<FavoriteIcon
								style={{
									fontSize: 13,
									color: clothe?.meLiked?.[0]?.myFavorite ? '#ef4444' : undefined,
								}}
							/>
						</IconButton>
						<Typography className="clothes-count">{clothe.clotheLikes}</Typography>

						<IconButton
							size="small"
							className={`clothes-action-btn comment-btn ${commentOpen ? 'active' : ''}`}
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
					<Box className="clothes-comment-section">
						<ClotheComments
							commentGroup={CommentGroup.CLOTHE}
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
