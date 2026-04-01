import { Direction } from '../../enums/common.enum';
import { OrderItemType, OrderStatus, PaymentMethod } from '../../enums/order.enum';

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  itemType: OrderItemType;
  itemId: string;
}

export interface OrderInput {
  orderDelivery: number;
  paymentMethod: PaymentMethod;
  orderItems: OrderItemInput[];
  memberId?: string;
}

interface OISearch {
  memberId?: string;
  orderStatus?: OrderStatus;
  paymentMethod?: PaymentMethod;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: OISearch;
}

interface AOISearch {
  orderStatus?: OrderStatus;
}

export interface AgentOrderInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: AOISearch;
}

export interface AllOrdersInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
}