import React, { useEffect, useState } from 'react';
import { withRouter } from 'next/router';
import Link from 'next/link';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ChatsCircle, Headset, User, Buildings, TShirt, Barbell, Package } from 'phosphor-react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AdminMenuList = (props: any) => {
	const device = useDeviceDetect();
	const [activeMenu, setActiveMenu] = useState('');
	const [activeSub, setActiveSub] = useState('');
	const [openMenus, setOpenMenus] = useState<string[]>([]);

	const { router: { pathname } } = props;
	const pathnames = pathname.split('/').filter((x: any) => x);
	const segment = pathnames[1];

	useEffect(() => {
		switch (segment) {
			case 'properties':  setActiveMenu('Properties'); break;
			case 'products':    setActiveMenu('Products'); break;
			case 'equipments':  setActiveMenu('Equipments'); break;
			case 'clothes':     setActiveMenu('Clothes'); break;
			case 'community':   setActiveMenu('Community'); break;
			case 'cs':          setActiveMenu('Cs'); setOpenMenus(['Cs']); break;
			default:            setActiveMenu('Users'); break;
		}
		switch (pathnames[2]) {
			case 'faq':    setActiveSub('FAQ'); break;
			case 'notice': setActiveSub('Notice'); break;
			default:       setActiveSub(''); break;
		}
	}, []);

	const toggleSubmenu = (title: string) => {
		setOpenMenus((prev) =>
			prev.includes(title) ? prev.filter((m) => m !== title) : [...prev, title]
		);
	};

	const menus = [
		{ title: 'Users',      icon: <User size={16} weight="bold" />,        url: '/_admin/users' },
		{ title: 'Properties', icon: <Buildings size={16} weight="bold" />,    url: '/_admin/properties' },
		{ title: 'Products',   icon: <Package size={16} weight="bold" />,      url: '/_admin/products' },
		{ title: 'Equipments', icon: <Barbell size={16} weight="bold" />,      url: '/_admin/equipments' },
		{ title: 'Clothes',    icon: <TShirt size={16} weight="bold" />,       url: '/_admin/clothes' },
		{ title: 'Community',  icon: <ChatsCircle size={16} weight="bold" />,  url: '/_admin/community' },
		{ title: 'Cs',         icon: <Headset size={16} weight="bold" />,      url: null,
		  subs: [
				{ title: 'FAQ',    url: '/_admin/cs/faq' },
				{ title: 'Notice', url: '/_admin/cs/notice' },
			],
		},
	];

	return (
		<Box sx={{ px: '8px', pt: '8px', pb: '12px' }}>
			<Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', px: '8px', mb: '4px' }}>
				Menu
			</Typography>

			{menus.map((item, i) => {
				const isActive = activeMenu === item.title;
				const isOpen = openMenus.includes(item.title);
				const hasSub = !!item.subs;

				const btn = (
					<ListItemButton
						onClick={hasSub ? () => toggleSubmenu(item.title) : undefined}
						component="li"
						sx={{
							minHeight: 36, borderRadius: '8px', px: '8px', py: 0, mb: 0,
							background: isActive && !hasSub ? '#6366F1' : 'transparent',
							'&:hover': { background: isActive && !hasSub ? '#6366F1' : 'rgba(255,255,255,0.05)' },
						}}
					>
						<ListItemIcon sx={{ minWidth: 0, mr: '8px', color: isActive && !hasSub ? '#fff' : isActive ? '#A5B4FC' : '#64748B', display: 'flex', alignItems: 'center' }}>
							{item.icon}
						</ListItemIcon>
						<ListItemText primary={item.title} primaryTypographyProps={{
							fontSize: '13px', fontWeight: isActive ? 700 : 500, lineHeight: 1,
							color: isActive && !hasSub ? '#fff' : isActive ? '#A5B4FC' : '#94A3B8',
						}} />
						{hasSub && (
							<Box sx={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
								{isOpen ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
							</Box>
						)}
					</ListItemButton>
				);

				return (
					<List key={i} disablePadding sx={{ mb: 0 }}>
						{hasSub ? btn : (
							<Link href={item.url!} shallow replace style={{ textDecoration: 'none' }}>{btn}</Link>
						)}
						{hasSub && (
							<Collapse in={isOpen} timeout="auto" component="li" unmountOnExit>
								<List disablePadding sx={{ pl: '16px', pr: '4px', py: '2px' }}>
									{item.subs!.map((sub, j) => {
										const subActive = activeMenu === item.title && activeSub === sub.title;
										return (
											<Link href={sub.url} shallow replace key={j} style={{ textDecoration: 'none' }}>
												<ListItemButton component="li" sx={{
													borderRadius: '6px', px: '8px', py: '4px', mb: 0, minHeight: 30,
													background: subActive ? 'rgba(99,102,241,0.12)' : 'transparent',
													'&:hover': { background: 'rgba(255,255,255,0.04)' },
												}}>
													<Box sx={{ width: 4, height: 4, borderRadius: '50%', mr: '8px', flexShrink: 0, background: subActive ? '#6366F1' : '#475569' }} />
													<Typography sx={{ fontSize: '12px', fontWeight: subActive ? 700 : 400, color: subActive ? '#A5B4FC' : '#64748B' }}>
														{sub.title}
													</Typography>
												</ListItemButton>
											</Link>
										);
									})}
								</List>
							</Collapse>
						)}
					</List>
				);
			})}
		</Box>
	);
};

export default withRouter(AdminMenuList);