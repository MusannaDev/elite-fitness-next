import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useMutation } from '@apollo/client';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Messages } from '../../config';

interface SalesManagerCardProps {
	salesManager: any;
	likeMemberHandler: any;
	refetch?: () => void;
}

const SalesManagerCard = (props: SalesManagerCardProps) => {
	const { salesManager, likeMemberHandler, refetch } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = salesManager?.memberImage
		? `${REACT_APP_API_URL}/${salesManager?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const isFollowed: boolean = salesManager?.meFollowed && salesManager?.meFollowed[0]?.myFollowing;

	/** APOLLO **/
	const [followMember] = useMutation(SUBSCRIBE);
	const [unfollowMember] = useMutation(UNSUBSCRIBE);

	/** HANDLERS **/
	const followHandler = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (isFollowed) {
				await unfollowMember({ variables: { input: salesManager?._id } });
			} else {
				await followMember({ variables: { input: salesManager?._id } });
			}
			if (refetch) refetch();
		} catch (err: any) {
			console.log('ERROR, followHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

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
					{/* Background image — full blob */}
					<div
						className="sm-blob-bg"
						style={{ backgroundImage: `url(${imagePath})` }}
					/>
					{/* Gradient overlay */}
					<div className="sm-blob-overlay" />

					{/* Top: views badge */}
					<div className="sm-blob-badges">
						<span className="sm-badge">
							<RemoveRedEyeIcon style={{ fontSize: 11 }} />
							{salesManager?.memberViews ?? 0}
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

						<div className="sm-actions">
							{/* Like */}
							<button
								className="sm-icon-btn"
								onClick={(e) => {
									e.preventDefault();
									likeMemberHandler(user, salesManager?._id);
								}}
							>
								{salesManager?.meLiked && salesManager?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ fontSize: 14, color: '#ff6b8a' }} />
								) : (
									<FavoriteBorderIcon style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }} />
								)}
							</button>

							{/* Follow */}
							<button
								className={`sm-follow-btn ${isFollowed ? 'following' : ''}`}
								onClick={followHandler}
							>
								{isFollowed ? (
									<>
										<svg width="12" height="12" viewBox="0 0 16 16" fill="none">
											<path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										Followed
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
						</div>
					</div>
				</div>
			</Link>
		);
	}
};

export default SalesManagerCard;