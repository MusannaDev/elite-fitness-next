import React from 'react';
import Link from 'next/link';
import { TableCell, TableHead, TableBody, TableRow, Table, TableContainer, Button, Menu, Fade, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NEXT_PUBLIC_API_URL } from '../../../config';
import { EquipmentStatus } from '../../../enums/equipment.enum';
import { Equipment } from '../../../types/equipment/equipment';

const headCells = [
	{ id: 'id',       label: 'ID',        align: 'left' as const },
	{ id: 'eq',       label: 'Equipment', align: 'left' as const },
	{ id: 'brand',    label: 'Brand',     align: 'center' as const },
	{ id: 'price',    label: 'Price',     align: 'center' as const },
	{ id: 'category', label: 'Category',  align: 'center' as const },
	{ id: 'location', label: 'Location',  align: 'center' as const },
	{ id: 'material', label: 'Material',  align: 'center' as const },
	{ id: 'capacity', label: 'Capacity',  align: 'center' as const },
	{ id: 'stock',    label: 'Stock',     align: 'center' as const },
	{ id: 'status',   label: 'Status',    align: 'center' as const },
];

const statusStyle = (s: string) => {
	switch (s) {
		case 'ACTIVE': return { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.18)' };
		case 'SOLD':   return { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.18)' };
		default:       return { bg: 'var(--hover)',           color: 'var(--text-muted)', border: 'var(--border)' };
	}
};

interface EquipmentPanelListType {
	equipments: Equipment[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateEquipmentHandler: any;
	removeEquipmentHandler: any;
}

export const EquipmentPanelList = ({ equipments, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateEquipmentHandler, removeEquipmentHandler }: EquipmentPanelListType) => {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 1050 }} size={'medium'}>
					<TableHead>
						<TableRow>{headCells.map((c) => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}</TableRow>
					</TableHead>
					<TableBody>
						{equipments.length === 0 && (
							<TableRow><TableCell align="center" colSpan={10}><Typography className={'no-data'}>No equipments found</Typography></TableCell></TableRow>
						)}
						{equipments.map((eq: Equipment, index: number) => {
							const img = eq?.equipmentImages?.[0] ? `${NEXT_PUBLIC_API_URL}/${eq.equipmentImages[0]}` : '/img/profile/defaultUser.svg';
							const ss = statusStyle(eq.equipmentStatus);
							return (
								<TableRow hover key={eq._id} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell><Typography className={'mono-id'}>{eq._id?.slice(-8)}</Typography></TableCell>
									<TableCell className={'name'}>
										{eq.equipmentStatus === EquipmentStatus.ACTIVE ? (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Link href={`/equipment/detail?id=${eq._id}`}><Avatar src={img} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', border: '1.5px solid var(--glass-border)' }} /></Link>
												<Link href={`/equipment/detail?id=${eq._id}`}><Typography className={'row-title'}>{eq.equipmentName}</Typography></Link>
											</Stack>
										) : (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Avatar src={img} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', opacity: 0.4 }} />
												<Typography className={'row-title muted'}>{eq.equipmentName}</Typography>
											</Stack>
										)}
									</TableCell>
									<TableCell align="center"><Box className={'tag-pill amber'}>{eq.equipmentBrand}</Box></TableCell>
									<TableCell align="center"><Typography className={'price-text'}>${eq.equipmentPrice?.toLocaleString()}</Typography></TableCell>
									<TableCell align="center"><Box className={'tag-pill stone'}>{eq.equipmentCategory}</Box></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{eq.equipmentLocation}</Typography></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{eq.equipmentMaterial}</Typography></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{eq.equipmentWeightCapacity ?? '—'}</Typography></TableCell>
									<TableCell align="center">
										<Box sx={{
											display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
											minWidth: 26, height: 22, borderRadius: '5px', px: '5px',
											background: eq.equipmentLeftCount > 5 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
											border: `1px solid ${eq.equipmentLeftCount > 5 ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
											fontSize: '11px', fontWeight: 700,
											color: eq.equipmentLeftCount > 5 ? '#16A34A' : '#DC2626',
										}}>{eq.equipmentLeftCount}</Box>
									</TableCell>
									<TableCell align="center">
										{eq.equipmentStatus === EquipmentStatus.DELETE && (
											<Button onClick={() => removeEquipmentHandler(eq._id)} sx={{
												minWidth: 'auto', width: 28, height: 28, p: 0, borderRadius: '6px',
												background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
												'&:hover': { background: 'rgba(239,68,68,0.15)' },
											}}>
												<DeleteIcon sx={{ fontSize: 14, color: '#DC2626' }} />
											</Button>
										)}
										{eq.equipmentStatus !== EquipmentStatus.DELETE && (
											<>
												<Button onClick={(e: any) => menuIconClickHandler(e, index)} sx={{
													px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
													background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
													minWidth: 'auto', letterSpacing: '0.04em', textTransform: 'none',
													'&:hover': { opacity: 0.8 },
												}}>
													{eq.equipmentStatus}
												</Button>
												<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
													anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])}
													onClose={menuIconCloseHandler} TransitionComponent={Fade}>
													{Object.values(EquipmentStatus).filter((e) => e !== eq.equipmentStatus).map((s: string) => (
														<MenuItem key={s} onClick={() => updateEquipmentHandler({ _id: eq._id, equipmentStatus: s })}>
															<Typography variant={'subtitle1'} component={'span'}>{s}</Typography>
														</MenuItem>
													))}
												</Menu>
											</>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};