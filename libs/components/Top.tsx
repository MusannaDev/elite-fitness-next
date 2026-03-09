import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);

	// Dropdown hover state with delay refs
	const [shopsOpen, setShopsOpen] = useState(false);
	const [membersOpen, setMembersOpen] = useState(false);
	const shopsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const membersTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	/** LIFECYCLE **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/property/detail':
				setBgColor(true);
				break;
			default:
				setBgColor(false);
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		return () => {
			if (shopsTimeout.current) clearTimeout(shopsTimeout.current);
			if (membersTimeout.current) clearTimeout(membersTimeout.current);
		};
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	// Shops dropdown handlers
	const handleShopsEnter = () => {
		if (shopsTimeout.current) clearTimeout(shopsTimeout.current);
		setShopsOpen(true);
	};
	const handleShopsLeave = () => {
		shopsTimeout.current = setTimeout(() => setShopsOpen(false), 200);
	};

	// Members dropdown handlers
	const handleMembersEnter = () => {
		if (membersTimeout.current) clearTimeout(membersTimeout.current);
		setMembersOpen(true);
	};
	const handleMembersLeave = () => {
		membersTimeout.current = setTimeout(() => setMembersOpen(false), 200);
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 8,
			marginTop: theme.spacing(1),
			minWidth: 160,
			background: '#0d0d0d',
			border: '1px solid rgba(255,69,0,0.3)',
			color: '#fff',
			'& .MuiMenu-list': { padding: '4px 0' },
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': { fontSize: 18, marginRight: theme.spacing(1.5) },
				'&:active': { backgroundColor: alpha('#FF4500', 0.15) },
				'&:hover': { backgroundColor: 'rgba(255,69,0,0.1)' },
			},
		},
	}));

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	if (device === 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}><div>{t('Home')}</div></Link>
				<Link href={'/property'}><div>{t('Properties')}</div></Link>
				<Link href={'/agent'}><div>{t('Agents')}</div></Link>
				<Link href={'/community?articleCategory=FREE'}><div>{t('Community')}</div></Link>
				<Link href={'/cs'}><div>{t('CS')}</div></Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${colorChange ? 'scrolled' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'nav-container'}>
						{/* LOGO */}
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<div className={'logo-wrapper'}>
									<img src="/img/logo/elite-logo.png" alt="logo" />
									<span className={'logo-text'}>ELITE<em>FIT</em></span>
								</div>
							</Link>
						</Box>

						{/* NAV LINKS */}
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'}>
								<div className={'nav-link'}>{t('Home')}</div>
							</Link>

							{/* SHOPS DROPDOWN */}
							<div
								className={'nav-link has-dropdown'}
								onMouseEnter={handleShopsEnter}
								onMouseLeave={handleShopsLeave}
							>
								<span>{t('Shops')}</span>
								<CaretDown size={12} weight="bold" />
								{shopsOpen && (
									<div
										className={'mega-dropdown shops-dropdown'}
										onMouseEnter={handleShopsEnter}
										onMouseLeave={handleShopsLeave}
									>
										<Link href={'/property'}><span>{t('Properties')}</span></Link>
										<Link href={'/product'}><span>{t('Products')}</span></Link>
										<Link href={'/equipment'}><span>{t('Equipments')}</span></Link>
										<Link href={'/clothes'}><span>{t('Clothes')}</span></Link>
									</div>
								)}
							</div>

							{/* MEMBERS DROPDOWN */}
							<div
								className={'nav-link has-dropdown'}
								onMouseEnter={handleMembersEnter}
								onMouseLeave={handleMembersLeave}
							>
								<span>{t('Members')}</span>
								<CaretDown size={12} weight="bold" />
								{membersOpen && (
									<div
										className={'mega-dropdown members-dropdown'}
										onMouseEnter={handleMembersEnter}
										onMouseLeave={handleMembersLeave}
									>
										<Link href={'/agent'}><span>{t('Agents')}</span></Link>
										<Link href={'/trainer'}><span>{t('Trainers')}</span></Link>
										<Link href={'/seller'}><span>{t('SalesManagers')}</span></Link>
									</div>
								)}
							</div>

							<Link href={'/community?articleCategory=FREE'}>
								<div className={'nav-link'}>{t('Community')}</div>
							</Link>

							{user?._id && (
								<Link href={'/mypage'}>
									<div className={'nav-link'}>{t('My Page')}</div>
								</Link>
							)}

							<Link href={'/cs'}>
								<div className={'nav-link'}>{t('CS')}</div>
							</Link>
						</Box>

						{/* USER BOX */}
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div
										className={'login-user'}
										onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
									>
										<img
											src={
												user?.memberImage
													? `${REACT_APP_API_URL}/${user?.memberImage}`
													: '/img/profile/defaultUser.svg'
											}
											alt="user"
										/>
										<span className={'user-pulse'}></span>
									</div>
									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => setLogoutAnchor(null)}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: '#FF4500', marginRight: '10px' }} />
											Logout
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>{t('Login')} / {t('Register')}</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								{user?._id && (
									<NotificationsOutlinedIcon className={'notification-icon'} />
								)}
								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={12} color="#aaa" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'flag'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'flag'} />
										)}
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img className="img-flag" src={'/img/flag/langen.png'} onClick={langChoice} id="en" alt={'usaFlag'} />
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img className="img-flag" src={'/img/flag/langkr.png'} onClick={langChoice} id="kr" alt={'koreanFlag'} />
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img className="img-flag" src={'/img/flag/langru.png'} onClick={langChoice} id="ru" alt={'russiaFlag'} />
										{t('Russian')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);