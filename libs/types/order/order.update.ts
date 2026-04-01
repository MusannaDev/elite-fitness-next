import { OrderItemType, OrderStatus, PaymentMethod } from '../../enums/order.enum';

export interface OrderItemUpdate {
  _id: string;
  itemQuantity?: number;
  itemPrice?: number;
  itemType?: OrderItemType;
  itemId?: string;
}

export interface OrderUpdate {
  orderId: string;
  orderStatus?: OrderStatus;
  orderDelivery?: number;
  paymentMethod?: PaymentMethod;
  orderItems?: OrderItemUpdate[];
  confirmedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}