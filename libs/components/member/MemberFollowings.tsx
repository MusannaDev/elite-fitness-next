import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { NEXT_PUBLIC_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const {
		initialInput,
		subscribeHandler,
		unsubscribeHandler,
		likeMemberHandler,
		redirectToMemberPageHandler,
	} = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const {
		loading: getMemberFollowingsLoading,
		data: getMemberFollowingsData,
		error: getMemberFollowingsError,
		refetch: getMemberFollowingsRefetch,
	} = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId || followInquiry.search.followerId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowings(data?.getMemberFollowings?.list);
			setTotal(data?.getMemberFollowings?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (typeof router.query.memberId === 'string') {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followerId: router.query.memberId as string },
			}));
		} else if (user?._id) {
			setFollowInquiry((prev) => ({ ...prev, search: { followerId: user._id } }));
		}
	}, [router.query.memberId, user?._id]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	if (device === 'mobile') {
		return <div>FOLLOWINGS MOBILE</div>;
	} else {
		return (
			<div id="member-follows-page">
				{/* Header */}
				<Stack className="follows-header">
					<Stack className="header-content">
						<Typography className="header-title">Following</Typography>
						<Typography className="header-count">
							You follow {total} {total === 1 ? 'person' : 'people'}
						</Typography>
					</Stack>
				</Stack>

				{/* Followings Grid */}
				<Stack className="follows-grid">
					{memberFollowings?.length === 0 && (
						<Stack className="empty-state">
							<PeopleOutlineIcon className="empty-icon" />
							<Typography className="empty-title">Not following anyone</Typography>
							<Typography className="empty-desc">
								When you follow someone, they'll appear here
							</Typography>
						</Stack>
					)}

					{memberFollowings.map((following: Following) => {
						const imagePath: string = following?.followingData?.memberImage
							? `${NEXT_PUBLIC_API_URL}/${following?.followingData?.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Stack className="follow-card" key={following._id}>
								{/* Left: Avatar + Info */}
								<Stack
									className="card-identity"
									onClick={() =>
										redirectToMemberPageHandler(following?.followingData?._id)
									}
								>
									<Stack className="avatar-wrapper">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="identity-text">
										<Typography className="member-name">
											{following?.followingData?.memberNick}
										</Typography>
										<Typography className="member-type">
											{following?.followingData?.memberType}
										</Typography>
									</Stack>
								</Stack>

								{/* Center: Stats */}
								<Stack className="card-stats">
									<Stack className="stat-item">
										<Typography className="stat-value">
											{following?.followingData?.memberFollowers}
										</Typography>
										<Typography className="stat-label">Followers</Typography>
									</Stack>
									<Stack className="stat-divider" />
									<Stack className="stat-item">
										<Typography className="stat-value">
											{following?.followingData?.memberFollowings}
										</Typography>
										<Typography className="stat-label">Following</Typography>
									</Stack>
									<Stack className="stat-divider" />
									<Stack
										className="stat-item like-stat"
										onClick={() =>
											likeMemberHandler(
												following?.followingData?._id,
												getMemberFollowingsRefetch,
												followInquiry,
											)
										}
									>
										{following?.meLiked && following?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon className="liked-icon" />
										) : (
											<FavoriteBorderIcon className="like-icon" />
										)}
										<Typography className="stat-value">
											{following?.followingData?.memberLikes}
										</Typography>
									</Stack>
								</Stack>

								{/* Right: Action */}
								{user?._id !== following?.followingId && (
									<Stack className="card-action">
										{following.meFollowed && following.meFollowed[0]?.myFollowing ? (
											<Button
												className="btn-unfollow"
												onClick={() =>
													unsubscribeHandler(
														following?.followingData?._id,
														getMemberFollowingsRefetch,
														followInquiry,
													)
												}
											>
												Unfollow
											</Button>
										) : (
											<Button
												className="btn-follow"
												onClick={() =>
													subscribeHandler(
														following?.followingData?._id,
														getMemberFollowingsRefetch,
														followInquiry,
													)
												}
											>
												<PersonAddAltOutlinedIcon />
												Follow
											</Button>
										)}
									</Stack>
								)}
							</Stack>
						);
					})}
				</Stack>

				{/* Pagination */}
				{memberFollowings.length !== 0 && (
					<Stack className="follows-pagination">
						<Pagination
							page={followInquiry.page}
							count={Math.ceil(total / followInquiry.limit)}
							onChange={paginationHandler}
							shape="circular"
							color="primary"
						/>
						<Typography className="pagination-info">{total} following total</Typography>
					</Stack>
				)}
			</div>
		);
	}
};

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followerId: '',
		},
	},
};

export default MemberFollowings;