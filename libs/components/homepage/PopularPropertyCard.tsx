import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Divider, Collapse } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { Property } from '../../types/property/property';
import { CommentGroup } from '../../enums/comment.enum';
import PropertyComments from '../comment/PropertyComments';

interface PopularPropertyCardProps {
	property: Property;
	likePropertyHandler: any;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
	const { property, likePropertyHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const pushDetailHandler = async (propertyId: string) => {
		await router.push({ pathname: '/property/detail', query: { id: propertyId } });
	};

	return (
		<Stack className="popular-property-card">
			<Box
				className="prop-image-wrap"
				onClick={() => pushDetailHandler(property._id)}
			>
				<Box
					className="prop-image"
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages?.[0]})` }}
				/>
				{property?.propertyRank >= topPropertyRank && (
					<Box className="top-badge">
						<img src="/img/icons/electricity.svg" alt="" />
						<Typography>TOP</Typography>
					</Box>
				)}
				<Box className="price-tag">
					<Typography>${property.propertyPrice.toLocaleString()}</Typography>
				</Box>
			</Box>

			<Box className="prop-body">
				<Typography className="prop-title" onClick={() => pushDetailHandler(property._id)}>
					{property.propertyTitle}
				</Typography>
				<Typography className="prop-address">{property.propertyAddress}</Typography>

				<Stack direction="row" className="prop-specs" gap="16px">
					<Stack direction="row" alignItems="center" gap="4px" className="spec-item">
						<BedIcon style={{ fontSize: 14 }} />
						<Typography>{property.propertyBaths} bed</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="4px" className="spec-item">
						<MeetingRoomIcon style={{ fontSize: 14 }} />
						<Typography>{property.propertyRooms} rooms</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="4px" className="spec-item">
						<SquareFootIcon style={{ fontSize: 14 }} />
						<Typography>{property.propertySquare} m²</Typography>
					</Stack>
				</Stack>

				<Divider className="prop-divider" />

				<Stack direction="row" className="prop-footer" justifyContent="space-between" alignItems="center">
					<Box className="prop-type-badge">
						<Typography>{property.propertyRent ? 'Rent' : 'Sale'}</Typography>
					</Box>
					<Stack direction="row" alignItems="center" gap="6px">
						<IconButton size="small" className="action-icon">
							<RemoveRedEyeIcon style={{ fontSize: 14 }} />
						</IconButton>
						<Typography className="action-count">{property.propertyViews}</Typography>

						<IconButton
							size="small"
							className={`action-icon ${property?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
							onClick={() => likePropertyHandler(user, property._id)}
						>
							<FavoriteIcon
								style={{
									fontSize: 14,
									color: property?.meLiked?.[0]?.myFavorite ? '#ef4444' : undefined,
								}}
							/>
						</IconButton>
						<Typography className="action-count">{property.propertyLikes}</Typography>

						<IconButton
							size="small"
							className={`action-icon comment-icon ${commentOpen ? 'active' : ''}`}
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
						<PropertyComments
							commentGroup={CommentGroup.PROPERTY}
							commentRefId={property._id}
							memberId={user?._id}
						/>
					</Box>
				</Collapse>
			</Box>
		</Stack>
	);
};

export default PopularPropertyCard;