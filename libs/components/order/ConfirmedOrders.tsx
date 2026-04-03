import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { UPDATE_ORDER } from '../../../apollo/user/mutation';
import { Order } from '../../types/order/order';
import { OrderInquiry } from '../../types/order/order.input';
import { OrderUpdate } from '../../types/order/order.update';
import { OrderItemType, OrderStatus, PAYMENT_STATUS_FLOW } from '../../enums/order.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { normalizeMyOrdersResponse } from '../../utils/order';
import { OrderItemSnapshotMap, readOrderItemSnapshots } from '../../utils/orderSnapshot';
import OrderItemRow from './OrderItemRow';
import AddItemMenuButton from './AddItemMenuButton';
import moment from 'moment';

const ITEM_META: Record<OrderItemType, { emoji: string; label: string; bg: string }> = {
	[OrderItemType.PRODUCT]:   { emoji: '💊', label: 'Product',   bg: '#f3e8ff' },
	[OrderItemType.EQUIPMENT]: { emoji: '🏋️', label: 'Equipment', bg: '#e0f2fe' },
	[OrderItemType.CLOTHES]:   { emoji: '👕', label: 'Clothes',   bg: '#d1fae5' },
};

const SM = { color: '#2563eb', bg: '#dbeafe', light: '#f0f5ff' };

interface Props {
	setActiveStatus: (status: OrderStatus) => void;
}

const ConfirmedOrders = ({ setActiveStatus }: Props) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [total,  setTotal]  = useState<number>(0);
	const [page,   setPage]   = useState<number>(1);
	const [snapshots, setSnapshots] = useState<OrderItemSnapshotMap>({});

	const inquiry = useMemo<OrderInquiry>(() => ({
		page,
		limit: 5,
		search: { orderStatus: OrderStatus.CONFIRMED },
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
	}, [page]);

	useEffect(() => {
		setSnapshots(readOrderItemSnapshots());
	}, []);

	const cancelHandler = async (orderId: string) => {
		try {
			const ok = await sweetConfirmAlert('Cancel this confirmed order?');
			if (!ok) return;
			const input: OrderUpdate = { orderId, orderStatus: OrderStatus.CANCELLED };
			await updateOrder({ variables: { input } });
			await sweetTopSmallSuccessAlert('Order cancelled', 800);
			refetch({ input: inquiry });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const paymentHandler = async (orderId: string) => {
		try {
			const ok = await sweetConfirmAlert('Proceed payment for this order?');
			if (!ok) return;
			const nextStatus = PAYMENT_STATUS_FLOW[OrderStatus.CONFIRMED];
			const input: OrderUpdate = { orderId, orderStatus: nextStatus };
			await updateOrder({ variables: { input } });
			await sweetTopSmallSuccessAlert('Payment confirmed, shipping started.', 900);
			setActiveStatus(nextStatus);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
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
			<Typography>No confirmed orders</Typography>
		</div>
	);

	return (
			<Stack gap="14px" className="os-confirmed-list">
				{orders.map((order: Order) => (
					<div key={order._id} className="oc-card oc-card--confirmed" style={{ borderLeftColor: SM.color }}>

						<div className="oc-card-header" style={{ background: SM.light }}>
							<Stack direction="row" alignItems="center" gap="10px">
								<ReceiptLongIcon sx={{ color: SM.color, fontSize: 18 }} />
								<div>
									<Typography className="oc-order-id">#{order._id.slice(-10).toUpperCase()}</Typography>
									<Typography className="oc-order-date">
										{moment(order.createdAt).format('MMM DD, YYYY · HH:mm')}
									</Typography>
								</div>
							</Stack>
							<div className="oc-status-chip" style={{ color: SM.color, background: SM.bg }}>
								<span className="oc-chip-dot" style={{ background: SM.color }} />
								Confirmed
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
							<div className="oc-btn-group">
								<Button className="btn-oc-cancel" startIcon={<CancelIcon />}
									onClick={() => cancelHandler(order._id)}>Cancel</Button>
								<Button className="btn-oc-fulfill" startIcon={<CreditCardIcon />}
									onClick={() => paymentHandler(order._id)}>Payment</Button>
								<AddItemMenuButton />
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

export default ConfirmedOrders;
