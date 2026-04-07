import React, { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Order } from '../../types/order/order';

type PaymentDialogProps = {
	open: boolean;
	order: Order | null;
	onClose: () => void;
	onPaid: (orderId: string, paymentIntentId: string) => Promise<void> | void;
};

const FIRST_NAMES = ['Justin', 'Emma', 'Liam', 'Sofia', 'Noah', 'Olivia', 'Daniel', 'Mia'];
const LAST_NAMES = ['Robertson', 'Walker', 'Harris', 'Taylor', 'Johnson', 'Clark', 'Turner', 'Davis'];

const randomFrom = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

const randomDigits = (length: number): string =>
	Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join('');

const formatCardNumber = (value: string): string =>
	value
		.replace(/\D/g, '')
		.slice(0, 16)
		.replace(/(.{4})/g, '$1 ')
		.trim();

const formatExpiry = (value: string): string => {
	const digits = value.replace(/\D/g, '').slice(0, 4);
	if (digits.length < 3) return digits;
	return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const makeRandomExpiry = (): string => {
	const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
	const year = String((new Date().getFullYear() + Math.floor(Math.random() * 4) + 1) % 100).padStart(2, '0');
	return `${month}/${year}`;
};

const makeRandomHolder = (): string => `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;

const makeRandomCard = (): string => formatCardNumber(randomDigits(16));

const OrderPaymentDialog = ({ open, order, onClose, onPaid }: PaymentDialogProps) => {
	const [cardNumber, setCardNumber] = useState<string>('');
	const [expiry, setExpiry] = useState<string>('');
	const [cvv, setCvv] = useState<string>('');
	const [holder, setHolder] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!open) return;
		setCardNumber(makeRandomCard());
		setExpiry(makeRandomExpiry());
		setCvv(randomDigits(3));
		setHolder(makeRandomHolder());
		setError('');
	}, [open, order?._id]);

	const summary = useMemo(() => {
		if (!order) return null;
		const products = Math.max(order.orderTotal - order.orderDelivery, 0);
		return {
			products,
			delivery: Math.max(order.orderDelivery, 0),
			total: Math.max(order.orderTotal, 0),
		};
	}, [order]);

	const validate = (): string => {
		if (!order?._id) return 'Order not found';
		if (cardNumber.replace(/\s/g, '').length !== 16) return 'Card number must be 16 digits';
		if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return 'Expiry should be in MM/YY format';
		if (!/^\d{3,4}$/.test(cvv)) return 'CVV should be 3 or 4 digits';
		if (holder.trim().length < 3) return 'Card holder name is too short';
		return '';
	};

	const payHandler = async () => {
		try {
			const validationError = validate();
			if (validationError) {
				setError(validationError);
				return;
			}
			if (!order?._id) return;

			setLoading(true);
			setError('');
			await new Promise((resolve) => setTimeout(resolve, 650));

			const txId = `DEMO-${Date.now().toString().slice(-8)}`;
			await onPaid(order._id, txId);
			onClose();
		} catch (err: any) {
			setError(err?.message || 'Demo payment failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			maxWidth="sm"
			fullWidth
			className="oc-pay-dialog"
			PaperProps={{ className: 'oc-pay-paper' }}
		>
			<DialogTitle>Card Payment</DialogTitle>
				<DialogContent dividers>
					<Typography className="oc-pay-subtitle">
						Demo checkout: after payment, the order is automatically moved to the Shipping section.
					</Typography>

				{!order || !summary ? null : (
					<>
						<Box className="oc-demo-card">
							<Box className="oc-demo-glow" />
							<Stack direction="row" justifyContent="space-between" alignItems="center" className="oc-demo-card-top">
								<Typography className="oc-demo-bank">Elite Fitness Card</Typography>
								<Box className="oc-demo-chip" />
							</Stack>
							<Typography className="oc-demo-number">
								{cardNumber || '0000 0000 0000 0000'}
							</Typography>
							<Stack direction="row" justifyContent="space-between" alignItems="flex-end" className="oc-demo-bottom">
								<Box>
									<Typography className="oc-demo-label">Card Holder</Typography>
									<Typography className="oc-demo-value">{holder || 'FULL NAME'}</Typography>
								</Box>
								<Box>
									<Typography className="oc-demo-label">Expires</Typography>
									<Typography className="oc-demo-value">{expiry || 'MM/YY'}</Typography>
								</Box>
							</Stack>
						</Box>

						<Stack className="oc-pay-summary" gap="6px">
							<Stack direction="row" justifyContent="space-between">
								<Typography>Products</Typography>
								<strong>${summary.products.toLocaleString()}</strong>
							</Stack>
							<Stack direction="row" justifyContent="space-between">
								<Typography>Delivery</Typography>
								<strong>${summary.delivery.toLocaleString()}</strong>
							</Stack>
							<Stack direction="row" justifyContent="space-between" className="oc-pay-grand">
								<Typography>Total</Typography>
								<strong>${summary.total.toLocaleString()}</strong>
							</Stack>
						</Stack>

						<Stack className="oc-demo-fields" gap="10px">
							<TextField
								label="Card number"
								placeholder="1234 5678 9012 3456"
								value={cardNumber}
								onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
								inputProps={{ inputMode: 'numeric' }}
								fullWidth
								size="small"
							/>

							<Stack direction="row" gap="10px">
								<TextField
									label="Expiry"
									placeholder="MM/YY"
									value={expiry}
									onChange={(e) => setExpiry(formatExpiry(e.target.value))}
									inputProps={{ inputMode: 'numeric' }}
									fullWidth
									size="small"
								/>
								<TextField
									label="CVV"
									placeholder="123"
									value={cvv}
									onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
									inputProps={{ inputMode: 'numeric' }}
									fullWidth
									size="small"
								/>
							</Stack>

							<TextField
								label="Card holder name"
								placeholder="Full name"
								value={holder}
								onChange={(e) => setHolder(e.target.value)}
								fullWidth
								size="small"
							/>
						</Stack>
					</>
				)}

				{error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}

				<Stack direction="row" justifyContent="flex-end" gap="8px" mt={2}>
					<Button onClick={onClose} disabled={loading} className="btn-oc-cancel">Cancel</Button>
					<Button
						onClick={payHandler}
						disabled={loading || !order}
						className="btn-oc-fulfill"
						startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
					>
						{loading ? 'Processing...' : 'Pay'}
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
};

export default OrderPaymentDialog;
