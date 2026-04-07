import React from 'react';
import { Stack, Box, Typography, IconButton, Divider } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { Property } from '../../types/property/property';

interface PopularPropertyCardProps {
	property: Property;
	likePropertyHandler: any;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
	const { property, likePropertyHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const pushDetailHandler = async (propertyId: string) => {
		await router.push({ pathname: '/property/detail', query: { id: propertyId } });
	};

	return (
		<Stack className="popular-property-card">
			{/* Large portrait image with gradient overlay */}
			<Box className="prop-image-wrap" onClick={() => pushDetailHandler(property._id)}>
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
				{/* Price overlaid on image */}
				<Box className="price-tag">
					<Typography>${property.propertyPrice.toLocaleString()}</Typography>
				</Box>
				{/* Title + address overlaid on gradient */}
				<Box className="prop-title-overlay">
					<Typography component="p">{property.propertyTitle}</Typography>
					<Typography component="span">{property.propertyAddress}</Typography>
				</Box>
			</Box>

			{/* Specs + actions below */}
			<Box className="prop-body">
				<Stack direction="row" className="prop-specs" gap="14px">
					<Stack direction="row" alignItems="center" gap="4px" className="spec-item">
						<BedIcon style={{ fontSize: 14 }} />
						<Typography>{property.propertyBaths} bath</Typography>
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

						<IconButton size="small" className="action-icon comment-icon">
							<ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
						</IconButton>
						<Typography className="action-count">{property.propertyComments ?? 0}</Typography>
					</Stack>
				</Stack>
			</Box>
		</Stack>
	);
};

export default PopularPropertyCard;
