import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Equipment } from '../../types/equipment/equipment';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { EquipmentStatus } from '../../enums/equipment.enum';

interface EquipmentCardProps {
	equipment: Equipment;
	deleteEquipmentHandler?: any;
	memberPage?: boolean;
	updateEquipmentHandler?: any;
	likeEquipmentHandler?: any;
}

export const EquipmentCard = (props: EquipmentCardProps) => {
	const { equipment, deleteEquipmentHandler, memberPage, updateEquipmentHandler, likeEquipmentHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditEquipment = async (id: string) => {
		console.log('+pushEditEquipment: ', id);
		await router.push({
			pathname: '/mypage',
			query: { category: 'addEquipment', equipmentId: id },
		});
	};

	const pushEquipmentDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/equipment/detail',
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

	if (device === 'mobile') {
		return <div>MOBILE EQUIPMENT CARD</div>;
	} else
		return (
			<Stack className="equipment-card-box">
				<Stack className="image-box" onClick={() => pushEquipmentDetail(equipment?._id)}>
					<img src={`${process.env.REACT_APP_API_URL}/${equipment.equipmentImages[0]}`} alt="" />
				</Stack>
				<Stack className="information-box" onClick={() => pushEquipmentDetail(equipment?._id)}>
					<Typography className="name">{equipment.equipmentName}</Typography>
					<Typography className="price">
						<strong>${formatterStr(equipment?.equipmentPrice)}</strong>
					</Typography>
					{equipment.equipmentWeightCapacity && (
						<Typography className="weight-capacity">
							{equipment.equipmentWeightCapacity}
						</Typography>
					)}
				</Stack>
				<Stack className="category-box">
					<Typography className="category-badge">
						{formatCategory(equipment.equipmentCategory)}
					</Typography>
				</Stack>
				<Stack className="material-box">
					<Typography className="material">
						{formatCategory(equipment.equipmentMaterial)}
					</Typography>
				</Stack>
				<Stack className="status-box">
					<Stack
						className="coloured-box"
						sx={{
							background:
								equipment.equipmentStatus === 'ACTIVE'
									? '#E5F0FD'
									: equipment.equipmentStatus === 'SOLD'
									? '#FFF3E0'
									: '#FFEBEE',
						}}
						onClick={handleClick}
					>
						<Typography
							className="status"
							sx={{
								color:
									equipment.equipmentStatus === 'ACTIVE'
										? '#3554d1'
										: equipment.equipmentStatus === 'SOLD'
										? '#E65100'
										: '#C62828',
							}}
						>
							{equipment.equipmentStatus}
						</Typography>
					</Stack>
				</Stack>
				{!memberPage && equipment.equipmentStatus !== 'SOLD' && (
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
						{equipment.equipmentStatus === 'ACTIVE' && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateEquipmentHandler(EquipmentStatus.SOLD, equipment?._id);
								}}
							>
								Sold
							</MenuItem>
						)}
					</Menu>
				)}

				<Stack className="views-box">
					<Typography className="views">{equipment.equipmentViews.toLocaleString()}</Typography>
				</Stack>
				{!memberPage && equipment.equipmentStatus === EquipmentStatus.ACTIVE && (
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditEquipment(equipment._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton className="icon-button" onClick={() => deleteEquipmentHandler(equipment._id)}>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		);
};