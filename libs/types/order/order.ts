import { OrderStatus, PaymentMethod, OrderItemType } from '../../enums/order.enum';

export interface OrderItem {
  _id: string;
  itemId: string;
  itemType: OrderItemType;
  itemPrice: number;
  itemQuantity: number;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}

export interface Orders {
  list: Order[];
  metaCounter: { total: number }[];
}
