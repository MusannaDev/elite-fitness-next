import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography, Chip, Box, Rating } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import MedicationLiquidOutlinedIcon from '@mui/icons-material/MedicationLiquidOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

const MemberProducts: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>({ ...initialInput });
	const [trainerProducts, setTrainerProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	const { loading, refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTrainerProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => { refetch().then(); }, [searchFilter]);
	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') return <div>MEMBER PRODUCTS MOBILE</div>;

	return (
		<div id="member-products-page">

			{/* ── Glass header ── */}
			<Stack className="mpr-glass-header">
				<Stack className="mpr-header-left">
					<Box className="mpr-header-icon-wrap">
						<MedicationLiquidOutlinedIcon />
					</Box>
					<Box>
						<Typography className="mpr-page-title">Supplement & Products</Typography>
						<Typography className="mpr-page-sub">
							{loading ? 'Loading…' : total > 0 ? `${total} items available` : 'No products yet'}
						</Typography>
					</Box>
				</Stack>
				<Chip
					icon={<StorefrontOutlinedIcon />}
					label={`${total} Products`}
					className="mpr-total-chip"
					size="small"
				/>
			</Stack>

			{/* ── Column header ── */}
			{trainerProducts.length > 0 && (
				<Stack className="mpr-col-header">
					<Typography className="mpr-th th-product">Product</Typography>
					<Typography className="mpr-th th-category">Category</Typography>
					<Typography className="mpr-th th-price">Price</Typography>
					<Typography className="mpr-th th-stock">Stock</Typography>
					<Typography className="mpr-th th-rating">Rating</Typography>
				</Stack>
			)}

			{/* ── Skeleton ── */}
			{loading && (
				<Stack className="mpr-skeleton-list">
					{[1, 2, 3].map((i) => <Box key={i} className="mpr-skeleton-row" />)}
				</Stack>
			)}

			{/* ── Empty state ── */}
			{!loading && trainerProducts.length === 0 && (
				<Stack className="mpr-empty">
					<Box className="mpr-empty-icon-wrap">
						<MedicationLiquidOutlinedIcon />
					</Box>
					<Typography className="mpr-empty-title">No Products Yet</Typography>
					<Typography className="mpr-empty-desc">This trainer hasn't listed any products.</Typography>
				</Stack>
			)}

			{/* ── Product rows ── */}
			{!loading && (
				<Stack className="mpr-list">
					{trainerProducts.map((product: Product) => (
						<Stack
							key={product._id}
							className="mpr-row"
							onClick={() => router.push(`/product?id=${product._id}`)}
						>
							{/* ① Name + Supplement icon */}
							<Stack className="mpr-cell th-product">
								<Box className="mpr-icon-wrap">
									<MedicationLiquidOutlinedIcon className="mpr-supp-icon" />
								</Box>
								<Box className="mpr-info">
									<Typography className="mpr-name">{product.productName}</Typography>
									<Typography className="mpr-desc">
										{product?.productDesc ? product.productDesc.slice(0, 48) + (product.productDesc.length > 48 ? '…' : '') : ''}
									</Typography>
								</Box>
							</Stack>

							{/* ② Category */}
							<Stack className="mpr-cell th-category">
								<Chip
									icon={<LocalOfferOutlinedIcon />}
									label={product.productCategory}
									size="small"
									className="mpr-cat-chip"
								/>
							</Stack>

							{/* ③ Price */}
							<Stack className="mpr-cell th-price">
								<Typography className="mpr-price">${product.productPrice?.toLocaleString()}</Typography>
							</Stack>

							{/* ④ Stock */}
							<Stack className="mpr-cell th-stock">
								<Box className={`mpr-stock ${product.productLeftCount > 0 ? 'in' : 'out'}`}>
									{product.productLeftCount > 0 ? `${product.productLeftCount} left` : 'Sold Out'}
								</Box>
							</Stack>

							{/* ⑤ Rating */}
							<Stack className="mpr-cell th-rating">
								<Rating value={product?.productRank ?? 0} readOnly size="small" precision={0.5} />
								<Typography className="mpr-rating-val">({product?.productRank ?? 0})</Typography>
							</Stack>
						</Stack>
					))}
				</Stack>
			)}

			{/* ── Pagination ── */}
			{trainerProducts.length > 0 && (
				<Stack className="mpr-pagination">
					<Pagination
						count={Math.ceil(total / searchFilter.limit)}
						page={searchFilter.page}
						shape="rounded"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography className="mpr-page-label">{total} products total</Typography>
				</Stack>
			)}
		</div>
	);
};

MemberProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		search: { memberId: '' },
	},
};

export default MemberProducts;