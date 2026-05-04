import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Messages } from '../../config';

const LS_KEY = (userId: string) => `trainer_follows_${userId}`;

const getLocalFollow = (userId: string, trainerId: string): boolean => {
	if (!userId || !trainerId || typeof window === 'undefined') return false;
	try {
		const stored = JSON.parse(localStorage.getItem(LS_KEY(userId)) || '{}');
		return stored[trainerId] === true;
	} catch {
		return false;
	}
};

const setLocalFollow = (userId: string, trainerId: string, following: boolean) => {
	if (!userId || !trainerId || typeof window === 'undefined') return;
	try {
		const stored = JSON.parse(localStorage.getItem(LS_KEY(userId)) || '{}');
		if (following) {
			stored[trainerId] = true;
		} else {
			delete stored[trainerId];
		}
		localStorage.setItem(LS_KEY(userId), JSON.stringify(stored));
	} catch {}
};

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
		!!(trainer?.meFollowed && trainer?.meFollowed[0]?.myFollowing) ||
		getLocalFollow(user?._id, trainer?._id),
	);
	const [localFollowers, setLocalFollowers] = useState<number>(trainer?.memberFollowers || 0);

	/** Sync with server data after refetch **/
	useEffect(() => {
		const serverLiked = !!(trainer?.meLiked && trainer?.meLiked[0]?.myFavorite);
		setLocalLiked(serverLiked);
		setLocalLikes(trainer?.memberLikes || 0);
	}, [trainer?.meLiked, trainer?.memberLikes]);

	const followInteracted = useRef(false);

	useEffect(() => {
		if (followInteracted.current) return;
		const fromServer = !!(trainer?.meFollowed && trainer?.meFollowed[0]?.myFollowing);
		const fromLocal = getLocalFollow(user?._id, trainer?._id);
		setIsFollowing(fromServer || fromLocal);
		setLocalFollowers(trainer?.memberFollowers || 0);
	}, [trainer?.meFollowed, trainer?.memberFollowers, user?._id]);

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

			if (!user._id) {
				sweetMixinErrorAlert(Messages.error2).then();
				return;
			}

			followInteracted.current = true;
			const wasFollowing = isFollowing;
			setIsFollowing(!wasFollowing);
			setLocalFollowers((prev) => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));

			try {
				if (wasFollowing && unsubscribeHandler) {
					await unsubscribeHandler(trainer?._id);
				} else if (!wasFollowing && subscribeHandler) {
					await subscribeHandler(trainer?._id);
				}
				setLocalFollow(user._id, trainer?._id, !wasFollowing);
			} catch (err) {
				setIsFollowing(wasFollowing);
				setLocalFollowers((prev) => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
			}
		},
		[isFollowing, trainer?._id, user, subscribeHandler, unsubscribeHandler],
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

					<IconButton type="button" className={'like-btn-float'} onClick={handleLikeClick}>
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
						<div className={'stat-divider'} />
						<div className={'stat-item'}>
							<PersonAddAlt1Icon />
							<span>{localFollowers}</span>
						</div>
					</Box>

					{user?._id !== trainer?._id && (
						<button
							type="button"
							className={`follow-btn ${isFollowing ? 'followed' : ''}`}
							onClick={handleFollowClick}
						>
							{isFollowing ? (
								<>
									<HowToRegIcon />
									<span>Unfollow</span>
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
