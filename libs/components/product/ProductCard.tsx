import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EggAltIcon from '@mui/icons-material/EggAlt';
import { Product } from '../../types/product/product';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { addBasketItem } from '../../utils/basket';
import { BasketItem } from '../../types/order/cart';
import { OrderItemType } from '../../enums/order.enum';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

// ─── localStorage helpers for persistent likes ───────────────────────────────
const LIKES_STORAGE_KEY = 'product_likes';

const getLikedProducts = (): Record<string, boolean> => {
	try {
		const stored = localStorage.getItem(LIKES_STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
};

const setLikedProduct = (productId: string, liked: boolean): void => {
	try {
		const current = getLikedProducts();
		if (liked) {
			current[productId] = true;
		} else {
			delete current[productId];
		}
		localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(current));
	} catch {
		// localStorage unavailable — fail silently
	}
};

const isProductLiked = (productId: string): boolean => {
	return !!getLikedProducts()[productId];
};

// ─────────────────────────────────────────────────────────────────────────────

interface ProductCardType {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const ProductCard = (props: ProductCardType) => {
	const { product, likeProductHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	const addToCartHandler = () => {
		const item: BasketItem = {
			_id: product._id,
			name: product.productName,
			image: product.productImages?.[0],
			price: product.productPrice,
			quantity: 1,
			itemType: OrderItemType.PRODUCT,
		};
		addBasketItem(item);
		sweetTopSmallSuccessAlert('Added to cart!', 700);
	};
	const imagePath: string = product?.productImages[0]
		? `${REACT_APP_API_URL}/${product?.productImages[0]}`
		: '/img/banner/header1.svg';

	// Determine initial liked state: localStorage first, then server, then myFavorites
	const getInitialLiked = (): boolean => {
		if (myFavorites) return true;
		// localStorage is the source of truth for UI persistence
		const localLike = isProductLiked(product?._id);
		const serverLike = !!(product?.meLiked && product?.meLiked[0]?.myFavorite);
		return localLike || serverLike;
	};

	const [localLiked, setLocalLiked] = useState<boolean>(getInitialLiked);
	const [localLikes, setLocalLikes] = useState<number>(product?.productLikes || 0);

	// Sync localStorage when server data changes (e.g. after navigation back)
	useEffect(() => {
		const serverLiked = !!(product?.meLiked && product?.meLiked[0]?.myFavorite);
		const storedLiked = isProductLiked(product?._id);

		// If server says liked but localStorage doesn't have it, update localStorage
		if (serverLiked && !storedLiked) {
			setLikedProduct(product?._id, true);
		}

		// Update UI state
		const shouldBeLiked = myFavorites ? true : storedLiked || serverLiked;
		setLocalLiked(shouldBeLiked);
		setLocalLikes(product?.productLikes || 0);
	}, [product?._id, product?.meLiked, product?.productLikes, myFavorites]);

	const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const newLiked = !localLiked;

		// 1. Update UI instantly
		setLocalLiked(newLiked);
		setLocalLikes((prev) => (newLiked ? prev + 1 : prev - 1));

		// 2. Persist to localStorage
		setLikedProduct(product?._id, newLiked);

		// 3. Send to server
		likeProductHandler(user, product?._id);
	}, [localLiked, product?._id, user, likeProductHandler]);

	if (device === 'mobile') {
		return <div>PRODUCT CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				{/* ─── IMAGE SECTION (full-bleed background) ─── */}
				<Stack className="top">
					<Link
						href={{
							pathname: '/product/detail',
							query: { id: product?._id },
						}}
					>
						<img src={imagePath} alt={product?.productName} />
					</Link>

					{/* Action buttons — right side, always visible */}
					<div className="card-actions">
						<Link
							href={{
								pathname: '/product/detail',
								query: { id: product?._id },
							}}
						>
							<button className="action-btn" title="View details">
								<RemoveRedEyeIcon />
								{!!product?.productViews && (
									<span className="action-badge">{product?.productViews}</span>
								)}
							</button>
						</Link>

						{!recentlyVisited && (
							<button
								className={`action-btn${localLiked ? ' liked' : ''}`}
								title="Favorite"
								onClick={handleLikeClick}
							>
								{localLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								{!!localLikes && (
									<span className="action-badge">{localLikes}</span>
								)}
							</button>
						)}
					</div>

					{/* TOP badge */}
					{product && product?.productRank > topProductRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}

					{/* Bestseller badge */}
					{product?.isBestseller && (
						<Box component={'div'} className={'bestseller-badge'}>
							<Typography>BESTSELLER</Typography>
						</Box>
					)}
				</Stack>

				{/* ─── BOTTOM INFO (overlay on image) ─── */}
				<Stack className="bottom">
					{/* Action icons — top-right of bottom panel */}
					<div className="footer-actions">
						<Link
							href={{
								pathname: '/product/detail',
								query: { id: product?._id },
							}}
						>
							<button className="action-btn" title="View details">
								<RemoveRedEyeIcon />
								{!!product?.productViews && (
									<span className="action-badge">{product?.productViews}</span>
								)}
							</button>
						</Link>

						{!recentlyVisited && (
							<button
								className={`action-btn${localLiked ? ' liked' : ''}`}
								title="Favorite"
								onClick={handleLikeClick}
							>
								{localLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								{!!localLikes && (
									<span className="action-badge">{localLikes}</span>
								)}
							</button>
						)}
					</div>

					<Stack className="name-address">
						<Stack className="brand">
							<Typography>{product.productBrand}</Typography>
						</Stack>
						<Stack className="name">
							<Link
								href={{
									pathname: '/product/detail',
									query: { id: product?._id },
								}}
							>
								<Typography>{product.productName}</Typography>
							</Link>
						</Stack>
					</Stack>

					<Stack className="price-row">
						<Typography className="price-value">
							$ {formatterStr(product?.productPrice)}
						</Typography>
					</Stack>

					<Stack className="specs-row">
						<Stack className="spec-item">
							<FitnessCenterIcon fontSize="small" />
							<Typography>{product.productWeight}</Typography>
						</Stack>
						<span className="spec-dot" />
						<Stack className="spec-item">
							<LocalFireDepartmentIcon fontSize="small" />
							<Typography>{product.productCalories} kcal</Typography>
						</Stack>
						<span className="spec-dot" />
						<Stack className="spec-item">
							<EggAltIcon fontSize="small" />
							<Typography>{product.productProteinPerServing}g protein</Typography>
						</Stack>
					</Stack>

					<Stack className="card-footer">
						<Stack className="tag-group">
							<span className="card-tag">{product.productFlavor}</span>
							<span className="card-tag">{product.productBenefits}</span>
						</Stack>
						{!recentlyVisited && (
							<button className="cart-btn" onClick={addToCartHandler}>
								<AddShoppingCartIcon />
								<span>Add to Cart</span>
							</button>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default ProductCard;