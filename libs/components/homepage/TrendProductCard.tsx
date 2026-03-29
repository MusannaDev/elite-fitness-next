import React from 'react';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ScaleIcon from '@mui/icons-material/Scale';
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
		<Stack className="trend-product-card">
			{/* Image area — light bg, centered product shot */}
			<Box className="card-image-area" onClick={() => pushDetailHandler(product._id)}>
				<Box
					className="product-img"
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages?.[0]})` }}
				/>
				{product.productCategory && (
					<Box className="category-badge">
						<Typography>{product.productCategory}</Typography>
					</Box>
				)}
				<Box className="rank-badge">
					<Typography>{rank}</Typography>
				</Box>
			</Box>

			{/* Card body */}
			<Box className="card-body">
				<Typography className="product-name" onClick={() => pushDetailHandler(product._id)}>
					{product.productName}
				</Typography>
				<Typography className="product-brand">
					{product.productBrand}
					{product.productFlavor ? ` · ${product.productFlavor}` : ''}
				</Typography>

				{/* Macro pills */}
				<Stack direction="row" flexWrap="wrap" gap="6px" className="macro-row">
					{product.productCalories && (
						<Box className="macro-pill">
							<LocalFireDepartmentIcon style={{ fontSize: 10 }} />
							<Typography component="span">{product.productCalories} kcal</Typography>
						</Box>
					)}
					{product.productProteinPerServing && (
						<Box className="macro-pill protein">
							<Typography component="span">{product.productProteinPerServing}g protein</Typography>
						</Box>
					)}
					{product.productWeight && (
						<Box className="macro-pill weight">
							<ScaleIcon style={{ fontSize: 10 }} />
							<Typography component="span">{product.productWeight}</Typography>
						</Box>
					)}
				</Stack>

				{/* Footer: price + actions */}
				<Stack direction="row" alignItems="center" justifyContent="space-between" className="card-footer">
					<Typography className="product-price">${product.productPrice}</Typography>
					<Stack direction="row" alignItems="center" gap="4px">
						<IconButton size="small" className="ap-btn">
							<RemoveRedEyeIcon style={{ fontSize: 13 }} />
						</IconButton>
						<Typography className="ap-count">{product.productViews}</Typography>
						<IconButton
							size="small"
							className={`ap-btn ${product?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
							onClick={() => likeProductHandler(user, product._id)}
						>
							<FavoriteIcon
								style={{
									fontSize: 13,
									color: product?.meLiked?.[0]?.myFavorite ? '#ef4444' : undefined,
								}}
							/>
						</IconButton>
						<Typography className="ap-count">{product.productLikes}</Typography>
					</Stack>
				</Stack>
			</Box>
		</Stack>
	);
};

export default TrendProductCard;
