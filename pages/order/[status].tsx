import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { CircularProgress } from '@mui/material';
import { OrderStatus } from '../../libs/enums/order.enum';

const STATUS_SET = new Set<string>(Object.values(OrderStatus));

const OrderStatusPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.status;
    const status = (Array.isArray(raw) ? raw[0] : raw) ?? '';
    const normalized = status.toUpperCase();
    const nextStatus = STATUS_SET.has(normalized) ? normalized : OrderStatus.PENDING;
    router.replace(`/order?status=${nextStatus}`);
  }, [router.isReady, router.query.status]);

  return (
    <div className="oc-empty">
      <CircularProgress size={32} />
    </div>
  );
};

export default OrderStatusPage;
