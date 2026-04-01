import { OrderItemInput } from '../types/order/order.input';
import { BasketItem } from '../types/order/cart';

export const BASKET_STORAGE_KEY = 'elitefit:basket:v1';
export const BASKET_UPDATED_EVENT = 'elitefit:basket-updated';

const canUseWindow = (): boolean => typeof window !== 'undefined';

const emitBasketUpdated = () => {
  if (!canUseWindow()) return;
  window.dispatchEvent(new Event(BASKET_UPDATED_EVENT));
};

export const readBasket = (): BasketItem[] => {
  if (!canUseWindow()) return [];
  try {
    const raw = window.localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeBasket = (items: BasketItem[]): void => {
  if (!canUseWindow()) return;
  window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
  emitBasketUpdated();
};

export const clearBasket = (): void => {
  writeBasket([]);
};

export const addBasketItem = (item: BasketItem): BasketItem[] => {
  const items = readBasket();
  const idx = items.findIndex((it) => it._id === item._id && it.itemType === item.itemType);
  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
  } else {
    items.push({ ...item, quantity: Math.max(1, item.quantity || 1) });
  }
  writeBasket(items);
  return items;
};

export const removeOneBasketItem = (itemId: string, itemType: string): BasketItem[] => {
  const items = readBasket();
  const idx = items.findIndex((it) => it._id === itemId && it.itemType === itemType);
  if (idx < 0) return items;
  const target = items[idx];
  if (target.quantity <= 1) {
    items.splice(idx, 1);
  } else {
    items[idx] = { ...target, quantity: target.quantity - 1 };
  }
  writeBasket(items);
  return items;
};

export const deleteBasketItem = (itemId: string, itemType: string): BasketItem[] => {
  const next = readBasket().filter((it) => !(it._id === itemId && it.itemType === itemType));
  writeBasket(next);
  return next;
};

export const basketToOrderItems = (items: BasketItem[]): OrderItemInput[] =>
  items.map((item) => ({
    itemId: item._id,
    itemType: item.itemType,
    itemPrice: item.price,
    itemQuantity: item.quantity,
  }));

