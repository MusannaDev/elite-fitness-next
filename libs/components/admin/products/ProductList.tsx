import React from 'react';
import Link from 'next/link';
import { TableCell, TableHead, TableBody, TableRow, Table, TableContainer, Button, Menu, Fade, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NEXT_PUBLIC_API_URL } from '../../../config';
import { ProductStatus } from '../../../enums/product.enum';
import { Product } from '../../../types/product/product';
import { formatProductWeight } from '../../../utils/productWeight';

const headCells = [
	{ id: 'id',       label: 'ID',       align: 'left' as const },
	{ id: 'product',  label: 'Product',  align: 'left' as const },
	{ id: 'brand',    label: 'Brand',    align: 'center' as const },
	{ id: 'price',    label: 'Price',    align: 'center' as const },
	{ id: 'category', label: 'Category', align: 'center' as const },
	{ id: 'weight',   label: 'Weight',   align: 'center' as const },
	{ id: 'flavor',   label: 'Flavor',   align: 'center' as const },
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

interface ProductPanelListType {
	products: Product[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateProductHandler: any;
	removeProductHandler: any;
}

export const ProductPanelList = ({ products, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateProductHandler, removeProductHandler }: ProductPanelListType) => {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 950 }} size={'medium'}>
					<TableHead>
						<TableRow>{headCells.map((c) => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}</TableRow>
					</TableHead>
					<TableBody>
						{products.length === 0 && (
							<TableRow><TableCell align="center" colSpan={9}><Typography className={'no-data'}>No products found</Typography></TableCell></TableRow>
						)}
						{products.map((product: Product, index: number) => {
							const img = product?.productImages?.[0] ? `${NEXT_PUBLIC_API_URL}/${product.productImages[0]}` : '/img/profile/defaultUser.svg';
							const ss = statusStyle(product.productStatus);
							return (
								<TableRow hover key={product._id} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell><Typography className={'mono-id'}>{product._id?.slice(-8)}</Typography></TableCell>
									<TableCell className={'name'}>
										{product.productStatus === ProductStatus.ACTIVE ? (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Link href={`/product/detail?id=${product._id}`}><Avatar src={img} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', border: '1.5px solid var(--glass-border)' }} /></Link>
												<Link href={`/product/detail?id=${product._id}`}><Typography className={'row-title'}>{product.productName}</Typography></Link>
											</Stack>
										) : (
											<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
												<Avatar src={img} variant="rounded" sx={{ width: 32, height: 32, borderRadius: '7px', opacity: 0.4 }} />
												<Typography className={'row-title muted'}>{product.productName}</Typography>
											</Stack>
										)}
									</TableCell>
									<TableCell align="center"><Box className={'tag-pill amber'}>{product.productBrand}</Box></TableCell>
									<TableCell align="center"><Typography className={'price-text'}>${product.productPrice?.toLocaleString()}</Typography></TableCell>
									<TableCell align="center"><Box className={'tag-pill stone'}>{product.productCategory}</Box></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{formatProductWeight(product.productWeight)}</Typography></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{product.productFlavor}</Typography></TableCell>
									<TableCell align="center">
										<Box sx={{
											display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
											minWidth: 26, height: 22, borderRadius: '5px', px: '5px',
											background: product.productLeftCount > 5 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
											border: `1px solid ${product.productLeftCount > 5 ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
											fontSize: '11px', fontWeight: 700,
											color: product.productLeftCount > 5 ? '#16A34A' : '#DC2626',
										}}>{product.productLeftCount}</Box>
									</TableCell>
									<TableCell align="center">
										{product.productStatus === ProductStatus.DELETE && (
											<Button onClick={() => removeProductHandler(product._id)} sx={{
												minWidth: 'auto', width: 28, height: 28, p: 0, borderRadius: '6px',
												background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
												'&:hover': { background: 'rgba(239,68,68,0.15)' },
											}}>
												<DeleteIcon sx={{ fontSize: 14, color: '#DC2626' }} />
											</Button>
										)}
										{product.productStatus !== ProductStatus.DELETE && (
											<>
												<Button onClick={(e: any) => menuIconClickHandler(e, index)} sx={{
													px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
													background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
													minWidth: 'auto', letterSpacing: '0.04em', textTransform: 'none',
													'&:hover': { opacity: 0.8 },
												}}>
													{product.productStatus}
												</Button>
												<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
													anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])}
													onClose={menuIconCloseHandler} TransitionComponent={Fade}>
													{Object.values(ProductStatus).filter((e) => e !== product.productStatus).map((s: string) => (
														<MenuItem key={s} onClick={() => updateProductHandler({ _id: product._id, productStatus: s })}>
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
