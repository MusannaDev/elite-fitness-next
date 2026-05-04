import { OrderStatus } from '../enums/order.enum';
import { Order } from '../types/order/order';

const DAY_MS = 24 * 60 * 60 * 1000;

export const SHIPPING_AUTO_DELIVER_DAYS = 3;
export const DELIVERED_RETENTION_DAYS = 30;
export type DeliveredRetentionUrgency = 'fresh' | 'warning' | 'danger';

const toTimestamp = (value?: Date | string | number | null): number => {
	if (!value) return 0;
	const timestamp = new Date(value).getTime();
	return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getOrderLifecycleAnchor = (order: Order): number =>
	toTimestamp(order.updatedAt) || toTimestamp(order.createdAt);

export const isOrderReadyForAutoDelivery = (order: Order, now = Date.now()): boolean => {
	if (order.orderStatus !== OrderStatus.SHIPPING) return false;
	const anchor = getOrderLifecycleAnchor(order);
	return anchor > 0 && now - anchor >= SHIPPING_AUTO_DELIVER_DAYS * DAY_MS;
};

export const getDeliveredOrderAutoDeleteAt = (order: Order): number | null => {
	if (order.orderStatus !== OrderStatus.DELIVERED) return null;
	const anchor = getOrderLifecycleAnchor(order);
	if (!anchor) return null;
	return anchor + DELIVERED_RETENTION_DAYS * DAY_MS;
};

export const isDeliveredOrderExpired = (order: Order, now = Date.now()): boolean => {
	const autoDeleteAt = getDeliveredOrderAutoDeleteAt(order);
	return autoDeleteAt !== null && autoDeleteAt <= now;
};

export const getDaysUntilDeliveredAutoDelete = (order: Order, now = Date.now()): number | null => {
	const autoDeleteAt = getDeliveredOrderAutoDeleteAt(order);
	if (autoDeleteAt === null) return null;
	return Math.max(0, Math.ceil((autoDeleteAt - now) / DAY_MS));
};

export const getDeliveredRetentionUrgency = (
	order: Order,
	now = Date.now(),
): DeliveredRetentionUrgency => {
	const remainingDays = getDaysUntilDeliveredAutoDelete(order, now);
	if (remainingDays === 0) return 'danger';
	if (remainingDays !== null && remainingDays <= 7) return 'warning';
	return 'fresh';
};
