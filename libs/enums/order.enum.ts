export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export const PAYMENT_STATUS_FLOW: Record<OrderStatus, OrderStatus> = {
  [OrderStatus.PENDING]: OrderStatus.PENDING,
  [OrderStatus.CONFIRMED]: OrderStatus.SHIPPING,
  [OrderStatus.SHIPPING]: OrderStatus.SHIPPING,
  [OrderStatus.DELIVERED]: OrderStatus.DELIVERED,
  [OrderStatus.CANCELLED]: OrderStatus.CANCELLED,
};

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
}

export enum OrderItemType {
  PRODUCT = 'PRODUCT',
  EQUIPMENT = 'EQUIPMENT',
  CLOTHES = 'CLOTHES',
}
