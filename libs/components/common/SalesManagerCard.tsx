import React, { useState, useEffect, useCallback, useRef } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useMutation } from '@apollo/client';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Messages } from '../../config';

const LS_KEY = (userId: string) => `sm_follows_${userId}`;

const getLocalFollow = (userId: string, smId: string): boolean => {
	if (!userId || !smId || typeof window === 'undefined') return false;
	try {
		const stored = JSON.parse(localStorage.getItem(LS_KEY(userId)) || '{}');
		return stored[smId] === true;
	} catch {
		return false;
	}
};

const setLocalFollow = (userId: string, smId: string, following: boolean) => {
	if (!userId || !smId || typeof window === 'undefined') return;
	try {
		const stored = JSON.parse(localStorage.getItem(LS_KEY(userId)) || '{}');
		if (following) {
			stored[smId] = true;
		} else {
			delete stored[smId];
		}
		localStorage.setItem(LS_KEY(userId), JSON.stringify(stored));
	} catch {}
};

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

	const [isFollowed, setIsFollowed] = useState<boolean>(
		!!(salesManager?.meFollowed && salesManager?.meFollowed[0]?.myFollowing) ||
		getLocalFollow(user?._id, salesManager?._id),
	);
	const [localFollowers, setLocalFollowers] = useState<number>(salesManager?.memberFollowers || 0);
	const [localLiked, setLocalLiked] = useState<boolean>(
		!!(salesManager?.meLiked && salesManager?.meLiked[0]?.myFavorite),
	);
	const [localLikes, setLocalLikes] = useState<number>(salesManager?.memberLikes || 0);
	const followInteracted = useRef(false);

	useEffect(() => {
		const serverLiked = !!(salesManager?.meLiked && salesManager?.meLiked[0]?.myFavorite);
		setLocalLiked(serverLiked);
		setLocalLikes(salesManager?.memberLikes || 0);
	}, [salesManager?.meLiked, salesManager?.memberLikes]);

	useEffect(() => {
		if (followInteracted.current) return;
		const fromServer = !!(salesManager?.meFollowed && salesManager?.meFollowed[0]?.myFollowing);
		const fromLocal = getLocalFollow(user?._id, salesManager?._id);
		setIsFollowed(fromServer || fromLocal);
		setLocalFollowers(salesManager?.memberFollowers || 0);
	}, [salesManager?.meFollowed, salesManager?.memberFollowers, user?._id]);

	/** APOLLO **/
	const [followMember] = useMutation(SUBSCRIBE);
	const [unfollowMember] = useMutation(UNSUBSCRIBE);

	/** HANDLERS **/
	const followHandler = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!user._id) {
				sweetMixinErrorAlert(Messages.error2).then();
				return;
			}
			followInteracted.current = true;
			const wasFollowed = isFollowed;
			setIsFollowed(!wasFollowed);
			setLocalFollowers((prev) => (wasFollowed ? Math.max(0, prev - 1) : prev + 1));
			try {
				if (wasFollowed) {
					await unfollowMember({ variables: { input: salesManager?._id } });
				} else {
					await followMember({ variables: { input: salesManager?._id } });
				}
				setLocalFollow(user._id, salesManager?._id, !wasFollowed);
			} catch (err: any) {
				setIsFollowed(wasFollowed);
				setLocalFollowers((prev) => (wasFollowed ? prev + 1 : Math.max(0, prev - 1)));
				sweetMixinErrorAlert(err.message).then();
			}
		},
		[isFollowed, salesManager?._id, user, followMember, unfollowMember],
	);

	const likeHandler = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const nextLiked = !localLiked;
			setLocalLiked(nextLiked);
			setLocalLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

			try {
				await likeMemberHandler(user, salesManager?._id);
			} catch (err: any) {
				setLocalLiked(!nextLiked);
				setLocalLikes((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
			}
		},
		[localLiked, likeMemberHandler, user, salesManager?._id],
	);

	if (device === 'mobile') {
		return <div>SALES MANAGER CARD</div>;
	} else {
		return (
			<Link
				href={{
					pathname: '/sales-manager/detail',
					query: { salesManagerId: salesManager?._id },
				}}
				style={{ textDecoration: 'none' }}
			>
				<div className="sm-blob-card">
					{/* Background image */}
					<div
						className="sm-blob-bg"
						style={{ backgroundImage: `url(${imagePath})` }}
					/>
					{/* Gradient overlay */}
					<div className="sm-blob-overlay" />

					{/* Top badges: views + likes + followers */}
					<div className="sm-blob-badges">
						<span className="sm-badge">
							<RemoveRedEyeIcon style={{ fontSize: 11 }} />
							{salesManager?.memberViews ?? 0}
						</span>
						<span className="sm-badge sm-badge-like">
							<FavoriteIcon style={{ fontSize: 11, color: '#ff6b8a' }} />
							{localLikes}
						</span>
						<span className="sm-badge sm-badge-followers">
							<PersonAddAlt1Icon style={{ fontSize: 11 }} />
							{localFollowers}
						</span>
					</div>

					{/* Bottom glass panel */}
					<div className="sm-blob-content">
						<strong className="sm-name">
							{salesManager?.memberFullName ?? salesManager?.memberNick}
						</strong>
						<span className="sm-role">Sales Manager</span>

						{salesManager?.memberClothes && (
							<span className="sm-tag">{salesManager.memberClothes}</span>
						)}

						<div
							className="sm-actions"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							{/* Like */}
							<button
								type="button"
								className="sm-icon-btn"
								onClick={likeHandler}
							>
								{localLiked ? (
									<FavoriteIcon style={{ fontSize: 14, color: '#ff6b8a' }} />
								) : (
									<FavoriteBorderIcon style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }} />
								)}
							</button>

							{/* Follow — hidden for own card */}
							{user?._id !== salesManager?._id && (
								<button
									type="button"
									className={`sm-follow-btn ${isFollowed ? 'following' : ''}`}
									onClick={followHandler}
								>
									{isFollowed ? (
										<>
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none">
												<path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
											Unfollow
										</>
									) : (
										<>
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none">
												<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
											</svg>
											Follow
										</>
									)}
								</button>
							)}
						</div>
					</div>
				</div>
			</Link>
		);
	}
};

export default SalesManagerCard;
