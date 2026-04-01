import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button, Chip, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_ORDERS } from '../../apollo/user/query';
import { UPDATE_ORDER } from '../../apollo/user/mutation';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Order, OrderItem, Orders } from '../../libs/types/order/order';
import { OrderInquiry } from '../../libs/types/order/order.input';
import { OrderUpdate } from '../../libs/types/order/order.update';
import { OrderItemType, OrderStatus, PaymentMethod } from '../../libs/enums/order.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import moment from 'moment';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

const OrdersPage: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();

	const [inquiry, setInquiry]         = useState<OrderInquiry>(initialInput);
	const [orders, setOrders]           = useState<Order[]>([]);
	const [total, setTotal]             = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [activeTab, setActiveTab]     = useState<OrderStatus | 'ALL'>('ALL');
	const [expandedId, setExpandedId]   = useState<string | null>(null);

	/** APOLLO **/
	const [updateOrder] = useMutation(UPDATE_ORDER);

	const { loading, refetch } = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result: Orders = data?.getMyOrders;
			setOrders(result?.list ?? []);
			setTotal(result?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		refetch({ input: inquiry });
	}, [inquiry]);

	/** HANDLERS **/
	const handleTabChange = (tab: OrderStatus | 'ALL') => {
		setActiveTab(tab);
		setCurrentPage(1);
		setInquiry({
			...inquiry,
			page: 1,
			search: tab === 'ALL' ? {} : { orderStatus: tab },
		});
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		setCurrentPage(value);
		setInquiry({ ...inquiry, page: value });
	};

	const handleCancel = async (orderId: string) => {
		try {
			const input: OrderUpdate = { orderId, orderStatus: OrderStatus.CANCELLED };
			await updateOrder({ variables: { input } });
			await sweetTopSmallSuccessAlert('Order cancelled', 800);
			refetch({ input: inquiry });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const toggleExpand = (id: string) =>
		setExpandedId((prev) => (prev === id ? null : id));

	if (device === 'mobile') return <h1>ORDERS MOBILE</h1>;

	return (
		<div id="orders-page">
			<div className="op-container">

				{/* ── HEADER ──────────────────────────────────────────────── */}
				<Stack className="op-header">
					<Stack className="op-header__left">
						<Typography className="op-header__title">My Orders</Typography>
						<Typography className="op-header__sub">
							{total} order{total !== 1 ? 's' : ''} in total
						</Typography>
					</Stack>

					{/* KPI mini-cards */}
					<Stack className="op-kpis" direction="row" gap="12px" flexWrap="wrap">
						{(Object.keys(STATUS_META) as OrderStatus[]).map((s) => (
							<Stack
								key={s}
								className={`op-kpi op-kpi--${STATUS_META[s].cls}`}
								onClick={() => handleTabChange(s)}
							>
								<span className="op-kpi__icon">{STATUS_META[s].icon}</span>
								<Typography className="op-kpi__label">{STATUS_META[s].label}</Typography>
							</Stack>
						))}
					</Stack>
				</Stack>

				{/* ── FILTER TABS ─────────────────────────────────────────── */}
				<Stack className="op-tabs" direction="row" gap="8px" flexWrap="wrap">
					{(['ALL', ...Object.keys(STATUS_META)] as (OrderStatus | 'ALL')[]).map((tab) => (
						<button
							key={tab}
							className={`op-tab${activeTab === tab ? ' op-tab--active' : ''}${tab !== 'ALL' ? ` op-tab--${STATUS_META[tab as OrderStatus].cls}` : ''}`}
							onClick={() => handleTabChange(tab)}
						>
							{tab === 'ALL' ? 'All' : `${STATUS_META[tab as OrderStatus].icon} ${STATUS_META[tab as OrderStatus].label}`}
						</button>
					))}
				</Stack>

				{/* ── CONTENT ─────────────────────────────────────────────── */}
				{loading ? (
					<Stack className="op-loading">
						<CircularProgress size="3rem" thickness={4} />
						<Typography>Loading orders…</Typography>
					</Stack>
				) : orders.length === 0 ? (
					<Stack className="op-empty">
						<span className="op-empty__icon">🛍️</span>
						<Typography className="op-empty__title">No orders found</Typography>
						<Typography className="op-empty__sub">
							{activeTab === 'ALL'
								? "You haven't placed any orders yet."
								: `No ${STATUS_META[activeTab as OrderStatus].label.toLowerCase()} orders.`}
						</Typography>
					</Stack>
				) : (
					<Stack className="op-list" gap="12px">
						{orders.map((order: Order) => {
							const meta        = STATUS_META[order.orderStatus];
							const isOpen      = expandedId === order._id;
							const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
							const canCancel   = order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CONFIRMED;
							const timeIdx     = TIMELINE_STEPS.indexOf(order.orderStatus);
							const grandTotal  = order.orderTotal + order.orderDelivery;

							return (
								<Stack
									key={order._id}
									className={`ocard${isOpen ? ' ocard--open' : ''}${isCancelled ? ' ocard--cancelled' : ''}`}
								>

									{/* ── HEAD ── */}
									<Stack
										className="ocard__head"
										direction="row"
										alignItems="center"
										flexWrap="wrap"
										onClick={() => toggleExpand(order._id)}
									>
										<Stack className="ocard__col" gap="2px">
											<Typography className="ocard__lbl">Order ID</Typography>
											<Typography className="ocard__id">
												#{order._id.slice(-8).toUpperCase()}
											</Typography>
											<Typography className="ocard__date">
												{moment(order.createdAt).format('DD MMM YYYY')}
											</Typography>
										</Stack>

										<Stack className="ocard__col" gap="2px">
											<Typography className="ocard__lbl">Items</Typography>
											<Typography className="ocard__val">
												{order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
											</Typography>
											<Stack direction="row" gap="4px" mt="4px">
												{order.orderItems?.map((it) => (
													<span key={it._id} className="ocard__item-badge" title={it.itemType}>
														{ITEM_ICON[it.itemType]}
													</span>
												))}
											</Stack>
										</Stack>

										<Stack className="ocard__col" gap="2px">
											<Typography className="ocard__lbl">Payment</Typography>
											<Typography className="ocard__val">
												{PAYMENT_LABEL[order.paymentMethod]}
											</Typography>
										</Stack>

										<Stack className="ocard__col" gap="2px">
											<Typography className="ocard__lbl">Delivery</Typography>
											<Typography className="ocard__val">
												${order.orderDelivery.toLocaleString()}
											</Typography>
										</Stack>

										<Stack className="ocard__col ocard__col--total" gap="2px">
											<Typography className="ocard__lbl">Grand Total</Typography>
											<Typography className="ocard__total">
												${grandTotal.toLocaleString()}
											</Typography>
										</Stack>

										<Stack className="ocard__col ocard__col--status">
											<span className={`ocard__chip ocard__chip--${meta.cls}`}>
												{meta.icon} {meta.label}
											</span>
										</Stack>

										<Stack className="ocard__chevron">
											<svg
												style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.25s ease' }}
												width="16" height="16" viewBox="0 0 24 24"
												fill="none" stroke="currentColor" strokeWidth="2.5"
												strokeLinecap="round" strokeLinejoin="round"
											>
												<polyline points="6 9 12 15 18 9" />
											</svg>
										</Stack>
									</Stack>

									{/* ── BODY ── */}
									{isOpen && (
										<Stack className="ocard__body">

											{/* Timeline */}
											{!isCancelled && (
												<Stack className="op-timeline" direction="row" alignItems="center">
													{TIMELINE_STEPS.map((step, i) => {
														const done    = i <= timeIdx;
														const current = i === timeIdx;
														return (
															<React.Fragment key={step}>
																<Stack className={`tl-step${done ? ' tl-step--done' : ''}${current ? ' tl-step--current' : ''}`} alignItems="center" gap="6px">
																	<div className="tl-dot">
																		{done ? '✓' : i + 1}
																	</div>
																	<Typography className="tl-label">
																		{STATUS_META[step].label}
																	</Typography>
																</Stack>
																{i < TIMELINE_STEPS.length - 1 && (
																	<div className={`tl-line${i < timeIdx ? ' tl-line--done' : ''}`} />
																)}
															</React.Fragment>
														);
													})}
												</Stack>
											)}

											{/* Items table */}
											<Stack className="ocard__items-section">
												<Typography className="ocard__section-title">Order Items</Typography>

												{/* Table head */}
												<Stack className="oi-head" direction="row">
													<Typography className="oi-head__col oi-head__col--product">Product</Typography>
													<Typography className="oi-head__col">Type</Typography>
													<Typography className="oi-head__col">Qty</Typography>
													<Typography className="oi-head__col">Unit Price</Typography>
													<Typography className="oi-head__col oi-head__col--right">Subtotal</Typography>
												</Stack>

												{/* Table rows */}
												{order.orderItems?.map((item: OrderItem) => (
													<Stack key={item._id} className="oi-row" direction="row" alignItems="center">
														<Stack className="oi-col oi-col--product" direction="row" alignItems="center" gap="12px">
															<div className="oi-icon">{ITEM_ICON[item.itemType]}</div>
															<Stack>
																<Typography className="oi-item-id">
																	{item.itemId.slice(-12)}
																</Typography>
																<Typography className="oi-item-sub">
																	ID: {item._id.slice(-8)}
																</Typography>
															</Stack>
														</Stack>
														<Typography className="oi-col oi-type-badge">
															{item.itemType}
														</Typography>
														<Typography className="oi-col oi-val">×{item.itemQuantity}</Typography>
														<Typography className="oi-col oi-val">${item.itemPrice.toLocaleString()}</Typography>
														<Typography className="oi-col oi-col--right oi-subtotal">
															${(item.itemPrice * item.itemQuantity).toLocaleString()}
														</Typography>
													</Stack>
												))}
											</Stack>

											{/* Footer: actions + price summary */}
											<Stack className="ocard__foot" direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap="16px">

												{/* Actions */}
												<Stack direction="row" gap="10px">
													{canCancel && (
														<Button
															className="op-btn op-btn--cancel"
															onClick={() => handleCancel(order._id)}
														>
															Cancel Order
														</Button>
													)}
													{order.orderStatus === OrderStatus.DELIVERED && (
														<Button className="op-btn op-btn--review">
															Leave a Review
														</Button>
													)}
												</Stack>

												{/* Price breakdown */}
												<Stack className="price-box">
													<Stack className="price-row" direction="row" justifyContent="space-between">
														<Typography className="price-row__lbl">Products</Typography>
														<Typography className="price-row__val">${order.orderTotal.toLocaleString()}</Typography>
													</Stack>
													<Stack className="price-row" direction="row" justifyContent="space-between">
														<Typography className="price-row__lbl">Delivery</Typography>
														<Typography className="price-row__val">${order.orderDelivery.toLocaleString()}</Typography>
													</Stack>
													<Stack className="price-row price-row--grand" direction="row" justifyContent="space-between">
														<Typography className="price-row__lbl">Grand Total</Typography>
														<Typography className="price-row__grand">${grandTotal.toLocaleString()}</Typography>
													</Stack>
												</Stack>
											</Stack>

											{/* Date stamps */}
											<Stack className="ocard__stamps" direction="row" gap="20px" flexWrap="wrap">
												<Typography className="stamp">🗓 Ordered: {moment(order.createdAt).format('DD MMM YYYY, HH:mm')}</Typography>
												{order.confirmedAt && (
													<Typography className="stamp">✅ Confirmed: {moment(order.confirmedAt).format('DD MMM YYYY, HH:mm')}</Typography>
												)}
												{order.deliveredAt && (
													<Typography className="stamp">📦 Delivered: {moment(order.deliveredAt).format('DD MMM YYYY, HH:mm')}</Typography>
												)}
												{order.cancelledAt && (
													<Typography className="stamp stamp--red">✕ Cancelled: {moment(order.cancelledAt).format('DD MMM YYYY, HH:mm')}</Typography>
												)}
											</Stack>

										</Stack>
									)}
								</Stack>
							);
						})}
					</Stack>
				)}

				{/* ── PAGINATION ──────────────────────────────────────────── */}
				{orders.length > 0 && (
					<Stack className="op-pagination" direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="12px">
						<Typography className="op-pagination__info">
							Showing {orders.length} of {total} orders
						</Typography>
						<Pagination
							page={currentPage}
							count={Math.ceil(total / inquiry.limit)}
							onChange={handlePageChange}
							shape="circular"
							color="primary"
						/>
					</Stack>
				)}

			</div>
		</div>
	);
};

OrdersPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		search: {},
	} as OrderInquiry,
};

export default withLayoutBasic(OrdersPage);