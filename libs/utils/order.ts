import { Order } from '../types/order/order';

interface MetaCounter {
  total?: number;
}

interface OrdersWithMeta {
  list?: Order[];
  metaCounter?: MetaCounter[];
}

export interface NormalizedOrders {
  list: Order[];
  total: number;
}

export const normalizeMyOrdersResponse = (payload: unknown): NormalizedOrders => {
  if (Array.isArray(payload)) {
    const list = payload as Order[];
    return { list, total: list.length };
  }

  const boxed = (payload ?? {}) as OrdersWithMeta;
  const list = Array.isArray(boxed.list) ? boxed.list : [];
  const totalFromMeta = boxed.metaCounter?.[0]?.total;
  const total = typeof totalFromMeta === 'number' ? totalFromMeta : list.length;

  return { list, total };
};

