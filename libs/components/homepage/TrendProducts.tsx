import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import TrendProductCard from './TrendProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';

interface TrendProductsProps {
	initialInput: ProductsInquiry;
}

const TrendProducts = (props: TrendProductsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [trendProducts, setTrendProducts] = useState<Product[]>([]);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTrendProducts(data?.getProducts?.list);
		},
	});

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { input: id } });
			await getProductsRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!trendProducts) return null;

	if (device === 'mobile') {
		return (
			<Stack className="trend-products">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">This Week</Typography>
						<Typography className="section-title">Trending Supplements</Typography>
					</Stack>
					<Stack className="product-list">
						{trendProducts.map((product, index) => (
							<TrendProductCard
								key={product._id}
								product={product}
								likeProductHandler={likeProductHandler}
								rank={index + 1}
							/>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="trend-products">
			<Stack className="container">
				<Stack className="info-box">
					<Stack className="info-row-top">
						<Typography className="section-label">— TOP PICKS</Typography>
						<Link href="/product">
							<Box className="more-box">
								<Typography>All Products</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Stack>
					<Box className="info-divider" />
					<Typography className="section-title">Fuel Your Gains</Typography>
					<Typography className="section-sub">Based on weekly purchases & ratings</Typography>
				</Stack>

				{trendProducts.length === 0 ? (
					<Box className="empty-list">
						<Typography>No trending products yet</Typography>
					</Box>
				) : (
					<Box className="product-grid">
						{trendProducts.map((product, index) => (
							<TrendProductCard
								key={product._id}
								product={product}
								likeProductHandler={likeProductHandler}
								rank={index + 1}
							/>
						))}
					</Box>
				)}
			</Stack>
		</Stack>
	);
};

TrendProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'productViews',
		direction: 'DESC',
		search: {},
	},
};

export default TrendProducts;
