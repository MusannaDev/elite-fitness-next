import React from 'react';
import { Stack, Box, Typography, IconButton, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Product } from '../../types/product/product';

interface TrendProductCardProps {
	product: Product;
	likeProductHandler: any;
	rank: number;
}

const TrendProductCard = (props: TrendProductCardProps) => {
	const { product, likeProductHandler, rank } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	return (
		<Stack className="trend-product-card" direction="row" alignItems="center">
			<Box className="rank-number">
				<Typography className="rank-text">{String(rank).padStart(2, '0')}</Typography>
			</Box>

			<Box
				className="product-thumb"
				onClick={() => pushDetailHandler(product._id)}
				style={{
					backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages?.[0]})`,
				}}
			/>

			<Box className="product-info" flex={1}>
				<Typography className="product-name" onClick={() => pushDetailHandler(product._id)}>
					{product.productName}
				</Typography>
				<Typography className="product-brand">
					{product.productBrand} · {product.productWeight} · {product.productFlavor}
				</Typography>
				<Stack direction="row" gap="6px" mt="8px" flexWrap="wrap">
					{product.productCalories && (
						<Chip
							className="macro-chip"
							icon={<LocalFireDepartmentIcon style={{ fontSize: 11 }} />}
							label={`${product.productCalories} kcal`}
							size="small"
						/>
					)}
					{product.productProteinPerServing && (
						<Chip className="macro-chip protein" label={`${product.productProteinPerServing}g protein`} size="small" />
					)}
					{product.productBenefits && <Chip className="macro-chip benefit" label={product.productBenefits} size="small" />}
				</Stack>
			</Box>

			<Stack className="product-actions" alignItems="flex-end" gap="6px">
				<Typography className="product-price">${product.productPrice}</Typography>
				<Stack direction="row" alignItems="center" gap="4px">
					<IconButton size="small" className="action-btn view-btn">
						<RemoveRedEyeIcon style={{ fontSize: 14 }} />
					</IconButton>
					<Typography className="count-text">{product.productViews}</Typography>
					<IconButton
						size="small"
						className="action-btn like-btn"
						onClick={() => likeProductHandler(user, product._id)}
					>
						<FavoriteIcon
							style={{
								fontSize: 14,
								color: product?.meLiked?.[0]?.myFavorite ? '#ef4444' : undefined,
							}}
						/>
					</IconButton>
					<Typography className="count-text">{product.productLikes}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TrendProductCard;