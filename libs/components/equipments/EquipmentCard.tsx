import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Equipment } from '../../types/equipment/equipment';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topEquipmentRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface EquipmentCardType {
	equipment: Equipment;
	likeEquipmentHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

// ── Ticket geometry constants (must match SCSS clip-path values) ──────────────
const TICKET_W  = 310;   // card width  (px)
const TICKET_H  = 430;   // card height (px)
const TEAR_Y    = 260;   // y position of tear-line / notch centre
const NOTCH_R   = 14;    // semi-circle notch radius
const CORNER_R  = 12;    // rounded corner radius

// SVG border path — traces the full ticket outline including notches
const ticketBorderPath = `
  M ${CORNER_R} 0.5
  H ${TICKET_W - CORNER_R}
  Q ${TICKET_W - 0.5} 0.5 ${TICKET_W - 0.5} ${CORNER_R}
  L ${TICKET_W - 0.5} ${TEAR_Y - NOTCH_R}
  A ${NOTCH_R} ${NOTCH_R} 0 0 1 ${TICKET_W - 0.5} ${TEAR_Y + NOTCH_R}
  L ${TICKET_W - 0.5} ${TICKET_H - CORNER_R}
  Q ${TICKET_W - 0.5} ${TICKET_H - 0.5} ${TICKET_W - CORNER_R} ${TICKET_H - 0.5}
  H ${CORNER_R}
  Q 0.5 ${TICKET_H - 0.5} 0.5 ${TICKET_H - CORNER_R}
  L 0.5 ${TEAR_Y + NOTCH_R}
  A ${NOTCH_R} ${NOTCH_R} 0 0 1 0.5 ${TEAR_Y - NOTCH_R}
  L 0.5 ${CORNER_R}
  Q 0.5 0.5 ${CORNER_R} 0.5
  Z
`;

const EquipmentCard = (props: EquipmentCardType) => {
	const { equipment, likeEquipmentHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = equipment?.equipmentImages[0]
		? `${REACT_APP_API_URL}/${equipment?.equipmentImages[0]}`
		: '/img/banner/header1.svg';

	const serverLiked = !!(myFavorites || (equipment?.meLiked && equipment?.meLiked[0]?.myFavorite));
	const [isLiked, setIsLiked]     = useState<boolean>(serverLiked);
	const [likeCount, setLikeCount] = useState<number>(equipment?.equipmentLikes ?? 0);

	const handleLike = async () => {
		const newLiked = !isLiked;
		setIsLiked(newLiked);
		setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
		try {
			await likeEquipmentHandler?.(user, equipment?._id);
		} catch {
			setIsLiked(isLiked);
			setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
		}
	};

	if (device === 'mobile') {
		return <div>EQUIPMENT CARD</div>;
	}

	return (
		<Stack className="card-config">

			{/* ── SVG border + tear-line overlay ─────────────────────────────── */}
			<Box component="div" className="ticket-border" aria-hidden>
				<svg
					width={TICKET_W}
					height={TICKET_H}
					viewBox={`0 0 ${TICKET_W} ${TICKET_H}`}
					xmlns="http://www.w3.org/2000/svg"
					style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
				>
					{/* Outer border */}
					<path className="border-path" d={ticketBorderPath} />

					{/* Dashed tear-line between image and stub */}
					<line
						className="tear-line"
						x1={NOTCH_R + 6}
						y1={TEAR_Y}
						x2={TICKET_W - NOTCH_R - 6}
						y2={TEAR_Y}
					/>
				</svg>
			</Box>

			{/* ── TOP: Image + Hover Actions ─────────────────────────────────── */}
			<Stack className="top">
				<Link href={{ pathname: '/equipment/detail', query: { id: equipment?._id } }}>
					<img src={imagePath} alt={equipment.equipmentName} />
				</Link>

				{/* TOP badge */}
				{equipment?.equipmentRank > topEquipmentRank && (
					<Box component="div" className="top-badge">
						<img src="/img/icons/electricity.svg" alt="" />
						<Typography>TOP</Typography>
					</Box>
				)}

				{/* Hover action buttons */}
				{!recentlyVisited && (
					<Box component="div" className="card-actions">
						{/* View */}
						<button className="action-btn view-btn">
							<RemoveRedEyeIcon />
							<span className="action-count">{equipment?.equipmentViews ?? 0}</span>
						</button>

						{/* Basket */}
						<button className="action-btn basket-btn">
							<ShoppingBagOutlinedIcon />
							<span className="action-count action-count--amber">{equipment?.equipmentLeftCount ?? 0}</span>
						</button>

						{/* Like — optimistic toggle */}
						<button
							className={`action-btn like-btn${isLiked ? ' liked' : ''}`}
							onClick={handleLike}
						>
							{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							<span className="action-count">{likeCount}</span>
						</button>
					</Box>
				)}

				{/* Price overlay */}
				<Box component="div" className="price-box">
					<Typography>Rs. {formatterStr(equipment?.equipmentPrice)}</Typography>
				</Box>
			</Stack>

			{/* ── BOTTOM: Stub Info ──────────────────────────────────────────── */}
			<Stack className="bottom">
				<Stack className="name-address">
					<Stack className="name">
						<Link href={{ pathname: '/equipment/detail', query: { id: equipment?._id } }}>
							<Typography>{equipment.equipmentName}</Typography>
						</Link>
					</Stack>
					<Stack className="address">
						<Typography>
							{equipment.equipmentBrand}, {equipment.equipmentLocation}
						</Typography>
					</Stack>
				</Stack>

				<Stack className="options">
					<Stack className="option">
						<img src="/img/icons/material.svg" alt="" />
						<Typography>{equipment.equipmentMaterial}</Typography>
					</Stack>
					<Stack className="option">
						<img src="/img/icons/weight.svg" alt="" />
						<Typography>
							{equipment.equipmentWeight ? `${equipment.equipmentWeight} kg` : 'N/A'}
						</Typography>
					</Stack>
					<Stack className="option">
						<img src="/img/icons/stock.svg" alt="" />
						<Typography>{equipment.equipmentLeftCount} in stock</Typography>
					</Stack>
				</Stack>

				<Stack className="divider" />

				<Stack className="type-buttons">
					<Stack className="type">
						<Typography>{equipment.equipmentCategory}</Typography>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default EquipmentCard;