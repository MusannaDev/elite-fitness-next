import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReplayIcon from '@mui/icons-material/Replay';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { Order } from '../../types/order/order';
import { OrderInquiry } from '../../types/order/order.input';
import { OrderItemType, OrderStatus } from '../../enums/order.enum';
import { T } from '../../types/common';
import { normalizeMyOrdersResponse } from '../../utils/order';
import { OrderItemSnapshotMap, readOrderItemSnapshots } from '../../utils/orderSnapshot';
import {
	DELIVERED_RETENTION_DAYS,
	getDeliveredRetentionUrgency,
	getDaysUntilDeliveredAutoDelete,
	getDeliveredOrderAutoDeleteAt,
	isDeliveredOrderExpired,
} from '../../utils/orderLifecycle';
import OrderItemRow from './OrderItemRow';
import moment from 'moment';

const ITEM_META: Record<OrderItemType, { emoji: string; label: string; bg: string }> = {
	[OrderItemType.PRODUCT]:   { emoji: '💊', label: 'Product',   bg: '#f3e8ff' },
	[OrderItemType.EQUIPMENT]: { emoji: '🏋️', label: 'Equipment', bg: '#e0f2fe' },
	[OrderItemType.CLOTHES]:   { emoji: '👕', label: 'Clothes',   bg: '#d1fae5' },
};

const SM = { color: '#059669', bg: '#d1fae5', light: '#f0fdf4' };

interface Props {
	setActiveStatus: (status: OrderStatus) => void;
	refreshSeed?: number;
}

