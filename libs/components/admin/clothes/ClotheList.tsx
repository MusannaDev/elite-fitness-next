import React from 'react';
import Link from 'next/link';
import { TableCell, TableHead, TableBody, TableRow, Table, TableContainer, Button, Menu, Fade, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NEXT_PUBLIC_API_URL } from '../../../config';
import { ClotheStatus } from '../../../enums/clothes.enum';
import { Clothe } from '../../../types/clothes/clothes';

const headCells = [
	{ id: 'id',       label: 'ID',       align: 'left' as const },
	{ id: 'clothe',   label: 'Clothe',   align: 'left' as const },
	{ id: 'brand',    label: 'Brand',    align: 'center' as const },
	{ id: 'price',    label: 'Price',    align: 'center' as const },
	{ id: 'category', label: 'Category', align: 'center' as const },
	{ id: 'gender',   label: 'Gender',   align: 'center' as const },
	{ id: 'size',     label: 'Size',     align: 'center' as const },
	{ id: 'color',    label: 'Color',    align: 'center' as const },
	{ id: 'material', label: 'Material', align: 'center' as const },
	{ id: 'stock',    label: 'Stock',    align: 'center' as const },
	{ id: 'status',   label: 'Status',   align: 'center' as const },
];

const statusStyle = (s: string) => {
	switch (s) {
		case 'ACTIVE': return { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.18)' };
		case 'SOLD':   return { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.18)' };
		default:       return { bg: 'var(--hover)',           color: 'var(--text-muted)', border: 'var(--border)' };
	}
};

const genderStyle = (g: string) => {
	const gl = g?.toLowerCase() ?? '';
	if (gl === 'male')   return { bg: 'rgba(59,130,246,0.08)', color: '#2563EB', border: 'rgba(59,130,246,0.18)' };
	if (gl === 'female') return { bg: 'rgba(236,72,153,0.08)', color: '#DB2777', border: 'rgba(236,72,153,0.18)' };
	return { bg: 'var(--hover)', color: 'var(--text-muted)', border: 'var(--border)' };
};

interface ClothePanelListType {
	clothes: Clothe[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateClotheHandler: any;
	removeClotheHandler: any;
}

export const ClothePanelList = ({ clothes, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateClotheHandler, removeClotheHandler }: ClothePanelListType) => {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 1100 }} size={'medium'}>
					<TableHead>
						<TableRow>{headCells.map((c) => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}</TableRow>
					</TableHead>
					<TableBody>
						{clothes.length === 0 && (
							<TableRow><TableCell align="center" colSpan={11}><Typography className={'no-data'}>No clothes found</Typography></TableCell></TableRow>
						)}
						{clothes.map((clothe: Clothe, index: number) => {
							const img = clothe?.clotheImages?.[0] ? `${NEXT_PUBLIC_API_URL}/${clothe.clotheImages[0]}` : '/img/profile/defaultUser.svg';
							const ss = statusStyle(clothe.clotheStatus);
							const gs = genderStyle(clothe.clotheGender);
							return (
								<TableRow hover key={clothe._id} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell><Typography className={'mono-id'}>{clothe._id?.slice(-8)}</Typography></TableCell>
									<TableCell className={'name'}>
										{clothe.clotheStatus === ClotheStatus.ACTIVE ? (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Link href={`/clothes/detail?id=${clothe._id}`}><Avatar src={img} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', border: '1.5px solid var(--glass-border)' }} /></Link>
												<Link href={`/clothes/detail?id=${clothe._id}`}><Typography className={'row-title'}>{clothe.clotheName}</Typography></Link>
											</Stack>
										) : (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Avatar src={img} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', opacity: 0.4 }} />
												<Typography className={'row-title muted'}>{clothe.clotheName}</Typography>
											</Stack>
										)}
									</TableCell>
									<TableCell align="center"><Box className={'tag-pill amber'}>{clothe.clotheBrand}</Box></TableCell>
									<TableCell align="center"><Typography className={'price-text'}>${clothe.clothePrice?.toLocaleString()}</Typography></TableCell>
									<TableCell align="center"><Box className={'tag-pill stone'}>{clothe.clotheCategory}</Box></TableCell>
									<TableCell align="center">
										<Box sx={{
											display: 'inline-block', px: '7px', py: '2px', borderRadius: '5px',
											fontSize: '10px', fontWeight: 700,
											background: gs.bg, border: `1px solid ${gs.border}`, color: gs.color,
										}}>{clothe.clotheGender}</Box>
									</TableCell>
									<TableCell align="center"><Box className={'tag-pill stone'}>{clothe.clotheSize}</Box></TableCell>
									<TableCell align="center">
										<Stack direction={'row'} alignItems={'center'} justifyContent={'center'} gap={'5px'}>
											<Box sx={{ width: 9, height: 9, borderRadius: '50%', background: clothe.clotheColor?.toLowerCase(), border: '1px solid rgba(28,25,23,0.1)', flexShrink: 0 }} />
											<Typography className={'meta-text'}>{clothe.clotheColor}</Typography>
										</Stack>
									</TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{clothe.clotheMaterial}</Typography></TableCell>
									<TableCell align="center">
										<Box sx={{
											display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
											minWidth: 26, height: 22, borderRadius: '5px', px: '5px',
											background: clothe.clotheLeftCount > 5 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
											border: `1px solid ${clothe.clotheLeftCount > 5 ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
											fontSize: '11px', fontWeight: 700,
											color: clothe.clotheLeftCount > 5 ? '#16A34A' : '#DC2626',
										}}>{clothe.clotheLeftCount}</Box>
									</TableCell>
									<TableCell align="center">
										{clothe.clotheStatus === ClotheStatus.DELETE && (
											<Button onClick={() => removeClotheHandler(clothe._id)} sx={{
												minWidth: 'auto', width: 28, height: 28, p: 0, borderRadius: '6px',
												background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
												'&:hover': { background: 'rgba(239,68,68,0.15)' },
											}}>
												<DeleteIcon sx={{ fontSize: 14, color: '#DC2626' }} />
											</Button>
										)}
										{clothe.clotheStatus !== ClotheStatus.DELETE && (
											<>
												<Button onClick={(e: any) => menuIconClickHandler(e, index)} sx={{
													px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
													background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
													minWidth: 'auto', letterSpacing: '0.04em', textTransform: 'none',
													'&:hover': { opacity: 0.8 },
												}}>
													{clothe.clotheStatus}
												</Button>
												<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
													anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])}
													onClose={menuIconCloseHandler} TransitionComponent={Fade}>
													{Object.values(ClotheStatus).filter((e) => e !== clothe.clotheStatus).map((s: string) => (
														<MenuItem key={s} onClick={() => updateClotheHandler({ _id: clothe._id, clotheStatus: s })}>
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
