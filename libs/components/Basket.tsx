import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, IconButton, Menu, Stack, Typography } from '@mui/material';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { CREATE_ORDER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../config';
import { OrderInput } from '../types/order/order.input';
import { OrderStatus, PaymentMethod } from '../enums/order.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { BasketItem } from '../types/order/cart';
import {
  BASKET_UPDATED_EVENT,
  addBasketItem,
  basketToOrderItems,
  clearBasket,
  deleteBasketItem,
  readBasket,
  removeOneBasketItem,
} from '../utils/basket';
import { saveOrderItemSnapshots } from '../utils/orderSnapshot';

const Basket = (): JSX.Element => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [createOrder, { loading }] = useMutation(CREATE_ORDER);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [items, setItems] = useState<BasketItem[]>([]);

  const open = Boolean(anchorEl);

  const itemsPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items],
  );
  const discountRate = useMemo(
    () => (itemsPrice > 500 ? 0.05 : 0),
    [itemsPrice],
  );
  const discountAmount = useMemo(
    () => Math.round(itemsPrice * discountRate * 100) / 100,
    [itemsPrice, discountRate],
  );
  const discountedItemsPrice = useMemo(
    () => Math.round((itemsPrice - discountAmount) * 100) / 100,
    [itemsPrice, discountAmount],
  );
  const shippingCost = discountedItemsPrice < 100 && discountedItemsPrice > 0 ? 5 : 0;
  const totalPrice = useMemo(
    () => Math.round((discountedItemsPrice + shippingCost) * 100) / 100,
    [discountedItemsPrice, shippingCost],
  );
  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  useEffect(() => {
    const sync = () => setItems(readBasket());
    sync();
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', sync);
    window.addEventListener(BASKET_UPDATED_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(BASKET_UPDATED_EVENT, sync as EventListener);
    };
  }, []);

  const handleClose = () => setAnchorEl(null);

  const addOne = (item: BasketItem) => setItems(addBasketItem(item));
  const removeOne = (item: BasketItem) => setItems(removeOneBasketItem(item._id, item.itemType));
  const removeAllOfOne = (item: BasketItem) => setItems(deleteBasketItem(item._id, item.itemType));
  const clearAll = () => {
    clearBasket();
    setItems([]);
  };

  const proceedOrderHandler = async () => {
    try {
      handleClose();
      if (!user?._id) throw new Error('Please login first');
      if (!items.length) throw new Error('Your cart is empty');

      const input: OrderInput = {
        paymentMethod: PaymentMethod.ONLINE,
        orderDelivery: shippingCost,
        orderItems: basketToOrderItems(items, discountRate),
      };
      await createOrder({ variables: { input } });
      saveOrderItemSnapshots(items);
      clearAll();
      await sweetTopSmallSuccessAlert('Purchase completed', 900);
      await router.push(`/order?status=${OrderStatus.PENDING}`);
    } catch (err: any) {
      sweetMixinErrorAlert(err?.message || 'Failed to create order');
    }
  };

  const imageUrl = (path?: string) => {
    if (!path) return '/img/profile/defaultUser.svg';
    if (path.startsWith('http')) return path;
    return `${REACT_APP_API_URL}/${path}`;
  };

  return (
    <div>
      <IconButton
        aria-label="cart"
        id="basket-button"
        aria-controls={open ? 'basket-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          color: '#ff4500',
          '&:hover': {
            backgroundColor: 'transparent',
            color: '#ff4500',
          },
        }}
      >
        <Badge badgeContent={totalCount} color="error" max={99}>
          <LocalMallOutlinedIcon sx={{ fontSize: 26, width: 26, height: 26, color: '#ff4500' }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="basket-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 360,
            p: 1.5,
            mt: 1.2,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#111',
            color: '#fff',
          },
        }}
      >
        <Stack gap={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontSize={14} fontWeight={700}>Cart</Typography>
            {!!items.length && (
              <IconButton size="small" onClick={clearAll} sx={{ color: '#ff6b6b' }}>
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {!items.length ? (
            <Typography fontSize={13} color="rgba(255,255,255,0.7)">Cart is empty.</Typography>
          ) : (
            <Stack gap={1} sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
              {items.map((item) => (
                <Stack
                  key={`${item.itemType}-${item._id}`}
                  direction="row"
                  gap={1}
                  alignItems="center"
                  sx={{ p: 1, borderRadius: 1.5, background: 'rgba(255,255,255,0.05)' }}
                >
                  <img
                    src={imageUrl(item.image)}
                    alt={item.name}
                    style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={12} fontWeight={700} noWrap>{item.name}</Typography>
                    <Typography fontSize={11} color="rgba(255,255,255,0.7)">
                      ${item.price} x {item.quantity}
                    </Typography>
                    <Stack direction="row" gap={0.5} mt={0.5}>
                      <IconButton size="small" onClick={() => removeOne(item)} sx={{ color: '#fff' }}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => addOne(item)} sx={{ color: '#fff' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <IconButton size="small" onClick={() => removeAllOfOne(item)} sx={{ color: '#ff6b6b' }}>
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}

          {!!items.length && (
            <Stack gap={1}>
              <Typography fontSize={12} color="rgba(255,255,255,0.8)">
                Subtotal: ${itemsPrice.toFixed(2)}
              </Typography>
              {discountAmount > 0 && (
                <Typography fontSize={12} color="#8ef0b4">
                  Discount (5%): -${discountAmount.toFixed(2)}
                </Typography>
              )}
              <Typography fontSize={12} color="rgba(255,255,255,0.8)">
                Shipping: ${shippingCost.toFixed(2)}
              </Typography>
              <Typography fontSize={13} fontWeight={700} color="#fff">
                Total: ${totalPrice.toFixed(2)}
              </Typography>
              <Button
                onClick={proceedOrderHandler}
                startIcon={<LocalMallOutlinedIcon />}
                variant="contained"
                disabled={loading}
                sx={{ background: '#ff4500', '&:hover': { background: '#d93d00' } }}
              >
                Purchase
              </Button>
            </Stack>
          )}
        </Stack>
      </Menu>
    </div>
  );
};

export default Basket;
