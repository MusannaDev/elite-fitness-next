import React from 'react';
import { Stack, Typography, Chip } from '@mui/material';
import { Order, OrderItem } from '../../types/order/order';
import { OrderItemType, OrderStatus, PaymentMethod } from '../../enums/order.enum';
import moment from 'moment';
import useDeviceDetect from '../../hooks/useDeviceDetect';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; cls: string; icon: string }> = {
	[OrderStatus.PENDING]:   { label: 'Pending',   cls: 'pending',   icon: '🕐' },
	[OrderStatus.CONFIRMED]: { label: 'Confirmed', cls: 'confirmed', icon: '✅' },
	[OrderStatus.SHIPPING]:  { label: 'Shipping',  cls: 'shipping',  icon: '🚚' },
	[OrderStatus.DELIVERED]: { label: 'Delivered', cls: 'delivered', icon: '📦' },
	[OrderStatus.CANCELLED]: { label: 'Cancelled', cls: 'cancelled', icon: '✕'  },
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
	[PaymentMethod.CASH]:   '💵 Cash',
	[PaymentMethod.CARD]:   '💳 Card',
	[PaymentMethod.ONLINE]: '🌐 Online',
};

const ITEM_ICON: Record<OrderItemType, string> = {
	[OrderItemType.PRODUCT]:   '💊',
	[OrderItemType.EQUIPMENT]: '🏋️',
	[OrderItemType.CLOTHES]:   '👕',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderCardProps {
	order: Order;
	onCancel?: (orderId: string) => void;
	onReview?: (orderId: string) => void;
	onClick?: (orderId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const OrderCard = (props: OrderCardProps) => {
	const { order, onCancel, onReview, onClick } = props;
	const device = useDeviceDetect();

	const meta        = STATUS_META[order.orderStatus];
	const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
	const canCancel   = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CONFIRMED;
	const grandTotal  = order.orderTotal + order.orderDelivery;

	if (device === 'mobile') return <div>ORDER CARD MOBILE</div>;

	return (
		<Stack
			className={`order-card${isCancelled ? ' order-card--cancelled' : ''}`}
			onClick={() => onClick?.(order._id)}
		>
			{/* ── STATUS BAR ── */}
			<div className={`order-card__status-bar order-card__status-bar--${meta.cls}`} />

			{/* ── HEAD ── */}
			<Stack className="order-card__head" direction="row" alignItems="center" flexWrap="wrap" gap="16px">

				{/* Order ID + Date */}
				<Stack className="order-card__col" gap="2px">
					<Typography className="order-card__lbl">Order ID</Typography>
					<Typography className="order-card__id">
						#{order._id.slice(-8).toUpperCase()}
					</Typography>
					<Typography className="order-card__date">
						{moment(order.createdAt).format('DD MMM YYYY')}
					</Typography>
				</Stack>

				{/* Items */}
				<Stack className="order-card__col" gap="4px">
					<Typography className="order-card__lbl">Items</Typography>
					<Stack direction="row" gap="6px" alignItems="center">
						{order.orderItems?.slice(0, 3).map((it: OrderItem) => (
							<span key={it._id} className="order-card__item-badge" title={it.itemType}>
								{ITEM_ICON[it.itemType]}
							</span>
						))}
						{(order.orderItems?.length ?? 0) > 3 && (
							<Typography className="order-card__item-more">
								+{(order.orderItems?.length ?? 0) - 3}
							</Typography>
						)}
					</Stack>
					<Typography className="order-card__val">
						{order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
					</Typography>
				</Stack>

				{/* Payment */}
				<Stack className="order-card__col" gap="2px">
					<Typography className="order-card__lbl">Payment</Typography>
					<Typography className="order-card__val">
						{PAYMENT_LABEL[order.paymentMethod]}
					</Typography>
				</Stack>

				{/* Delivery */}
				<Stack className="order-card__col" gap="2px">
					<Typography className="order-card__lbl">Delivery</Typography>
					<Typography className="order-card__val">
						${order.orderDelivery.toLocaleString()}
					</Typography>
				</Stack>

				{/* Grand Total */}
				<Stack className="order-card__col order-card__col--total" gap="2px">
					<Typography className="order-card__lbl">Grand Total</Typography>
					<Typography className="order-card__total">
						${grandTotal.toLocaleString()}
					</Typography>
				</Stack>

				{/* Status chip */}
				<Stack className="order-card__col order-card__col--status" alignItems="flex-end">
					<span className={`order-card__chip order-card__chip--${meta.cls}`}>
						{meta.icon} {meta.label}
					</span>
				</Stack>
			</Stack>

			{/* ── FOOTER ── */}
			<Stack
				className="order-card__foot"
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				flexWrap="wrap"
				gap="8px"
			>
				<Typography className="order-card__date-stamp">
					🗓 {moment(order.createdAt).format('DD MMM YYYY, HH:mm')}
					{order.deliveredAt && ` · 📦 ${moment(order.deliveredAt).format('DD MMM YYYY')}`}
					{order.cancelledAt && ` · ✕ ${moment(order.cancelledAt).format('DD MMM YYYY')}`}
				</Typography>

				<Stack direction="row" gap="8px" onClick={(e: any) => e.stopPropagation()}>
					{canCancel && (
						<button
							className="order-card__btn order-card__btn--cancel"
							onClick={() => onCancel?.(order._id)}
						>
							Cancel
						</button>
					)}
					{order.orderStatus === OrderStatus.DELIVERED && (
						<button
							className="order-card__btn order-card__btn--review"
							onClick={() => onReview?.(order._id)}
						>
							Review
						</button>
					)}
					<button className="order-card__btn order-card__btn--detail">
						View Details →
					</button>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default OrderCard;