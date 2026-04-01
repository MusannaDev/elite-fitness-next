import { OrderItemType, OrderStatus, PaymentMethod } from '../../enums/order.enum';
import { Member } from '../member/member';

export interface TotalCounter {
  total: number;
}

export interface MeLiked {
  memberId: string;
  likeRefId: string;
  myFavorite: boolean;
}

export interface OrderItem {
  _id: string;
  itemQuantity: number;
  itemPrice: number;
  itemType: OrderItemType;
  orderId: string;
  itemId: string;
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
  confirmedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregation **/
  orderItems?: OrderItem[];
  memberData?: Member;
}

export interface Orders {
  list: Order[];
  metaCounter: TotalCounter[];
}