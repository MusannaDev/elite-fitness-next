import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Clothe } from '../../types/clothes/clothes';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ClotheStatus } from '../../enums/clothes.enum';
import { NEXT_PUBLIC_API_URL } from '../../config';

interface ClotheCardProps {
	clothe: Clothe;
	deleteClotheHandler?: any;
	memberPage?: boolean;
	updateClotheHandler?: any;
	likeClotheHandler?: any;
}

/** COLOR MAP **/
const colorMap: Record<string, string> = {
	BLACK: '#1a1a1a',
	WHITE: '#f5f5f5',
	GRAY: '#9e9e9e',
	RED: '#e74c3c',
	BLUE: '#3498db',
	GREEN: '#27ae60',
	YELLOW: '#f1c40f',
	NAVY: '#2c3e50',
	PINK: '#e84393',
};

export const ClotheCard = (props: ClotheCardProps) => {
	const { clothe, deleteClotheHandler, memberPage, updateClotheHandler, likeClotheHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditClothe = async (id: string) => {
		console.log('+pushEditClothe: ', id);
		await router.push({
			pathname: '/mypage',
			query: { category: 'addClothe', clotheId: id },
		});
	};

	const pushClotheDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/clothes/detail',
				query: { id: id },
			});
		else return;
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	/** FORMAT CATEGORY **/
	const formatCategory = (cat: string) => {
		return cat?.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
	};

	/** GENDER CLASS **/
	const getGenderClass = (gender: string) => {
		switch (gender) {
			case 'MEN':
				return 'men';
			case 'WOMEN':
				return 'women';
			case 'UNISEX':
				return 'unisex';
			default:
				return '';
		}
	};

	if (device === 'mobile') {
		return <div>MOBILE CLOTHE CARD</div>;
	} else
		return (
			<Stack className="clothe-card-box">
				<Stack className="image-box" onClick={() => pushClotheDetail(clothe?._id)}>
					<img src={`${NEXT_PUBLIC_API_URL}/${clothe.clotheImages[0]}`} alt="" />
				</Stack>
				<Stack className="information-box" onClick={() => pushClotheDetail(clothe?._id)}>
					<Typography className="name">{clothe.clotheName}</Typography>
					<Typography className="category">{formatCategory(clothe.clotheCategory)}</Typography>
					<Typography className="price">
						<strong>${formatterStr(clothe?.clothePrice)}</strong>
					</Typography>
				</Stack>
				<Stack className="size-box">
					<Typography className="size-badge">{clothe.clotheSize}</Typography>
				</Stack>
				<Stack className="gender-box">
					<Typography className={`gender-badge ${getGenderClass(clothe.clotheGender)}`}>
						{formatCategory(clothe.clotheGender)}
					</Typography>
				</Stack>
				<Stack className="color-box">
					<Stack className="color-swatch">
						<span
							className="swatch"
							style={{ backgroundColor: colorMap[clothe.clotheColor] || '#ccc' }}
						/>
						<Typography className="color-name">{formatCategory(clothe.clotheColor)}</Typography>
					</Stack>
				</Stack>
				<Stack className="status-box">
					<Stack
						className="coloured-box"
						sx={{
							background:
								clothe.clotheStatus === 'ACTIVE'
									? '#E5F0FD'
									: clothe.clotheStatus === 'SOLD'
									? '#FFF3E0'
									: '#FFEBEE',
						}}
						onClick={handleClick}
					>
						<Typography
							className="status"
							sx={{
								color:
									clothe.clotheStatus === 'ACTIVE'
										? '#3554d1'
										: clothe.clotheStatus === 'SOLD'
										? '#E65100'
										: '#C62828',
							}}
						>
							{clothe.clotheStatus}
						</Typography>
					</Stack>
				</Stack>
				{!memberPage && clothe.clotheStatus !== 'SOLD' && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '70px',
								mt: 1,
								ml: '10px',
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							},
							style: {
								padding: 0,
								display: 'flex',
								justifyContent: 'center',
							},
						}}
					>
						{clothe.clotheStatus === 'ACTIVE' && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateClotheHandler(ClotheStatus.SOLD, clothe?._id);
								}}
							>
								Sold
							</MenuItem>
						)}
					</Menu>
				)}

				<Stack className="views-box">
					<Typography className="views">{clothe.clotheViews.toLocaleString()}</Typography>
				</Stack>
				{!memberPage && clothe.clotheStatus === ClotheStatus.ACTIVE && (
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditClothe(clothe._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton className="icon-button" onClick={() => deleteClotheHandler(clothe._id)}>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		);
};
