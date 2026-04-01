import { OrderItemType } from '../../enums/order.enum';

export interface BasketItem {
  _id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  itemType: OrderItemType;
}

