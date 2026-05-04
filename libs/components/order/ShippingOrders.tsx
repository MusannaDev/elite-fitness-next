import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { UPDATE_ORDER } from '../../../apollo/user/mutation';
import { Order } from '../../types/order/order';
import { OrderInquiry } from '../../types/order/order.input';
import { OrderUpdate } from '../../types/order/order.update';
import { OrderItemType, OrderStatus } from '../../enums/order.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
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

const SM = { color: '#7c3aed', bg: '#ede9fe', light: '#faf5ff' };

interface Props {
	setActiveStatus: (status: OrderStatus) => void;
	refreshSeed?: number;
}

const ShippingOrders = ({ setActiveStatus, refreshSeed = 0 }: Props) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [total,  setTotal]  = useState<number>(0);
	const [page,   setPage]   = useState<number>(1);
	const [snapshots, setSnapshots] = useState<OrderItemSnapshotMap>({});

	const inquiry = useMemo<OrderInquiry>(() => ({
		page,
		limit: 5,
		search: { orderStatus: OrderStatus.SHIPPING },
	}), [page]);

	const [updateOrder] = useMutation(UPDATE_ORDER);

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
	}, [inquiry, page, refreshSeed, refetch]);

	useEffect(() => {
		setSnapshots(readOrderItemSnapshots());
	}, []);

	const deliverHandler = async (orderId: string) => {
		try {
			const ok = await sweetConfirmAlert('Have you received your order?');
			if (!ok) return;
			const input: OrderUpdate = { orderId, orderStatus: OrderStatus.DELIVERED };
			await updateOrder({ variables: { input } });
			await sweetTopSmallSuccessAlert('Order delivered! 📦', 800);
			setActiveStatus(OrderStatus.DELIVERED);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	if (loading) return (
		<Box className="oc-empty">
			<CircularProgress size={32} sx={{ color: SM.color }} />
		</Box>
	);

	if (!orders.length) return (
		<Box className="oc-empty">
			<img src="/img/icons/noimage-list.svg" alt=""
				onError={(e) => { e.currentTarget.style.display = 'none'; }} />
			<Typography>No orders in shipping</Typography>
		</Box>
	);

	return (
		<Stack gap="14px" className="os-shipping-list">
			<Box className="os-shipping-note">
				<Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap="14px" flexWrap="wrap">
					<Box>
						<Typography className="os-shipping-note__title">Estimated Delivery</Typography>
						<Typography className="os-shipping-note__desc">
							Your orders will arrive within 2-3 business days.
						</Typography>
					</Box>
					<Stack className="os-shipping-note__chips" direction="row" gap="8px" flexWrap="wrap">
						<span>Classic Packing</span>
						<span>Live Tracking</span>
						<span>Safe Delivery</span>
						<span>Auto Delivered in 3 Days</span>
					</Stack>
				</Stack>
			</Box>

			{orders.map((order: Order) => (
				<Box key={order._id} className="oc-card oc-card--shipping" style={{ borderLeftColor: SM.color }}>

					<Box className="oc-card-header" style={{ background: SM.light }}>
						<Stack direction="row" alignItems="center" gap="10px">
							<ReceiptLongIcon sx={{ color: SM.color, fontSize: 18 }} />
							<Box>
								<Typography className="oc-order-id">#{order._id.slice(-10).toUpperCase()}</Typography>
								<Typography className="oc-order-date">
									{moment(order.createdAt).format('MMM DD, YYYY · HH:mm')}
								</Typography>
							</Box>
						</Stack>
						<Box className="oc-status-chip" style={{ color: SM.color, background: SM.bg }}>
							<span className="oc-chip-dot" style={{ background: SM.color }} />
							Shipping
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

					<Box className="oc-card-footer">
						<Box className="oc-total-line">
							<span>Products</span>
							<strong>${(order.orderTotal - order.orderDelivery).toLocaleString()}</strong>
							<span className="oc-sep-text">+</span>
							<span>Delivery</span>
							<strong>${order.orderDelivery}</strong>
							<span className="oc-sep-text">=</span>
							<Typography className="oc-grand" style={{ color: SM.color }}>
								${order.orderTotal.toLocaleString()}
							</Typography>
						</Box>
						<Box className="oc-btn-group">
							<Button className="btn-oc-confirm" startIcon={<VerifiedIcon />}
								onClick={() => deliverHandler(order._id)}>Mark Delivered</Button>
						</Box>
					</Box>
				</Box>
			))}

			{total > 5 && (
				<Box className="oc-pagination">
					<Pagination page={page} count={Math.ceil(total / 5)}
						onChange={(_, p) => setPage(p)} shape="rounded" color="primary" />
				</Box>
			)}
		</Stack>
	);
};

export default ShippingOrders;
