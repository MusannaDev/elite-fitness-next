import React, { useState, useEffect, useCallback } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TrainerCardProps {
	trainer: any;
	likeMemberHandler: any;
	subscribeHandler?: any;
	unsubscribeHandler?: any;
}

const TrainerCard = (props: TrainerCardProps) => {
	const { trainer, likeMemberHandler, subscribeHandler, unsubscribeHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = trainer?.memberImage
		? `${REACT_APP_API_URL}/${trainer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const [localLiked, setLocalLiked] = useState<boolean>(
		!!(trainer?.meLiked && trainer?.meLiked[0]?.myFavorite),
	);
	const [localLikes, setLocalLikes] = useState<number>(trainer?.memberLikes || 0);
	const [isFollowing, setIsFollowing] = useState<boolean>(
		!!(trainer?.meFollowed && trainer?.meFollowed[0]?.myFollowing),
	);

	/** Sync with server data after refetch **/
	useEffect(() => {
		const serverLiked = !!(trainer?.meLiked && trainer?.meLiked[0]?.myFavorite);
		setLocalLiked(serverLiked);
		setLocalLikes(trainer?.memberLikes || 0);
	}, [trainer?.meLiked, trainer?.memberLikes]);

	useEffect(() => {
		const serverFollowing = !!(trainer?.meFollowed && trainer?.meFollowed[0]?.myFollowing);
		setIsFollowing(serverFollowing);
	}, [trainer?.meFollowed]);

	const handleLikeClick = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const newLiked = !localLiked;
			setLocalLiked(newLiked);
			setLocalLikes((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

			try {
				await likeMemberHandler(user, trainer?._id);
			} catch (err) {
				setLocalLiked(!newLiked);
				setLocalLikes((prev) => (!newLiked ? prev + 1 : Math.max(0, prev - 1)));
			}
		},
		[localLiked, trainer?._id, user, likeMemberHandler],
	);

	const handleFollowClick = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const wasFollowing = isFollowing;
			setIsFollowing(!wasFollowing);

			try {
				if (wasFollowing && unsubscribeHandler) {
					await unsubscribeHandler(trainer?._id);
				} else if (!wasFollowing && subscribeHandler) {
					await subscribeHandler(trainer?._id);
				}
			} catch (err) {
				setIsFollowing(wasFollowing);
			}
		},
		[isFollowing, trainer?._id, subscribeHandler, unsubscribeHandler],
	);

	if (device === 'mobile') {
		return <div>TRAINER CARD</div>;
	} else {
		return (
			<Stack className="trainer-general-card">
				<Box component={'div'} className={'card-media'}>
					<Link
						href={{
							pathname: '/trainer/detail',
							query: { trainerId: trainer?._id },
						}}
					>
						<Box
							component={'div'}
							className={'trainer-img'}
							style={{
								backgroundImage: `url(${imagePath})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
							}}
						/>
					</Link>

					<div className={'product-badge'}>
						<span>{trainer?.memberProducts}</span> products
					</div>

					<IconButton className={'like-btn-float'} onClick={handleLikeClick}>
						{localLiked ? (
							<FavoriteIcon className="liked" />
						) : (
							<FavoriteBorderIcon />
						)}
					</IconButton>
				</Box>

				<Stack className={'card-body'}>
					<Box component={'div'} className={'trainer-identity'}>
						<Link
							href={{
								pathname: '/trainer/detail',
								query: { trainerId: trainer?._id },
							}}
						>
							<Typography className="trainer-name">
								{trainer?.memberFullName ?? trainer?.memberNick}
							</Typography>
						</Link>
						<Typography className="trainer-role">Professional Trainer</Typography>
					</Box>

					<Box component={'div'} className={'card-stats'}>
						<div className={'stat-item'}>
							<RemoveRedEyeIcon />
							<span>{trainer?.memberViews}</span>
						</div>
						<div className={'stat-divider'} />
						<div className={'stat-item'}>
							<FavoriteIcon />
							<span>{localLikes}</span>
						</div>
					</Box>

					{user?._id !== trainer?._id && (
						<button
							className={`follow-btn ${isFollowing ? 'followed' : ''}`}
							onClick={handleFollowClick}
						>
							{isFollowing ? (
								<>
									<HowToRegIcon />
									<span>Followed</span>
								</>
							) : (
								<>
									<PersonAddAlt1Icon />
									<span>Follow</span>
								</>
							)}
						</button>
					)}
				</Stack>
			</Stack>
		);
	}
};

export default TrainerCard;