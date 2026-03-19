import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
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
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const {
		loading: getMemberFollowersLoading,
		data: getMemberFollowersData,
		error: getMemberFollowersError,
		refetch: getMemberFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId || followInquiry.search.followingId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (typeof router.query.memberId === 'string') {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followingId: router.query.memberId as string },
			}));
		} else if (user?._id) {
			setFollowInquiry((prev) => ({ ...prev, search: { followingId: user._id } }));
		}
	}, [router.query.memberId, user?._id]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	if (device === 'mobile') {
		return <div>FOLLOWERS MOBILE</div>;
	} else {
		return (
			<div id="member-follows-page">
				{/* Header */}
				<Stack className="follows-header">
					<Stack className="header-content">
						<Typography className="header-title">Followers</Typography>
						<Typography className="header-count">{total} people following you</Typography>
					</Stack>
				</Stack>

				{/* Followers Grid */}
				<Stack className="follows-grid">
					{memberFollowers?.length === 0 && (
						<Stack className="empty-state">
							<PeopleOutlineIcon className="empty-icon" />
							<Typography className="empty-title">No followers yet</Typography>
							<Typography className="empty-desc">
								When someone follows you, they'll appear here
							</Typography>
						</Stack>
					)}

					{memberFollowers.map((follower: Follower) => {
						const imagePath: string = follower?.followerData?.memberImage
							? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Stack className="follow-card" key={follower._id}>
								{/* Left: Avatar + Info */}
								<Stack
									className="card-identity"
									onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}
								>
									<Stack className="avatar-wrapper">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="identity-text">
										<Typography className="member-name">
											{follower?.followerData?.memberNick}
										</Typography>
										<Typography className="member-type">
											{follower?.followerData?.memberType}
										</Typography>
									</Stack>
								</Stack>

								{/* Center: Stats */}
								<Stack className="card-stats">
									<Stack className="stat-item">
										<Typography className="stat-value">
											{follower?.followerData?.memberFollowers}
										</Typography>
										<Typography className="stat-label">Followers</Typography>
									</Stack>
									<Stack className="stat-divider" />
									<Stack className="stat-item">
										<Typography className="stat-value">
											{follower?.followerData?.memberFollowings}
										</Typography>
										<Typography className="stat-label">Following</Typography>
									</Stack>
									<Stack className="stat-divider" />
									<Stack
										className="stat-item like-stat"
										onClick={() =>
											likeMemberHandler(
												follower?.followerData?._id,
												getMemberFollowersRefetch,
												followInquiry,
											)
										}
									>
										{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon className="liked-icon" />
										) : (
											<FavoriteBorderIcon className="like-icon" />
										)}
										<Typography className="stat-value">
											{follower?.followerData?.memberLikes}
										</Typography>
									</Stack>
								</Stack>

								{/* Right: Action */}
								{user?._id !== follower?.followerId && (
									<Stack className="card-action">
										{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
											<Button
												className="btn-unfollow"
												onClick={() =>
													unsubscribeHandler(
														follower?.followerData?._id,
														getMemberFollowersRefetch,
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
														follower?.followerData?._id,
														getMemberFollowersRefetch,
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
				{memberFollowers.length !== 0 && (
					<Stack className="follows-pagination">
						<Pagination
							page={followInquiry.page}
							count={Math.ceil(total / followInquiry.limit)}
							onChange={paginationHandler}
							shape="circular"
							color="primary"
						/>
						<Typography className="pagination-info">{total} followers total</Typography>
					</Stack>
				)}
			</div>
		);
	}
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;