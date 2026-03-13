import React, { useState, useEffect, useCallback } from 'react';
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

// ─── localStorage helpers for persistent likes ───────────────────────────────
const TRAINER_LIKES_KEY = 'trainer_likes';

const getTrainerLikes = (): Record<string, boolean> => {
	try {
		const stored = localStorage.getItem(TRAINER_LIKES_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
};

const setTrainerLike = (trainerId: string, liked: boolean): void => {
	try {
		const current = getTrainerLikes();
		if (liked) {
			current[trainerId] = true;
		} else {
			delete current[trainerId];
		}
		localStorage.setItem(TRAINER_LIKES_KEY, JSON.stringify(current));
	} catch {}
};

const isTrainerLiked = (trainerId: string): boolean => {
	return !!getTrainerLikes()[trainerId];
};
// ─────────────────────────────────────────────────────────────────────────────

interface TrainerCardProps {
	trainer: any;
	likeMemberHandler: any;
}

const TrainerCard = (props: TrainerCardProps) => {
	const { trainer, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = trainer?.memberImage
		? `${REACT_APP_API_URL}/${trainer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const getInitialLiked = (): boolean => {
		const localLike = isTrainerLiked(trainer?._id);
		const serverLike = !!(trainer?.meLiked && trainer?.meLiked[0]?.myFavorite);
		return localLike || serverLike;
	};

	const [localLiked, setLocalLiked] = useState<boolean>(getInitialLiked);
	const [localLikes, setLocalLikes] = useState<number>(trainer?.memberLikes || 0);

	useEffect(() => {
		const serverLiked = !!(trainer?.meLiked && trainer?.meLiked[0]?.myFavorite);
		const storedLiked = isTrainerLiked(trainer?._id);

		if (serverLiked && !storedLiked) {
			setTrainerLike(trainer?._id, true);
		}

		setLocalLiked(storedLiked || serverLiked);
		setLocalLikes(trainer?.memberLikes || 0);
	}, [trainer?._id, trainer?.meLiked, trainer?.memberLikes]);

	const handleLikeClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const newLiked = !localLiked;
			setLocalLiked(newLiked);
			setLocalLikes((prev) => (newLiked ? prev + 1 : prev - 1));
			setTrainerLike(trainer?._id, newLiked);
			likeMemberHandler(user, trainer?._id);
		},
		[localLiked, trainer?._id, user, likeMemberHandler],
	);

	if (device === 'mobile') {
		return <div>TRAINER CARD</div>;
	} else {
		return (
			<Stack className="trainer-general-card">
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
					>
						<div>{trainer?.memberProducts} products</div>
					</Box>
				</Link>

				<Stack className={'trainer-desc'}>
					<Box component={'div'} className={'trainer-info'}>
						<Link
							href={{
								pathname: '/trainer/detail',
								query: { trainerId: trainer?._id },
							}}
						>
							<strong>{trainer?.memberFullName ?? trainer?.memberNick}</strong>
						</Link>
						<span>Trainer</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{trainer?.memberViews}</Typography>
						<IconButton color={'default'} onClick={handleLikeClick}>
							{localLiked ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{localLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default TrainerCard;