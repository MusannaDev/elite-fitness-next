import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
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
}

const DeliveredOrders = ({ setActiveStatus }: Props) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [total,  setTotal]  = useState<number>(0);
	const [page,   setPage]   = useState<number>(1);
	const [snapshots, setSnapshots] = useState<OrderItemSnapshotMap>({});

	const inquiry = useMemo<OrderInquiry>(() => ({
		page,
		limit: 5,
		search: { orderStatus: OrderStatus.DELIVERED },
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
			<Typography>No delivered orders yet</Typography>
		</div>
	);

	return (
		<Stack gap="14px" className="os-delivered-list">
			{orders.map((order: Order) => (
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

export default DeliveredOrders;
