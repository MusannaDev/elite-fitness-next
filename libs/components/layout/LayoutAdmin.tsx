import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MenuList from '../admin/AdminMenuList';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Menu, MenuItem } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';

const SIDEBAR = 200;

const SunIcon = () => (
	<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
		<circle cx="10" cy="10" r="3.5" />
		<path d="M10 2.5v2M10 15.5v2M3.52 3.52l1.41 1.41M15.07 15.07l1.41 1.41M2.5 10h2M15.5 10h2M3.52 16.48l1.41-1.41M15.07 4.93l1.41-1.41" />
	</svg>
);
const MoonIcon = () => (
	<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
		<path d="M17.39 11.39A7.5 7.5 0 1 1 8.61 2.61 5.5 5.5 0 0 0 17.39 11.39Z" />
	</svg>
);

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
		const [loading, setLoading] = useState(true);
		const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
		const [title, setTitle] = useState('admin');
		const [theme, setTheme] = useState<'light' | 'dark'>('light');

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			const saved = typeof window !== 'undefined' ? localStorage.getItem('admin-theme') : null;
			if (saved === 'dark') setTheme('dark');
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) router.push('/').then();
		}, [loading, user, router]);

		const toggleTheme = () => {
			const next = theme === 'light' ? 'dark' : 'light';
			setTheme(next);
			if (typeof window !== 'undefined') localStorage.setItem('admin-theme', next);
		};

		const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
		const handleCloseUserMenu = () => setAnchorElUser(null);
		const logoutHandler = () => { logOut(); router.push('/').then(); };

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<main id="pc-wrap" className="admin" data-theme={theme}>
				<Box component={'div'} sx={{ display: 'flex', minHeight: '100vh' }}>

					{/* ── Dark Sidebar ───────────────────────────────────────── */}
					<Drawer
						sx={{
							width: SIDEBAR, flexShrink: 0,
							'& .MuiDrawer-paper': { width: SIDEBAR, boxSizing: 'border-box' },
						}}
						variant="permanent" anchor="left" className="aside"
					>
						{/* Logo */}
						<Stack direction="row" alignItems="center" gap="8px"
							sx={{ px: '14px', height: '56px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
							<Box sx={{
								width: 32, height: 32, borderRadius: '8px', overflow: 'hidden',
								background: 'linear-gradient(135deg, #6366F1, #818CF8)',
								display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
							}}>
								<img src="/img/logo/fitness-logo.png" alt="logo"
									style={{ width: 32, height: 32, objectFit: 'cover' }}
									onError={(e: any) => {
										e.target.style.display = 'none';
										(e.target.parentNode as HTMLElement).innerHTML = '<span style="color:#fff;font-size:13px;font-weight:800">E</span>';
									}}
								/>
							</Box>
							<Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#fff', letterSpacing: '-0.03em' }}>
								Elite Admin
							</Typography>
						</Stack>

						{/* User mini */}
						<Stack direction="row" alignItems="center" gap="8px"
							sx={{ mx: '8px', mt: '10px', mb: '4px', p: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
							<Avatar
								src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
								sx={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)' }}
							/>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontWeight: 700, fontSize: '12px', color: '#E2E8F0', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{user?.memberNick}
								</Typography>
								<Typography sx={{ fontSize: '10px', color: '#64748B' }}>{user?.memberPhone}</Typography>
							</Box>
							<Box sx={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '5px', px: '5px', py: '1px', fontSize: '8px', fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.06em', flexShrink: 0 }}>
								ADMIN
							</Box>
						</Stack>

						<MenuList />
					</Drawer>

					{/* ── Content ────────────────────────────────────────────── */}
					<Box component="div" id="bunker"
						sx={{ flexGrow: 1, py: '20px', pr: '24px', pl: '20px', minHeight: '100vh' }}>

						{/* Inline topbar */}
						<Stack direction="row" alignItems="center" justifyContent="flex-end" gap="8px" sx={{ mb: '20px' }}>
							<Box component="button" className="theme-toggle" onClick={toggleTheme}>
								{theme === 'light' ? <MoonIcon /> : <SunIcon />}
							</Box>
							<Box onClick={handleOpenUserMenu} sx={{
								display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
								background: 'var(--surface)', border: '1px solid var(--border)',
								borderRadius: '24px', px: '10px', py: '5px',
								'&:hover': { borderColor: 'var(--text-3)' },
							}}>
								<Avatar src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
									sx={{ width: 24, height: 24 }} />
								<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)' }}>{user?.memberNick}</Typography>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
							</Box>
							<Menu sx={{ mt: '40px' }} anchorEl={anchorElUser}
								anchorOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}
								PaperProps={{ sx: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 12px 40px rgba(15,23,42,0.1)', minWidth: '170px' } }}>
								<Box sx={{ px: '14px', py: '8px' }}>
									<Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-1)' }}>{user?.memberNick}</Typography>
									<Typography sx={{ fontSize: '11px', color: 'var(--text-3)' }}>{user?.memberPhone}</Typography>
								</Box>
								<Divider />
								<MenuItem onClick={() => { handleCloseUserMenu(); logoutHandler(); }}
									sx={{ px: '14px', py: '8px', fontSize: '13px', color: 'var(--text-2)', '&:hover': { background: 'var(--hover)' } }}>
									Sign out
								</MenuItem>
							</Menu>
						</Stack>

						{/* @ts-ignore */}
						<Component {...props} setSnackbar={setSnackbar} setTitle={setTitle} />
					</Box>
				</Box>
			</main>
		);
	};
};

export default withAdminLayout;