import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { NEXT_PUBLIC_API_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	const imagePath: string = property?.propertyImages[0]
		? `${NEXT_PUBLIC_API_URL}/${property?.propertyImages[0]}`
		: '/img/banner/header1.svg';

	const isLiked = myFavorites || !!(property?.meLiked && property?.meLiked[0]?.myFavorite);

	if (device === 'mobile') {
		return <div>PROPERTY CARD</div>;
	}

	return (
		<Box
			className="card-config"
			sx={{
				width: 296,
				flexShrink: 0,
				display: 'flex',
				flexDirection: 'column',
				background: '#f5f4f2',
				border: '1px solid #d4d2cf',
				borderRadius: '14px',
				overflow: 'hidden',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
				},
			}}
		>
			{/* ── IMAGE ── */}
			<Box
				sx={{
					position: 'relative',
					width: '100%',
					height: 200,
					flexShrink: 0,
				}}
			>
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
					<img
						src={imagePath}
						alt={property.propertyTitle}
						style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
					/>
				</Link>

				{/* TOP badge */}
				{property?.propertyRank > topPropertyRank && (
					<Box
						sx={{
							position: 'absolute',
							top: 10,
							left: 10,
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
							background: '#e8392a',
							padding: '4px 10px',
							borderRadius: '4px',
						}}
					>
						<img src="/img/icons/electricity.svg" alt="" style={{ height: 12, filter: 'brightness(10)' }} />
						<Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px' }}>
							TOP
						</Typography>
					</Box>
				)}

				{/* Location + Tags overlay at bottom of image */}
				<Box
					sx={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
						padding: '20px 12px 10px',
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
						flexWrap: 'wrap',
					}}
				>
					<Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', opacity: 0.85 }}>
						{property.propertyLocation}
					</Typography>
					{property.propertyBarter && (
						<Box sx={{ px: '8px', py: '2px', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '4px' }}>
							<Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '1px' }}>BARTER</Typography>
						</Box>
					)}
					{property.propertyRent && (
						<Box sx={{ px: '8px', py: '2px', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '4px' }}>
							<Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '1px' }}>RENT</Typography>
						</Box>
					)}
				</Box>
			</Box>

			{/* ── INFO ── */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					padding: '16px 16px 14px',
					flex: 1,
				}}
			>
				{/* Price */}
				<Typography
					sx={{
						color: '#e8392a',
						fontSize: 20,
						fontWeight: 700,
						letterSpacing: '-0.5px',
						lineHeight: 1,
						mb: '8px',
						fontFamily: "'JetBrains Mono', monospace",
					}}
				>
					${formatterStr(property?.propertyPrice)}
				</Typography>

				{/* Title */}
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
					<Typography
						sx={{
							color: '#1a1a1a',
							fontSize: 16,
							fontWeight: 700,
							lineHeight: 1.2,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							mb: '4px',
							cursor: 'pointer',
							'&:hover': { color: '#e8392a' },
						}}
					>
						{property.propertyTitle}
					</Typography>
				</Link>

				{/* Address */}
				<Typography
					sx={{
						color: '#555560',
						fontSize: 10,
						fontWeight: 600,
						letterSpacing: '1.2px',
						textTransform: 'uppercase',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						mb: '12px',
						fontFamily: "'JetBrains Mono', monospace",
					}}
				>
					{property.propertyAddress}
				</Typography>

				{/* Divider */}
				<Box sx={{ width: '100%', height: 1, background: '#ebebeb', mb: '12px' }} />

				{/* Specs */}
				<Stack direction="row" gap="14px" sx={{ mb: '12px' }}>
					<Stack direction="row" alignItems="center" gap="5px">
						<BedIcon sx={{ fontSize: 15, color: '#e8392a' }} />
						<Typography sx={{ color: '#555560', fontSize: 12 }}>{property.propertyBaths} bath</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="5px">
						<MeetingRoomIcon sx={{ fontSize: 15, color: '#e8392a' }} />
						<Typography sx={{ color: '#555560', fontSize: 12 }}>{property.propertyRooms} room</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap="5px">
						<SquareFootIcon sx={{ fontSize: 15, color: '#e8392a' }} />
						<Typography sx={{ color: '#555560', fontSize: 12 }}>{property.propertySquare} m²</Typography>
					</Stack>
				</Stack>

				{/* Footer: views + likes */}
				{!recentlyVisited && (
					<Stack
						direction="row"
						justifyContent="flex-end"
						alignItems="center"
						gap="8px"
						sx={{ mt: 'auto' }}
					>
						<Stack direction="row" alignItems="center" gap="3px">
							<RemoveRedEyeIcon sx={{ fontSize: 15, color: '#9ca3af' }} />
							<Typography sx={{ color: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}>
								{property?.propertyViews}
							</Typography>
						</Stack>
						<Stack
							direction="row"
							alignItems="center"
							gap="3px"
							onClick={() => likePropertyHandler?.(user, property?._id)}
							sx={{ cursor: 'pointer' }}
						>
							{isLiked ? (
								<FavoriteIcon sx={{ fontSize: 15, color: '#e8392a' }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: 15, color: '#9ca3af' }} />
							)}
							<Typography
								sx={{ color: isLiked ? '#e8392a' : '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}
							>
								{property?.propertyLikes}
							</Typography>
						</Stack>
					</Stack>
				)}
			</Box>
		</Box>
	);
};

export default PropertyCard;
