import { OrderStatus } from '../../enums/order.enum';

export interface OrderUpdate {
  orderId: string;
  orderStatus: OrderStatus;
}
