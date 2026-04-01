import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import moment from 'moment';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_MY_ORDERS } from '../../apollo/user/query';
import { UPDATE_ORDER } from '../../apollo/user/mutation';
import { T } from '../../libs/types/common';
import { Order, OrderItem, Orders } from '../../libs/types/order/order';
import { OrderInquiry } from '../../libs/types/order/order.input';
import { OrderUpdate } from '../../libs/types/order/order.update';
import { OrderItemType, OrderStatus, PaymentMethod } from '../../libs/enums/order.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

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

// ─── isValidObjectId ──────────────────────────────────────────────────────────

const isValidObjectId = (value?: string | null): boolean =>
	/^[a-fA-F0-9]{24}$/.test(value ?? '');

// ─── Page ─────────────────────────────────────────────────────────────────────

const OrderDetail: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();

	const rawId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
	const orderId = isValidObjectId(rawId) ? rawId : null;

	// Fallback: fetch 1 order matching the id by loading orders list
	const [inquiry, setInquiry] = useState<OrderInquiry>({
		...initialInput,
		page: 1,
		limit: 50,
		search: {},
	});
	const [order, setOrder] = useState<Order | null>(null);
	const [allOrders, setAllOrders] = useState<Order[]>([]);

	/** APOLLO **/
	const [updateOrder] = useMutation(UPDATE_ORDER);

	const { loading, refetch } = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result: Orders = data?.getMyOrders;
			const list = result?.list ?? [];
			setAllOrders(list);
			if (orderId) {
				const found = list.find((o) => o._id === orderId);
				setOrder(found ?? list[0] ?? null);
			} else {
				setOrder(list[0] ?? null);
			}
		},
	});

	useEffect(() => {
		refetch({ input: inquiry });
	}, [inquiry]);

	useEffect(() => {
		if (orderId && allOrders.length > 0) {
			const found = allOrders.find((o) => o._id === orderId);
			if (found) setOrder(found);
		}
	}, [orderId, allOrders]);

	/** HANDLERS **/
	const handleCancel = async () => {
		if (!order) return;
		try {
			const input: OrderUpdate = { orderId: order._id, orderStatus: OrderStatus.CANCELLED };
			await updateOrder({ variables: { input } });
			await sweetTopSmallSuccessAlert('Order cancelled', 800);
			refetch({ input: inquiry });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handleBack = () => router.back();

	if (device === 'mobile') return <h1>ORDER DETAIL MOBILE</h1>;

	if (loading) {
		return (
			<Stack
				sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}
			>
				<CircularProgress size="4rem" />
			</Stack>
		);
	}

	if (!order) {
		return (
			<div id="order-detail-page">
				<div className="od-container">
					<Stack className="od-empty" alignItems="center" justifyContent="center" gap="16px">
						<span className="od-empty__icon">🛍️</span>
						<Typography className="od-empty__title">Order not found</Typography>
						<button className="od-btn od-btn--back" onClick={handleBack}>
							← Go Back
						</button>
					</Stack>
				</div>
			</div>
		);
	}

	const meta        = STATUS_META[order.orderStatus];
	const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
	const canCancel   = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CONFIRMED;
	const timeIdx     = TIMELINE_STEPS.indexOf(order.orderStatus);
	const grandTotal  = order.orderTotal + order.orderDelivery;

	return (
		<div id="order-detail-page">
			<div className="od-container">

				{/* ── BACK ── */}
				<button className="od-back-btn" onClick={handleBack}>
					← Back to Orders
				</button>

				{/* ── HERO HEADER ── */}
				<Stack className="od-hero" direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="20px">
					<Stack gap="6px">
						<Typography className="od-hero__id">
							Order #{order._id.slice(-8).toUpperCase()}
						</Typography>
						<Typography className="od-hero__date">
							Placed on {moment(order.createdAt).format('DD MMMM YYYY, HH:mm')}
						</Typography>
					</Stack>
					<Stack direction="row" gap="12px" alignItems="center">
						<span className={`od-chip od-chip--${meta.cls}`}>
							{meta.icon} {meta.label}
						</span>
						{canCancel && (
							<button className="od-btn od-btn--cancel" onClick={handleCancel}>
								Cancel Order
							</button>
						)}
						{order.orderStatus === OrderStatus.DELIVERED && (
							<button className="od-btn od-btn--review">
								Leave a Review
							</button>
						)}
					</Stack>
				</Stack>

				{/* ── TIMELINE ── */}
				{!isCancelled && (
					<Stack className="od-timeline" direction="row" alignItems="center">
						{TIMELINE_STEPS.map((step, i) => {
							const done    = i <= timeIdx;
							const current = i === timeIdx;
							return (
								<React.Fragment key={step}>
									<Stack
										className={`od-tl-step${done ? ' done' : ''}${current ? ' current' : ''}`}
										alignItems="center"
										gap="8px"
									>
										<div className="od-tl-dot">
											{done ? '✓' : i + 1}
										</div>
										<Typography className="od-tl-label">
											{STATUS_META[step].label}
										</Typography>
									</Stack>
									{i < TIMELINE_STEPS.length - 1 && (
										<div className={`od-tl-line${i < timeIdx ? ' done' : ''}`} />
									)}
								</React.Fragment>
							);
						})}
					</Stack>
				)}

				{/* ── MAIN GRID ── */}
				<Stack className="od-grid" direction="row" gap="24px" flexWrap="wrap">

					{/* ── LEFT: Items ── */}
					<Stack className="od-section od-section--items">
						<Typography className="od-section__title">Order Items</Typography>

						{/* Table Head */}
						<Stack className="od-items-head" direction="row">
							<Typography className="od-items-head__col od-items-head__col--product">Product</Typography>
							<Typography className="od-items-head__col">Type</Typography>
							<Typography className="od-items-head__col">Qty</Typography>
							<Typography className="od-items-head__col">Unit Price</Typography>
							<Typography className="od-items-head__col od-items-head__col--right">Subtotal</Typography>
						</Stack>

						{/* Table Rows */}
						{order.orderItems?.map((item: OrderItem) => (
							<Stack
								key={item._id}
								className="od-item-row"
								direction="row"
								alignItems="center"
							>
								<Stack
									className="od-item-col od-item-col--product"
									direction="row"
									alignItems="center"
									gap="12px"
								>
									<div className="od-item-icon">{ITEM_ICON[item.itemType]}</div>
									<Stack gap="2px">
										<Typography className="od-item-name">
											{item.itemId.slice(-12)}
										</Typography>
										<Typography className="od-item-sub">
											ID: {item._id.slice(-8)}
										</Typography>
									</Stack>
								</Stack>
								<Typography className="od-item-col od-item-type">
									{item.itemType}
								</Typography>
								<Typography className="od-item-col od-item-val">
									×{item.itemQuantity}
								</Typography>
								<Typography className="od-item-col od-item-val">
									${item.itemPrice.toLocaleString()}
								</Typography>
								<Typography className="od-item-col od-item-col--right od-item-subtotal">
									${(item.itemPrice * item.itemQuantity).toLocaleString()}
								</Typography>
							</Stack>
						))}
					</Stack>

					{/* ── RIGHT: Summary + Info ── */}
					<Stack className="od-sidebar" gap="20px">

						{/* Price Summary */}
						<Stack className="od-price-box">
							<Typography className="od-price-box__title">Price Summary</Typography>

							<Stack className="od-price-row" direction="row" justifyContent="space-between">
								<Typography className="od-price-row__lbl">Products</Typography>
								<Typography className="od-price-row__val">
									${order.orderTotal.toLocaleString()}
								</Typography>
							</Stack>

							<Stack className="od-price-row" direction="row" justifyContent="space-between">
								<Typography className="od-price-row__lbl">Delivery</Typography>
								<Typography className="od-price-row__val">
									${order.orderDelivery.toLocaleString()}
								</Typography>
							</Stack>

							<div className="od-price-divider" />

							<Stack className="od-price-row od-price-row--grand" direction="row" justifyContent="space-between">
								<Typography className="od-price-row__lbl">Grand Total</Typography>
								<Typography className="od-price-row__grand">
									${grandTotal.toLocaleString()}
								</Typography>
							</Stack>
						</Stack>

						{/* Order Info */}
						<Stack className="od-info-box">
							<Typography className="od-info-box__title">Order Info</Typography>

							<Stack className="od-info-row" direction="row" justifyContent="space-between">
								<Typography className="od-info-row__lbl">Payment</Typography>
								<Typography className="od-info-row__val">
									{PAYMENT_LABEL[order.paymentMethod]}
								</Typography>
							</Stack>

							<Stack className="od-info-row" direction="row" justifyContent="space-between">
								<Typography className="od-info-row__lbl">Status</Typography>
								<span className={`od-chip od-chip--sm od-chip--${meta.cls}`}>
									{meta.icon} {meta.label}
								</span>
							</Stack>

							<Stack className="od-info-row" direction="row" justifyContent="space-between">
								<Typography className="od-info-row__lbl">Items Count</Typography>
								<Typography className="od-info-row__val">
									{order.orderItems?.length ?? 0}
								</Typography>
							</Stack>
						</Stack>

						{/* Date Stamps */}
						<Stack className="od-stamps" gap="8px">
							<Typography className="od-stamp">
								🗓 Ordered: {moment(order.createdAt).format('DD MMM YYYY, HH:mm')}
							</Typography>
							{order.confirmedAt && (
								<Typography className="od-stamp">
									✅ Confirmed: {moment(order.confirmedAt).format('DD MMM YYYY, HH:mm')}
								</Typography>
							)}
							{order.deliveredAt && (
								<Typography className="od-stamp">
									📦 Delivered: {moment(order.deliveredAt).format('DD MMM YYYY, HH:mm')}
								</Typography>
							)}
							{order.cancelledAt && (
								<Typography className="od-stamp od-stamp--red">
									✕ Cancelled: {moment(order.cancelledAt).format('DD MMM YYYY, HH:mm')}
								</Typography>
							)}
						</Stack>
					</Stack>
				</Stack>

				{/* ── OTHER ORDERS (sidebar list) ── */}
				{allOrders.length > 1 && (
					<Stack className="od-other-orders">
						<Typography className="od-section__title" style={{ marginBottom: 12 }}>
							Other Orders
						</Typography>
						<Stack gap="8px">
							{allOrders
								.filter((o) => o._id !== order._id)
								.slice(0, 5)
								.map((o) => {
									const m = STATUS_META[o.orderStatus];
									return (
										<Stack
											key={o._id}
											className={`od-other-row${o._id === order._id ? ' od-other-row--active' : ''}`}
											direction="row"
											alignItems="center"
											justifyContent="space-between"
											onClick={() => setOrder(o)}
										>
											<Stack gap="2px">
												<Typography className="od-other-row__id">
													#{o._id.slice(-8).toUpperCase()}
												</Typography>
												<Typography className="od-other-row__date">
													{moment(o.createdAt).format('DD MMM YYYY')}
												</Typography>
											</Stack>
											<Stack direction="row" gap="12px" alignItems="center">
												<Typography className="od-other-row__total">
													${(o.orderTotal + o.orderDelivery).toLocaleString()}
												</Typography>
												<span className={`od-chip od-chip--sm od-chip--${m.cls}`}>
													{m.icon} {m.label}
												</span>
											</Stack>
										</Stack>
									);
								})}
						</Stack>
					</Stack>
				)}

			</div>
		</div>
	);
};

OrderDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 50,
		search: {},
	} as OrderInquiry,
};

export default withLayoutBasic(OrderDetail);