const DeliveredOrders = ({ setActiveStatus: _setActiveStatus, refreshSeed = 0 }: Props) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [total,  setTotal]  = useState<number>(0);
	const [page,   setPage]   = useState<number>(1);
	const [snapshots, setSnapshots] = useState<OrderItemSnapshotMap>({});

	const inquiry = useMemo<OrderInquiry>(() => ({
		page: 1,
		limit: 100,
		search: { orderStatus: OrderStatus.DELIVERED },
	}), []);

	const { loading, refetch } = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		onCompleted: (data: T) => {
			const normalized = normalizeMyOrdersResponse(data?.getMyOrders);
			const visibleOrders = normalized.list.filter((order) => !isDeliveredOrderExpired(order));
			setOrders(visibleOrders);
			setTotal(visibleOrders.length);
		},
	});

	useEffect(() => {
		refetch({ input: inquiry });
	}, [inquiry, refreshSeed, refetch]);

	useEffect(() => {
		setPage(1);
	}, [refreshSeed]);

	useEffect(() => {
		setSnapshots(readOrderItemSnapshots());
	}, []);

	useEffect(() => {
		const maxPage = Math.max(1, Math.ceil(total / 5));
		if (page > maxPage) setPage(maxPage);
	}, [page, total]);

	const visibleOrders = useMemo(
		() => orders.slice((page - 1) * 5, page * 5),
		[orders, page],
	);

	const nextAutoDeleteAt = useMemo(() => {
		if (!orders.length) return null;
		const timestamps = orders
			.map((order) => getDeliveredOrderAutoDeleteAt(order))
			.filter((value): value is number => value !== null)
			.sort((a, b) => a - b);
		return timestamps[0] ?? null;
	}, [orders]);

	const nextAutoDeleteOrder = useMemo(() => {
		if (nextAutoDeleteAt === null) return null;
		return orders.find((order) => getDeliveredOrderAutoDeleteAt(order) === nextAutoDeleteAt) ?? null;
	}, [nextAutoDeleteAt, orders]);

	const nextCleanupUrgency = nextAutoDeleteOrder ? getDeliveredRetentionUrgency(nextAutoDeleteOrder) : 'fresh';

	const getRetentionCopy = (remainingDays: number | null): string => {
		if (remainingDays === 0) return 'Deletes today';
		if (remainingDays === DELIVERED_RETENTION_DAYS) return '30 day(s) left · Fresh delivery';
		if (remainingDays !== null && remainingDays <= 7) return `${remainingDays} day(s) left · Final week`;
		return `${remainingDays ?? DELIVERED_RETENTION_DAYS} day(s) left`;
	};

	if (loading) return (
		<div className="oc-empty">
			<CircularProgress size={32} sx={{ color: SM.color }} />
		</div>
	);

	if (!orders.length) return (
		<div className="oc-empty">
			<img src="/img/icons/noimage-list.svg" alt=""
				onError={(e) => { e.currentTarget.style.display = 'none'; }} />
			<Typography>No delivered orders yet</Typography>
		</div>
	);

	return (
		<Stack gap="14px" className="os-delivered-list">
			<Box className="os-delivered-overview">
				<Box className="os-delivered-overview__frame">
					<Box className="os-delivered-overview__intro">
						<Typography className="os-delivered-overview__eyebrow">Archive Window</Typography>
						<Typography className="os-delivered-overview__title">Delivered Orders Retention</Typography>
						<Typography className="os-delivered-overview__desc">
							Delivered orders stay visible for {DELIVERED_RETENTION_DAYS} days after delivery, then they
							are automatically removed from this page.
						</Typography>
					</Box>

					<Stack className="os-delivered-overview__stats" direction="row" flexWrap="wrap" gap="12px">
						<Box className="os-delivered-overview__stat">
							<span className="label">Visible Now</span>
							<strong>{total}</strong>
							<small>Active delivered orders</small>
						</Box>
						<Box className={`os-delivered-overview__stat accent state-${nextCleanupUrgency}`}>
							<span className="label">Next Cleanup</span>
							<strong>{nextAutoDeleteAt ? moment(nextAutoDeleteAt).format('MMM DD, YYYY') : 'No schedule'}</strong>
							<small>
								{nextAutoDeleteOrder
										? `#${nextAutoDeleteOrder._id.slice(-8).toUpperCase()} · ${getRetentionCopy(
												getDaysUntilDeliveredAutoDelete(nextAutoDeleteOrder),
										  )}`
										: 'Waiting for new delivered orders'}
							</small>
						</Box>
						<Box className="os-delivered-overview__stat">
							<span className="label">Cleanup Rule</span>
							<strong>{DELIVERED_RETENTION_DAYS} Days</strong>
							<small>Auto archive with no manual work</small>
						</Box>
					</Stack>
				</Box>
			</Box>

			{visibleOrders.map((order: Order) => {
				const autoDeleteAt = getDeliveredOrderAutoDeleteAt(order);
				const remainingDays = getDaysUntilDeliveredAutoDelete(order);
				const retentionUrgency = getDeliveredRetentionUrgency(order);

				return (
					<div key={order._id} className="oc-card oc-card--delivered" style={{ borderLeftColor: SM.color }}>

						<div className="oc-card-header" style={{ background: SM.light }}>
							<Stack direction="row" alignItems="center" gap="10px">
								<VerifiedIcon sx={{ color: SM.color, fontSize: 18 }} />
								<div>
									<Typography className="oc-order-id">#{order._id.slice(-10).toUpperCase()}</Typography>
									<Typography className="oc-order-date">
										{moment(order.createdAt).format('MMM DD, YYYY · HH:mm')}
									</Typography>
								</div>
							</Stack>
							<div className="oc-status-chip" style={{ color: SM.color, background: SM.bg }}>
								<span className="oc-chip-dot" style={{ background: SM.color }} />
								Delivered
							</div>
						</div>

						<Box className={`os-delivered-retention state-${retentionUrgency}`}>
							<Box>
								<Typography className="os-delivered-retention__label">Auto removal</Typography>
								<Typography className="os-delivered-retention__date">
									{autoDeleteAt ? moment(autoDeleteAt).format('MMM DD, YYYY · HH:mm') : 'Not available'}
								</Typography>
							</Box>
							<Box className={`os-delivered-retention__pill state-${retentionUrgency}`}>
								{getRetentionCopy(remainingDays)}
							</Box>
						</Box>

						{order.orderItems?.map((item) => (
							<OrderItemRow
								key={item._id}
								item={item}
								accentColor={SM.color}
								itemMeta={ITEM_META}
								snapshots={snapshots}
							/>
						))}

						<div className="oc-card-footer">
							<Stack gap="2px">
								<div className="oc-total-line">
									<span>Products</span>
									<strong>${(order.orderTotal - order.orderDelivery).toLocaleString()}</strong>
									<span className="oc-sep-text">+</span>
									<span>Delivery</span>
									<strong>${order.orderDelivery}</strong>
									<span className="oc-sep-text">=</span>
									<Typography className="oc-grand" style={{ color: SM.color }}>
										${order.orderTotal.toLocaleString()}
									</Typography>
								</div>
							</Stack>
							<div className="oc-btn-group">
								<Link href="/product">
									<Button className="btn-oc-pay" startIcon={<ReplayIcon />}>Reorder</Button>
								</Link>
							</div>
						</div>
					</div>
				);
			})}

			{total > 5 && (
				<div className="oc-pagination">
					<Pagination page={page} count={Math.ceil(total / 5)}
						onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
				</div>
			)}
		</Stack>
	);
};

export default DeliveredOrders;
