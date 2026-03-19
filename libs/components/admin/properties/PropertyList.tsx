import React from 'react';
import Link from 'next/link';
import {
	TableCell, TableHead, TableBody, TableRow,
	Table, TableContainer, Button, Menu, Fade, MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Property } from '../../../types/property/property';
import { REACT_APP_API_URL } from '../../../config';
import { PropertyStatus } from '../../../enums/property.enum';

const headCells = [
	{ id: 'id',       label: 'ID',       align: 'left' as const },
	{ id: 'title',    label: 'Title',    align: 'left' as const },
	{ id: 'price',    label: 'Price',    align: 'center' as const },
	{ id: 'agent',    label: 'Agent',    align: 'center' as const },
	{ id: 'location', label: 'Location', align: 'center' as const },
	{ id: 'type',     label: 'Type',     align: 'center' as const },
	{ id: 'status',   label: 'Status',   align: 'center' as const },
];

const statusStyle = (s: string) => {
	switch (s) {
		case 'ACTIVE': return { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.18)' };
		case 'SOLD':   return { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.18)' };
		default:       return { bg: 'var(--hover)',           color: 'var(--text-muted)', border: 'var(--border)' };
	}
};

interface PropertyPanelListType {
	properties: Property[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updatePropertyHandler: any;
	removePropertyHandler: any;
}

export const PropertyPanelList = (props: PropertyPanelListType) => {
	const { properties, anchorEl, menuIconClickHandler, menuIconCloseHandler, updatePropertyHandler, removePropertyHandler } = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} size={'medium'}>
					<TableHead>
						<TableRow>{headCells.map((c) => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}</TableRow>
					</TableHead>
					<TableBody>
						{properties.length === 0 && (
							<TableRow><TableCell align="center" colSpan={7}><Typography className={'no-data'}>No properties found</Typography></TableCell></TableRow>
						)}
						{properties.map((property: Property, index: number) => {
							const propertyImage = `${REACT_APP_API_URL}/${property?.propertyImages[0]}`;
							const ss = statusStyle(property.propertyStatus);
							return (
								<TableRow hover key={property._id} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell align="left"><Typography className={'mono-id'}>{property._id}</Typography></TableCell>
									<TableCell align="left" className={'name'}>
										{property.propertyStatus === PropertyStatus.ACTIVE ? (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Link href={`/property/detail?id=${property._id}`}>
													<Avatar src={propertyImage} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px' }} />
												</Link>
												<Link href={`/property/detail?id=${property._id}`}>
													<Typography className={'row-title'}>{property.propertyTitle}</Typography>
												</Link>
											</Stack>
										) : (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Avatar src={propertyImage} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', opacity: 0.4 }} />
												<Typography className={'row-title muted'}>{property.propertyTitle}</Typography>
											</Stack>
										)}
									</TableCell>
									<TableCell align="center"><Typography className={'price-text'}>${property.propertyPrice?.toLocaleString()}</Typography></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{property.memberData?.memberNick}</Typography></TableCell>
									<TableCell align="center"><Box className={'tag-pill stone'}>{property.propertyLocation}</Box></TableCell>
									<TableCell align="center"><Box className={'tag-pill amber'}>{property.propertyType}</Box></TableCell>
									<TableCell align="center">
										{property.propertyStatus === PropertyStatus.DELETE && (
											<Button onClick={() => removePropertyHandler(property._id)} sx={{
												minWidth: 'auto', width: 28, height: 28, p: 0, borderRadius: '6px',
												background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
												'&:hover': { background: 'rgba(239,68,68,0.15)' },
											}}>
												<DeleteIcon sx={{ fontSize: 14, color: '#DC2626' }} />
											</Button>
										)}
										{property.propertyStatus === PropertyStatus.SOLD && (
											<Button sx={{ px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
												background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
												minWidth: 'auto', textTransform: 'none', cursor: 'default' }}>
												{property.propertyStatus}
											</Button>
										)}
										{property.propertyStatus === PropertyStatus.ACTIVE && (
											<>
												<Button onClick={(e: any) => menuIconClickHandler(e, index)} sx={{
													px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
													background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
													minWidth: 'auto', textTransform: 'none', '&:hover': { opacity: 0.8 },
												}}>
													{property.propertyStatus}
												</Button>
												<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
													anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])}
													onClose={menuIconCloseHandler} TransitionComponent={Fade}>
													{Object.values(PropertyStatus).filter((e) => e !== property.propertyStatus).map((status: string) => (
														<MenuItem key={status} onClick={() => updatePropertyHandler({ _id: property._id, propertyStatus: status })}>
															<Typography variant={'subtitle1'} component={'span'}>{status}</Typography>
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