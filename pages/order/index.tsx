import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../../libs/config';
import { OrderStatus } from '../../libs/enums/order.enum';
import PendingOrders   from '../../libs/components/order/PendingOrders';
import ConfirmedOrders from '../../libs/components/order/ConfirmedOrders';
import ShippingOrders  from '../../libs/components/order/ShippingOrders';
import DeliveredOrders from '../../libs/components/order/DeliveredOrders';
import CancelledOrders from '../../libs/components/order/CancelledOrders';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const STATUS_META = {
	[OrderStatus.PENDING]:   { label: 'Pending',   color: '#d97706', bg: '#fef3c7' },
	[OrderStatus.CONFIRMED]: { label: 'Confirmed', color: '#2563eb', bg: '#dbeafe' },
	[OrderStatus.SHIPPING]:  { label: 'Shipping',  color: '#7c3aed', bg: '#ede9fe' },
	[OrderStatus.DELIVERED]: { label: 'Delivered', color: '#059669', bg: '#d1fae5' },
	[OrderStatus.CANCELLED]: { label: 'Cancelled', color: '#6b7280', bg: '#f3f4f6' },
};

const SIDEBAR_ITEMS = [
	{ status: OrderStatus.PENDING   },
	{ status: OrderStatus.CONFIRMED },
	{ status: OrderStatus.SHIPPING  },
	{ status: OrderStatus.DELIVERED },
	{ status: OrderStatus.CANCELLED },
];

const OrdersPage: NextPage = () => {
	const device = useDeviceDetect();
	const user   = useReactiveVar(userVar);
	const router = useRouter();
	const [activeStatus, setActiveStatus] = useState<OrderStatus>(OrderStatus.PENDING);

	useEffect(() => {
		if (!router.isReady) return;
		const statusRaw = router.query.status;
		const status = Array.isArray(statusRaw) ? statusRaw[0] : statusRaw;
		if (!status) return;
		if ((Object.values(OrderStatus) as string[]).includes(status)) {
			setActiveStatus(status as OrderStatus);
		}
	}, [router.isReady, router.query.status]);

	if (device === 'mobile') return <div>ORDERS MOBILE</div>;

	return (
		<Box className="op-page">
			<Container className="op-container" maxWidth={false}>

				{/* ── SIDEBAR ──────────────────────────────────────── */}
				<Box className="op-sidebar">

					{/* User card */}
					<Box className="op-user-card">
						<Box className="op-avatar-wrap">
							<img
								src={user?.memberImage
									? `${REACT_APP_API_URL}/${user.memberImage}`
									: '/img/profile/defaultUser.svg'}
								className="op-avatar"
								alt="avatar"
							/>
						</Box>
						<Typography className="op-username">{user?.memberNick ?? 'Guest'}</Typography>
						<Typography className="op-role">{user?.memberType ?? 'USER'}</Typography>
						{user?.memberAddress && (
							<Stack className="op-address" direction="row" alignItems="center" gap="5px">
								<LocationOnIcon sx={{ fontSize: 13 }} />
								<Typography>{user.memberAddress}</Typography>
							</Stack>
						)}
					</Box>

					<Box className="op-divider" />

					{/* Status navigation */}
					<Box className="op-status-nav">
						<Typography className="op-nav-title">Order Status</Typography>
						{SIDEBAR_ITEMS.map(({ status }) => {
							const sm       = STATUS_META[status];
							const isActive = activeStatus === status;
							return (
								<Box
									key={status}
									className={`op-nav-item${isActive ? ' active' : ''}`}
									style={isActive ? { background: sm.bg, borderColor: sm.color } : {}}
									onClick={() => setActiveStatus(status)}
								>
									<Stack direction="row" alignItems="center" gap="10px" flex={1}>
										<span className="op-nav-dot" style={{ background: sm.color }} />
										<Typography
											className="op-nav-label"
											style={isActive ? { color: sm.color, fontWeight: 800 } : {}}
										>
											{sm.label}
										</Typography>
									</Stack>
								</Box>
							);
						})}
					</Box>
				</Box>

				{/* ── MAIN ─────────────────────────────────────────── */}
				<Box className="op-main">

					{/* Heading */}
					<Stack className="op-heading" direction="row" alignItems="center" justifyContent="space-between">
						<Box>
							<Typography className="op-heading-title">
								{STATUS_META[activeStatus].label} Orders
							</Typography>
							<Typography className="op-heading-sub">
								Manage your {STATUS_META[activeStatus].label.toLowerCase()} orders
							</Typography>
						</Box>
						<Box
							className="op-status-pill"
							style={{
								color: STATUS_META[activeStatus].color,
								background: STATUS_META[activeStatus].bg,
							}}
						>
							<span className="op-pill-dot" style={{ background: STATUS_META[activeStatus].color }} />
							{STATUS_META[activeStatus].label}
						</Box>
					</Stack>

					{/* Active component */}
					{activeStatus === OrderStatus.PENDING   && <PendingOrders   setActiveStatus={setActiveStatus} />}
					{activeStatus === OrderStatus.CONFIRMED && <ConfirmedOrders setActiveStatus={setActiveStatus} />}
					{activeStatus === OrderStatus.SHIPPING  && <ShippingOrders  setActiveStatus={setActiveStatus} />}
					{activeStatus === OrderStatus.DELIVERED && <DeliveredOrders setActiveStatus={setActiveStatus} />}
					{activeStatus === OrderStatus.CANCELLED && <CancelledOrders setActiveStatus={setActiveStatus} />}

				</Box>
			</Container>
		</Box>
	);
};

export default withLayoutBasic(OrdersPage);
