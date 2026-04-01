import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Order, OrderItem } from '../../types/order/order';
import { OrderItemType, OrderStatus, PaymentMethod } from '../../enums/order.enum';
import moment from 'moment';
import { useRouter } from 'next/router';
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

const TIMELINE_STEPS: OrderStatus[] = [
	OrderStatus.PENDING,
	OrderStatus.CONFIRMED,
	OrderStatus.SHIPPING,
	OrderStatus.DELIVERED,
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderBigCardProps {
	order: Order;
	onCancel?: (orderId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const OrderBigCard = (props: OrderBigCardProps) => {
	const { order, onCancel } = props;
	const device   = useDeviceDetect();
	const router   = useRouter();

	const meta       = STATUS_META[order.orderStatus];
	const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
	const canCancel   = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CONFIRMED;
	const timeIdx     = TIMELINE_STEPS.indexOf(order.orderStatus);
	const grandTotal  = order.orderTotal + order.orderDelivery;

	const goDetailPage = () => {
		router.push(`/mypage?tab=orders&id=${order._id}`);
	};

	if (device === 'mobile') return <div>ORDER BIG CARD MOBILE</div>;

	return (
		<Stack
			className={`order-big-card${isCancelled ? ' order-big-card--cancelled' : ''}`}
			onClick={goDetailPage}
		>
			{/* ── HEADER BAND ── */}
			<Stack
				className="obc__header"
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<Stack gap="2px">
					<Typography className="obc__id">
						#{order._id.slice(-8).toUpperCase()}
					</Typography>
					<Typography className="obc__date">
						{moment(order.createdAt).format('DD MMM YYYY')}
					</Typography>
				</Stack>
				<span className={`obc__chip obc__chip--${meta.cls}`}>
					{meta.icon} {meta.label}
				</span>
			</Stack>

			{/* ── TIMELINE (non-cancelled) ── */}
			{!isCancelled && (
				<Stack className="obc__timeline" direction="row" alignItems="center">
					{TIMELINE_STEPS.map((step, i) => {
						const done    = i <= timeIdx;
						const current = i === timeIdx;
						return (
							<React.Fragment key={step}>
								<Stack
									className={`obc__tl-step${done ? ' done' : ''}${current ? ' current' : ''}`}
									alignItems="center"
									gap="4px"
								>
									<div className="obc__tl-dot">
										{done ? '✓' : i + 1}
									</div>
									<Typography className="obc__tl-label">
										{STATUS_META[step].label}
									</Typography>
								</Stack>
								{i < TIMELINE_STEPS.length - 1 && (
									<div className={`obc__tl-line${i < timeIdx ? ' done' : ''}`} />
								)}
							</React.Fragment>
						);
					})}
				</Stack>
			)}

			{/* ── ITEMS PREVIEW ── */}
			<Stack className="obc__items" gap="8px">
				{order.orderItems?.slice(0, 3).map((item: OrderItem) => (
					<Stack
						key={item._id}
						className="obc__item-row"
						direction="row"
						alignItems="center"
						justifyContent="space-between"
					>
						<Stack direction="row" alignItems="center" gap="10px">
							<div className="obc__item-icon">
								{ITEM_ICON[item.itemType]}
							</div>
							<Stack gap="1px">
								<Typography className="obc__item-id">
									{item.itemId.slice(-12)}
								</Typography>
								<Typography className="obc__item-type">
									{item.itemType}
								</Typography>
							</Stack>
						</Stack>
						<Stack alignItems="flex-end" gap="1px">
							<Typography className="obc__item-qty">×{item.itemQuantity}</Typography>
							<Typography className="obc__item-price">
								${(item.itemPrice * item.itemQuantity).toLocaleString()}
							</Typography>
						</Stack>
					</Stack>
				))}
				{(order.orderItems?.length ?? 0) > 3 && (
					<Typography className="obc__more-items">
						+{(order.orderItems?.length ?? 0) - 3} more item(s)
					</Typography>
				)}
			</Stack>

			{/* ── DIVIDER ── */}
			<div className="obc__divider" />

			{/* ── FOOTER ── */}
			<Stack
				className="obc__footer"
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<Stack gap="2px">
					<Typography className="obc__payment">
						{PAYMENT_LABEL[order.paymentMethod]}
					</Typography>
					<Typography className="obc__delivery">
						Delivery: ${order.orderDelivery.toLocaleString()}
					</Typography>
				</Stack>
				<Stack alignItems="flex-end" gap="2px">
					<Typography className="obc__total-lbl">Grand Total</Typography>
					<Typography className="obc__total">${grandTotal.toLocaleString()}</Typography>
				</Stack>
			</Stack>

			{/* ── ACTIONS ── */}
			<Stack
				className="obc__actions"
				direction="row"
				gap="8px"
				onClick={(e: any) => e.stopPropagation()}
			>
				{canCancel && (
					<button
						className="obc__btn obc__btn--cancel"
						onClick={() => onCancel?.(order._id)}
					>
						Cancel Order
					</button>
				)}
				<button className="obc__btn obc__btn--detail" onClick={goDetailPage}>
					View Details
				</button>
			</Stack>
		</Stack>
	);
};

export default OrderBigCard;