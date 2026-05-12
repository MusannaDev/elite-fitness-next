import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/product/product';
import { NEXT_PUBLIC_API_URL, topProductRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { formatProductWeight } from '../../utils/productWeight';

interface ProductBigCardProps {
	product: Product;
	likeProductHandler: any;
}

const ProductBigCard = (props: ProductBigCardProps) => {
	const { product, likeProductHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** HANDLERS **/
	const goProductDetailPage = (productId: string) => {
		router.push(`/product/detail?id=${productId}`);
	};

	if (device === 'mobile') {
		return <div>PRODUCT BIG CARD</div>;
	} else {
		return (
			<Stack className="product-big-card-box" onClick={() => goProductDetailPage(product?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${NEXT_PUBLIC_API_URL}/${product?.productImages?.[0]})` }}
				>
					{product && product?.productRank >= topProductRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>${formatterStr(product?.productPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{product?.productName}</strong>
					<p className={'desc'}>{product?.productBrand}</p>
					<div className={'options'}>
						<div>
							<FitnessCenterIcon fontSize="small" />
							<span>{formatProductWeight(product?.productWeight)}</span>
						</div>
						<div>
							<EmojiFoodBeverageIcon fontSize="small" />
							<span>{product?.productFlavor}</span>
						</div>
						<div>
							<CheckCircleOutlineIcon fontSize="small" />
							<span>{product?.productBenefits}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div>
							{product?.productCategory ? <p>{product.productCategory}</p> : <span>Category</span>}
						</div>
						<div className="buttons-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{product?.productViews}</Typography>
							<IconButton
								color={'default'}
								onClick={(e: any) => {
									e.stopPropagation();
									likeProductHandler(user, product._id);
								}}
							>
								{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{product?.productLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default ProductBigCard;
