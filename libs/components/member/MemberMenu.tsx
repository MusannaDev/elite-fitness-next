import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { GET_MEMBER } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { MemberType } from '../../enums/member.enum';
import SupplementsIcon from '@mui/icons-material/MedicationLiquid';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';

interface MemberMenuProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
	memberType?: MemberType;
}

const MemberMenu = (props: MemberMenuProps) => {
	const { subscribeHandler, unsubscribeHandler, memberType } = props;
	const device   = useDeviceDetect();
	const router   = useRouter();
	const category = router.query?.category as string | undefined;
	const memberId = typeof router.query.memberId === 'string' ? router.query.memberId : '';

	const [member, setMember] = useState<Member | null>(null);

	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId || memberId.length !== 24,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => { setMember(data?.getMember); },
	});

	const navLink = (cat: string) => ({ pathname: '/member', query: { ...router.query, category: cat } });
	const isActive = (cat: string) => category === cat;

	if (device === 'mobile') return <div>MEMBER MENU MOBILE</div>;

	return (
		<Stack className={'member-menu-wrap'}>
			{/* ── Glass profile card ── */}
			<Stack className={'mm-profile-card'}>
				<Box className={'mm-avatar-ring'}>
					<img
						src={member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg'}
						alt={'member-photo'}
						className={'mm-avatar-img'}
					/>
				</Box>
				<Stack className={'mm-user-info'}>
					<Typography className={'mm-user-name'}>{member?.memberNick}</Typography>
					<Box className={'mm-phone-row'}>
						<img src={'/img/icons/call.svg'} alt={'icon'} className={'mm-call-icon'} />
						<Typography className={'mm-phone'}>{member?.memberPhone}</Typography>
					</Box>
					<Box className={'mm-type-badge'}>
						<Typography className={'mm-type-text'}>{member?.memberType}</Typography>
					</Box>
				</Stack>
			</Stack>

			{/* ── Follow button ── */}
			<Stack className={'mm-follow-box'}>
				{member?.meFollowed && member.meFollowed[0]?.myFollowing ? (
					<>
						<button
							className={'mm-btn mm-btn-unfollow'}
							onClick={() => unsubscribeHandler(member._id, getMemberRefetch, member._id)}
						>
							Unfollow
						</button>
						<Typography className={'mm-following-label'}>Following</Typography>
					</>
				) : (
					<button
						className={'mm-btn mm-btn-follow'}
						disabled={!member?._id}
						onClick={() => subscribeHandler(member?._id, getMemberRefetch, member?._id)}
					>
						Follow
					</button>
				)}
			</Stack>

			{/* ── Stats strip ── */}
			<Stack className={'mm-stats-strip'}>
				<Box className={'mm-stat'}>
					<Typography className={'mm-stat-num'}>{member?.memberFollowers ?? 0}</Typography>
					<Typography className={'mm-stat-label'}>Followers</Typography>
				</Box>
				<Box className={'mm-stat-divider'} />
				<Box className={'mm-stat'}>
					<Typography className={'mm-stat-num'}>{member?.memberFollowings ?? 0}</Typography>
					<Typography className={'mm-stat-label'}>Following</Typography>
				</Box>
				<Box className={'mm-stat-divider'} />
				<Box className={'mm-stat'}>
					<Typography className={'mm-stat-num'}>{member?.memberArticles ?? 0}</Typography>
					<Typography className={'mm-stat-label'}>Articles</Typography>
				</Box>
			</Stack>

			{/* ── Navigation ── */}
			<Stack className={'mm-nav'}>

				<Typography className={'mm-nav-section-title'}>Details</Typography>
				<List className={'mm-nav-list'}>

					{memberType === MemberType.AGENT && (
						<ListItem disablePadding className={isActive('properties') ? 'mm-nav-item active' : 'mm-nav-item'}>
							<Link href={navLink('properties')} scroll={false} style={{ width: '100%' }}>
								<div className={'mm-nav-row'}>
									<Box className={'mm-nav-icon-wrap'}><FitnessCenterRoundedIcon fontSize={'small'} /></Box>
									<Typography className={'mm-nav-label'}>Gym Lists</Typography>
									<Typography className={'mm-nav-count'}>{member?.memberProperties}</Typography>
								</div>
							</Link>
						</ListItem>
					)}

					{memberType === MemberType.TRAINER && (
						<ListItem disablePadding className={isActive('products') ? 'mm-nav-item active' : 'mm-nav-item'}>
							<Link href={navLink('products')} scroll={false} style={{ width: '100%' }}>
								<div className={'mm-nav-row'}>
									<Box className={'mm-nav-icon-wrap'}><SupplementsIcon fontSize={'small'} /></Box>
									<Typography className={'mm-nav-label'}>Products</Typography>
									<Typography className={'mm-nav-count'}>{member?.memberProducts}</Typography>
								</div>
							</Link>
						</ListItem>
					)}

					{memberType === MemberType.SALESMANAGER && (
						<>
							<ListItem disablePadding className={isActive('equipments') ? 'mm-nav-item active' : 'mm-nav-item'}>
								<Link href={navLink('equipments')} scroll={false} style={{ width: '100%' }}>
									<div className={'mm-nav-row'}>
										<Box className={'mm-nav-icon-wrap'}><FitnessCenterRoundedIcon fontSize={'small'} /></Box>
										<Typography className={'mm-nav-label'}>Equipments</Typography>
										<Typography className={'mm-nav-count'}>{member?.memberEquipments}</Typography>
									</div>
								</Link>
							</ListItem>
							<ListItem disablePadding className={isActive('clothes') ? 'mm-nav-item active' : 'mm-nav-item'}>
								<Link href={navLink('clothes')} scroll={false} style={{ width: '100%' }}>
									<div className={'mm-nav-row'}>
										<Box className={'mm-nav-icon-wrap'}><CheckroomRoundedIcon fontSize={'small'} /></Box>
										<Typography className={'mm-nav-label'}>Clothes</Typography>
										<Typography className={'mm-nav-count'}>{member?.memberClothes}</Typography>
									</div>
								</Link>
							</ListItem>
						</>
					)}

					<ListItem disablePadding className={isActive('followers') ? 'mm-nav-item active' : 'mm-nav-item'}>
						<Link href={navLink('followers')} scroll={false} style={{ width: '100%' }}>
							<div className={'mm-nav-row'}>
								<Box className={'mm-nav-icon-wrap'}><GroupRoundedIcon fontSize={'small'} /></Box>
								<Typography className={'mm-nav-label'}>Followers</Typography>
								<Typography className={'mm-nav-count'}>{member?.memberFollowers}</Typography>
							</div>
						</Link>
					</ListItem>

					<ListItem disablePadding className={isActive('followings') ? 'mm-nav-item active' : 'mm-nav-item'}>
						<Link href={navLink('followings')} scroll={false} style={{ width: '100%' }}>
							<div className={'mm-nav-row'}>
								<Box className={'mm-nav-icon-wrap'}><PersonAddRoundedIcon fontSize={'small'} /></Box>
								<Typography className={'mm-nav-label'}>Followings</Typography>
								<Typography className={'mm-nav-count'}>{member?.memberFollowings}</Typography>
							</div>
						</Link>
					</ListItem>
				</List>

				<Typography className={'mm-nav-section-title'} style={{ marginTop: '20px' }}>Community</Typography>
				<List className={'mm-nav-list'}>
					<ListItem disablePadding className={isActive('articles') ? 'mm-nav-item active' : 'mm-nav-item'}>
						<Link href={navLink('articles')} scroll={false} style={{ width: '100%' }}>
							<div className={'mm-nav-row'}>
								<Box className={'mm-nav-icon-wrap'}><ArticleRoundedIcon fontSize={'small'} /></Box>
								<Typography className={'mm-nav-label'}>Articles</Typography>
								<Typography className={'mm-nav-count'}>{member?.memberArticles}</Typography>
							</div>
						</Link>
					</ListItem>
				</List>

			</Stack>
		</Stack>
	);
};

export default MemberMenu;