import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import ReplayIcon from '@mui/icons-material/Replay';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { Order } from '../../types/order/order';
import { OrderInquiry } from '../../types/order/order.input';
import { OrderItemType, OrderStatus } from '../../enums/order.enum';
import { T } from '../../types/common';
import { normalizeMyOrdersResponse } from '../../utils/order';
import { OrderItemSnapshotMap, readOrderItemSnapshots } from '../../utils/orderSnapshot';
import OrderItemRow from './OrderItemRow';
import moment from 'moment';

const ITEM_META: Record<OrderItemType, { emoji: string; label: string; bg: string }> = {
	[OrderItemType.PRODUCT]:   { emoji: '💊', label: 'Product',   bg: '#f9fafb' },
	[OrderItemType.EQUIPMENT]: { emoji: '🏋️', label: 'Equipment', bg: '#f3f4f6' },
	[OrderItemType.CLOTHES]:   { emoji: '👕', label: 'Clothes',   bg: '#f9fafb' },
};

const SM = { color: '#6b7280', bg: '#f3f4f6', light: '#f9f9fb' };

interface Props {
	setActiveStatus: (status: OrderStatus) => void;
}

const CancelledOrders = (_props: Props): JSX.Element => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [total,  setTotal]  = useState<number>(0);
	const [page,   setPage]   = useState<number>(1);
	const [snapshots, setSnapshots] = useState<OrderItemSnapshotMap>({});

	const inquiry = useMemo<OrderInquiry>(() => ({
		page,
		limit: 5,
		search: { orderStatus: OrderStatus.CANCELLED },
	}), [page]);

	const { loading, refetch } = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		onCompleted: (data: T) => {
			const normalized = normalizeMyOrdersResponse(data?.getMyOrders);
			setOrders(normalized.list);
			setTotal(normalized.total);
		},
	});

	useEffect(() => {
		refetch({ input: inquiry });
	}, [page]);

	useEffect(() => {
		setSnapshots(readOrderItemSnapshots());
	}, []);

	if (loading) return (
		<div className="oc-empty">
			<CircularProgress size={32} sx={{ color: SM.color }} />
		</div>
	);

	if (!orders.length) return (
		<div className="oc-empty">
			<img src="/img/icons/noimage-list.svg" alt=""
				onError={(e) => { e.currentTarget.style.display = 'none'; }} />
			<Typography>No cancelled orders</Typography>
		</div>
	);

	return (
		<Stack gap="14px" className="os-cancelled-list">
				{orders.map((order: Order) => (
					<div key={order._id} className="oc-card oc-card--cancelled"
						style={{ borderLeftColor: SM.color, opacity: 0.85 }}>

						<div className="oc-card-header" style={{ background: SM.light }}>
							<Stack direction="row" alignItems="center" gap="10px">
								<BlockIcon sx={{ color: SM.color, fontSize: 18 }} />
								<div>
									<Typography className="oc-order-id"
										style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
										#{order._id.slice(-10).toUpperCase()}
									</Typography>
									<Typography className="oc-order-date">
										{moment(order.createdAt).format('MMM DD, YYYY · HH:mm')}
									</Typography>
								</div>
							</Stack>
							<div className="oc-status-chip" style={{ color: SM.color, background: SM.bg }}>
								<span className="oc-chip-dot" style={{ background: SM.color }} />
								Cancelled
							</div>
						</div>

							{order.orderItems?.map((item) => (
								<OrderItemRow
									key={item._id}
									item={item}
									accentColor={SM.color}
									itemMeta={ITEM_META}
									snapshots={snapshots}
									muted
								/>
							))}

						<div className="oc-card-footer">
							<div className="oc-total-line" style={{ opacity: 0.55 }}>
								<span>Total</span>
								<strong style={{ textDecoration: 'line-through' }}>
									${order.orderTotal.toLocaleString()}
								</strong>
							</div>
							<div className="oc-btn-group">
								<Link href="/product">
									<Button className="btn-oc-pay" startIcon={<ReplayIcon />}>Shop Again</Button>
								</Link>
							</div>
						</div>
					</div>
				))}

				{total > 5 && (
					<div className="oc-pagination">
						<Pagination page={page} count={Math.ceil(total / 5)}
							onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
					</div>
				)}
			</Stack>
		);
};

export default CancelledOrders;
