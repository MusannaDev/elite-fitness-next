import { OrderItemType } from '../enums/order.enum';
import { BasketItem } from '../types/order/cart';

export interface OrderItemSnapshot {
  itemId: string;
  itemType: OrderItemType;
  name: string;
  image?: string;
}

export type OrderItemSnapshotMap = Record<string, OrderItemSnapshot>;

const STORAGE_KEY = 'elitefit:order-item-snapshot:v1';

const canUseWindow = (): boolean => typeof window !== 'undefined';

export const orderItemSnapshotKey = (itemId: string, itemType: OrderItemType): string =>
  `${itemType}:${itemId}`;

export const readOrderItemSnapshots = (): OrderItemSnapshotMap => {
  if (!canUseWindow()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveOrderItemSnapshots = (items: BasketItem[]): OrderItemSnapshotMap => {
  const current = readOrderItemSnapshots();
  for (const item of items) {
    const key = orderItemSnapshotKey(item._id, item.itemType);
    current[key] = {
      itemId: item._id,
      itemType: item.itemType,
      name: item.name,
      image: item.image,
    };
  }

  if (canUseWindow()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return current;
};

