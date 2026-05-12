import React from 'react';
import { useQuery } from '@apollo/client';
import { OrderItem } from '../../types/order/order';
import { OrderItemType } from '../../enums/order.enum';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { OrderItemSnapshotMap, orderItemSnapshotKey } from '../../utils/orderSnapshot';
import { GET_CLOTHE, GET_EQUIPMENT, GET_PRODUCT } from '../../../apollo/user/query';

type ItemMetaMap = Record<OrderItemType, { emoji: string; label: string; bg: string }>;

interface Props {
  item: OrderItem;
  accentColor: string;
  itemMeta: ItemMetaMap;
  snapshots: OrderItemSnapshotMap;
  muted?: boolean;
}

const imageUrl = (path?: string): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${NEXT_PUBLIC_API_URL}/${path}`;
};

const OrderItemRow = ({ item, accentColor, itemMeta, snapshots, muted = false }: Props): JSX.Element => {
  const meta = itemMeta[item.itemType];
  const snapshot = snapshots[orderItemSnapshotKey(item.itemId, item.itemType)];
  const needsEntityFallback = !snapshot?.image || !snapshot?.name;

  const { data: productData } = useQuery(GET_PRODUCT, {
    variables: { input: item.itemId },
    skip: !(needsEntityFallback && item.itemType === OrderItemType.PRODUCT),
    fetchPolicy: 'cache-first',
  });

  const { data: clotheData } = useQuery(GET_CLOTHE, {
    variables: { input: item.itemId },
    skip: !(needsEntityFallback && item.itemType === OrderItemType.CLOTHES),
    fetchPolicy: 'cache-first',
  });

  const { data: equipmentData } = useQuery(GET_EQUIPMENT, {
    variables: { input: item.itemId },
    skip: !(needsEntityFallback && item.itemType === OrderItemType.EQUIPMENT),
    fetchPolicy: 'cache-first',
  });

  const fallbackImageByType =
    item.itemType === OrderItemType.PRODUCT
      ? productData?.getProduct?.productImages?.[0]
      : item.itemType === OrderItemType.CLOTHES
        ? clotheData?.getClothe?.clotheImages?.[0]
        : equipmentData?.getEquipment?.equipmentImages?.[0];

  const fallbackNameByType =
    item.itemType === OrderItemType.PRODUCT
      ? productData?.getProduct?.productName
      : item.itemType === OrderItemType.CLOTHES
        ? clotheData?.getClothe?.clotheName
        : equipmentData?.getEquipment?.equipmentName;

  const resolvedImage = imageUrl(snapshot?.image || fallbackImageByType);
  const itemName = snapshot?.name || fallbackNameByType || meta.label;
  const rowMutedStyle = muted ? { opacity: 0.62 } : undefined;
  const textMutedStyle = muted ? { textDecoration: 'line-through', color: '#9ca3af' } : undefined;

  return (
    <div className="oc-item-row" style={rowMutedStyle}>
      <div className="oc-emoji-box" style={{ background: meta.bg }}>
        {resolvedImage ? (
          <img className="oc-item-thumb" src={resolvedImage} alt={itemName} />
        ) : (
          <span>{meta.emoji}</span>
        )}
      </div>

      <div className="oc-item-meta">
        <p className="oc-item-type" style={textMutedStyle}>{itemName}</p>
      </div>

      <p className="oc-item-price" style={muted ? { color: '#9ca3af' } : undefined}>
        ${item.itemPrice} × {item.itemQuantity}
      </p>

      <p
        className="oc-item-total"
        style={muted ? { color: '#9ca3af', textDecoration: 'line-through' } : { color: accentColor }}
      >
        ${(item.itemPrice * item.itemQuantity).toLocaleString()}
      </p>
    </div>
  );
};

export default OrderItemRow;
