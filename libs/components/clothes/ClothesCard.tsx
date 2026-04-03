import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Clothe } from '../../types/clothes/clothes';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { addBasketItem } from '../../utils/basket';
import { BasketItem } from '../../types/order/cart';
import { OrderItemType } from '../../enums/order.enum';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface ClotheCardType {
	clothe: Clothe;
	likeClotheHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	// ClotheList dan boshqariladigan like state — server override ni oldini oladi
	likedOverride?: { liked: boolean; count: number };
}

const ClotheCard = (props: ClotheCardType) => {
	const { clothe, likeClotheHandler, myFavorites, recentlyVisited, likedOverride } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	const addToCartHandler = () => {
		const item: BasketItem = {
			_id: clothe._id,
			name: clothe.clotheName,
			image: clothe.clotheImages?.[0],
			price: clothe.clothePrice,
			quantity: 1,
			itemType: OrderItemType.CLOTHES,
		};
		addBasketItem(item);
		sweetTopSmallSuccessAlert('Added to cart!', 700);
	};

	const imagePath: string = clothe?.clotheImages[0]
		? `${REACT_APP_API_URL}/${clothe?.clotheImages[0]}`
		: '/img/banner/header1.svg';

	// likedOverride mavjud bo'lsa undan foydalanamiz (ClotheList boshqaradi)
	// Aks holda clothe props dan o'qiymiz (myFavorites sahifasi uchun)
	const isLiked = likedOverride
		? likedOverride.liked
		: myFavorites || !!(clothe?.meLiked && clothe?.meLiked[0]?.myFavorite);

	const likesCount = likedOverride
		? likedOverride.count
		: (clothe?.clotheLikes ?? 0);

	const onLikeClick = async () => {
		await likeClotheHandler?.(user, clothe?._id);
	};

	if (device === 'mobile') {
		return <div>CLOTHE CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				{/* ── Image top ── */}
				<Stack className="top">
					<Link href={{ pathname: '/clothes/detail', query: { id: clothe?._id } }}>
						<img src={imagePath} alt={clothe.clotheName} />
					</Link>

					<Box component={'div'} className={'card-image-overlay'} />

					{!recentlyVisited && (
						<Stack className={'card-actions'}>
							{/* Eye */}
							<Box component={'button'} className={'action-btn'} onClick={() => {}}>
								<RemoveRedEyeIcon />
								{clothe?.clotheViews > 0 && (
									<span className={'action-count'}>{clothe?.clotheViews}</span>
								)}
							</Box>

							{/* Bag */}
							<Box component={'button'} className={'action-btn'} onClick={addToCartHandler} title="Add to cart">
								<ShoppingBagOutlinedIcon />
								{clothe?.clotheLeftCount !== undefined && clothe?.clotheLeftCount > 0 && (
									<span className={'action-count'}>{clothe?.clotheLeftCount}</span>
								)}
							</Box>

							{/* Like — isLiked va likesCount to'g'ridan-to'g'ri props dan keladi */}
							<Box
								component={'button'}
								className={`action-btn${isLiked ? ' is-liked' : ''}`}
								onClick={onLikeClick}
							>
								{isLiked ? (
									<FavoriteIcon sx={{ color: '#fff !important' }} />
								) : (
									<FavoriteBorderIcon />
								)}
								{likesCount > 0 && (
									<span className={'action-count'}>{likesCount}</span>
								)}
							</Box>
						</Stack>
					)}

					{clothe?.isBestseller && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>BEST</Typography>
						</Box>
					)}
				</Stack>

				{/* ── Info bottom ── */}
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="address">
							<Typography>{clothe.clotheBrand}</Typography>
						</Stack>
						<Stack className="name">
							<Link href={{ pathname: '/clothes/detail', query: { id: clothe?._id } }}>
								<Typography>{clothe.clotheName}</Typography>
							</Link>
						</Stack>
					</Stack>

					<Box component={'div'} className={'divider'} />

					<Stack className="type-buttons">
						<Stack className="type">
							<Typography>$ {formatterStr(clothe?.clothePrice)}</Typography>
						</Stack>

						{!recentlyVisited && (
							<Box component={'button'} className={'cart-btn'} onClick={addToCartHandler}>
								<ShoppingCartOutlinedIcon />
								<span>Add to Cart</span>
							</Box>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default ClotheCard;
