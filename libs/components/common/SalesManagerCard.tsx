import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface SalesManagerCardProps {
	salesManager: any;
	likeMemberHandler: any;
}

const SalesManagerCard = (props: SalesManagerCardProps) => {
	const { salesManager, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = salesManager?.memberImage
		? `${REACT_APP_API_URL}/${salesManager?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>SALES MANAGER CARD</div>;
	} else {
		return (
			<Stack className="sales-manager-card">
				<Link
					href={{
						pathname: '/sales-manager/detail',
						query: { salesManagerId: salesManager?._id },
					}}
				>
					<Box
						component={'div'}
						className={'sales-manager-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>{salesManager?.memberClothes} clothes</div>
					</Box>
				</Link>

				<Stack className={'sales-manager-desc'}>
					<Box component={'div'} className={'sales-manager-info'}>
						<Link
							href={{
								pathname: '/sales-manager/detail',
								query: { salesManagerId: salesManager?._id },
							}}
						>
							<strong>{salesManager?.memberFullName ?? salesManager?.memberNick}</strong>
						</Link>
						<span>Sales Manager</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{salesManager?.memberViews}</Typography>
						<IconButton
							color={'default'}
							onClick={() => likeMemberHandler(user, salesManager?._id)}
						>
							{salesManager?.meLiked && salesManager?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{salesManager?.memberLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default SalesManagerCard;