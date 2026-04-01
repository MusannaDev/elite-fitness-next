export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

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