import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Tooltip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import {
	AddCircleOutline,
	ViewListOutlined,
	FavoriteBorderOutlined,
	HistoryOutlined,
	PeopleAltOutlined,
	PersonAddAltOutlined,
	ArticleOutlined,
	EditNoteOutlined,
	SettingsOutlined,
	LogoutOutlined,
	FitnessCenterOutlined,
	CheckroomOutlined,
	ShoppingBagOutlined,
	AddBusinessOutlined,
	PlaylistAddOutlined,
	PostAddOutlined,
} from '@mui/icons-material';

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	/** MENU CONFIG — role-based listings **/
	const getListingsMenu = () => {
		const memberType = user?.memberType;
		const roleItems: { key: string; icon: JSX.Element; label: string }[] = [];

		// AGENT: Property based
		if (memberType === 'AGENT') {
			roleItems.push(
				{ key: 'addProperty', icon: <AddCircleOutline />, label: 'Add Property' },
				{ key: 'myProperties', icon: <ViewListOutlined />, label: 'My Properties' },
			);
		}

		// TRAINER: Product based
		if (memberType === 'TRAINER') {
			roleItems.push(
				{ key: 'addProduct', icon: <PostAddOutlined />, label: 'Add Product' },
				{ key: 'myProducts', icon: <ShoppingBagOutlined />, label: 'My Products' },
			);
		}

		// SALESMANAGER: Equipment + Clothes
		if (memberType === 'SALESMANAGER') {
			roleItems.push(
				{ key: 'addEquipment', icon: <AddBusinessOutlined />, label: 'Add Equipment' },
				{ key: 'myEquipments', icon: <FitnessCenterOutlined />, label: 'My Equipments' },
				{ key: 'addClothe', icon: <PlaylistAddOutlined />, label: 'Add Clothe' },
				{ key: 'myClothes', icon: <CheckroomOutlined />, label: 'My Clothes' },
			);
		}

		// Common items for all
		return [
			...roleItems,
			{ key: 'myFavorites', icon: <FavoriteBorderOutlined />, label: 'My Favorites' },
			{ key: 'recentlyVisited', icon: <HistoryOutlined />, label: 'Recently Visited' },
			{ key: 'followers', icon: <PeopleAltOutlined />, label: 'My Followers' },
			{ key: 'followings', icon: <PersonAddAltOutlined />, label: 'My Followings' },
		];
	};

	const listingsMenu = getListingsMenu();

	const communityMenu = [
		{ key: 'myArticles', icon: <ArticleOutlined />, label: 'Articles' },
		{ key: 'writeArticle', icon: <EditNoteOutlined />, label: 'Write Article' },
	];

	const accountMenu = [
		{ key: 'myProfile', icon: <SettingsOutlined />, label: 'My Profile' },
	];

	if (device === 'mobile') {
		return <div>MY MENU</div>;
	} else {
		return (
			<Stack className="icon-sidebar">
				{/* ---- Large Profile Image ---- */}
				<Link
					href={{
						pathname: '/mypage',
						query: { category: 'myProfile' },
					}}
					scroll={false}
				>
					<Stack className="sidebar-profile-img">
						<img
							src={
								user?.memberImage
									? `${REACT_APP_API_URL}/${user.memberImage}`
									: '/img/profile/defaultUser.svg'
							}
							alt="profile"
						/>
					</Stack>
				</Link>

				{/* ---- Navigation Icons ---- */}
				<Stack className="nav-sections">
					{/* MANAGE LISTINGS */}
					<Stack className="nav-group">
						{listingsMenu.map((item) => (
							<Tooltip title={item.label} placement="right" arrow key={item.key}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: item.key },
									}}
									scroll={false}
								>
									<Stack className={`nav-icon-btn ${category === item.key ? 'active' : ''}`}>
										{item.icon}
									</Stack>
								</Link>
							</Tooltip>
						))}
					</Stack>

					<div className="nav-divider" />

					{/* COMMUNITY */}
					<Stack className="nav-group">
						{communityMenu.map((item) => (
							<Tooltip title={item.label} placement="right" arrow key={item.key}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: item.key },
									}}
									scroll={false}
								>
									<Stack className={`nav-icon-btn ${category === item.key ? 'active' : ''}`}>
										{item.icon}
									</Stack>
								</Link>
							</Tooltip>
						))}
					</Stack>

					<div className="nav-divider" />

					{/* MANAGE ACCOUNT */}
					<Stack className="nav-group">
						{accountMenu.map((item) => (
							<Tooltip title={item.label} placement="right" arrow key={item.key}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: item.key },
									}}
									scroll={false}
								>
									<Stack className={`nav-icon-btn ${category === item.key ? 'active' : ''}`}>
										{item.icon}
									</Stack>
								</Link>
							</Tooltip>
						))}
					</Stack>
				</Stack>

				{/* ---- Logout ---- */}
				<Tooltip title="Logout" placement="right" arrow>
					<Stack className="nav-icon-btn logout-btn" onClick={logoutHandler}>
						<LogoutOutlined />
					</Stack>
				</Tooltip>
			</Stack>
		);
	}
};

export default MyMenu;