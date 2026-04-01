import React, { useState } from 'react';
import { Collapse } from '@mui/material';
import { OrderInquiry } from '../../types/order/order.input';
import { OrderStatus, PaymentMethod, OrderItemType } from '../../enums/order.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderFilterProps {
	searchFilter: OrderInquiry;
	setSearchFilter: (filter: OrderInquiry) => void;
	initialInput: OrderInquiry;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; icon: string; cls: string }> = {
	[OrderStatus.PENDING]:   { label: 'Pending',   icon: '🕐', cls: 'pending'   },
	[OrderStatus.CONFIRMED]: { label: 'Confirmed', icon: '✅', cls: 'confirmed' },
	[OrderStatus.SHIPPING]:  { label: 'Shipping',  icon: '🚚', cls: 'shipping'  },
	[OrderStatus.DELIVERED]: { label: 'Delivered', icon: '📦', cls: 'delivered' },
	[OrderStatus.CANCELLED]: { label: 'Cancelled', icon: '✕',  cls: 'cancelled' },
};

const PAYMENT_META: Record<PaymentMethod, { label: string; icon: string }> = {
	[PaymentMethod.CASH]:   { label: 'Cash',   icon: '💵' },
	[PaymentMethod.CARD]:   { label: 'Card',   icon: '💳' },
	[PaymentMethod.ONLINE]: { label: 'Online', icon: '🌐' },
};

const ITEM_TYPE_META: Record<OrderItemType, { label: string; icon: string }> = {
	[OrderItemType.PRODUCT]:   { label: 'Product',   icon: '💊' },
	[OrderItemType.EQUIPMENT]: { label: 'Equipment', icon: '🏋️' },
	[OrderItemType.CLOTHES]:   { label: 'Clothes',   icon: '👕' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section = ({
	icon,
	label,
	count,
	children,
	open: defaultOpen = false,
}: {
	icon: React.ReactNode;
	label: string;
	count?: number;
	children: React.ReactNode;
	open?: boolean;
}) => {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="of-section">
			<div className="of-section__header" onClick={() => setOpen((o) => !o)}>
				<div className="of-section__left">
					<div className={`of-section__icon${open ? ' is-open' : ''}`}>{icon}</div>
					<span className={`of-section__label${open ? ' is-open' : ''}`}>{label}</span>
					{!!count && count > 0 && (
						<div className="of-section__badge">
							<span>{count}</span>
						</div>
					)}
				</div>
				<KeyboardArrowDownRoundedIcon
					className={`of-section__chevron${open ? ' is-open' : ''}`}
				/>
			</div>
			<Collapse in={open} timeout={220}>
				<div className="of-section__body">{children}</div>
			</Collapse>
		</div>
	);
};

const TagChip = ({
	label,
	icon,
	cls,
	active,
	onClick,
}: {
	label: string;
	icon?: string;
	cls?: string;
	active: boolean;
	onClick: () => void;
}) => (
	<div
		className={`of-tag${active ? ` of-tag--active${cls ? ` of-tag--${cls}` : ''}` : ''}`}
		onClick={onClick}
	>
		{icon && <span className="of-tag__icon">{icon}</span>}
		<span className="of-tag__label">{label}</span>
	</div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OrderFilter = (props: OrderFilterProps) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();

	const currentStatus  = (searchFilter.search as any)?.orderStatus   as OrderStatus  | undefined;
	const currentPayment = (searchFilter.search as any)?.paymentMethod as PaymentMethod | undefined;
	const currentItemType = (searchFilter.search as any)?.itemType     as OrderItemType | undefined;

	const activeCount =
		(currentStatus   ? 1 : 0) +
		(currentPayment  ? 1 : 0) +
		(currentItemType ? 1 : 0);

	/** HANDLERS **/

	const handleStatusSelect = (status: OrderStatus) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				orderStatus: currentStatus === status ? undefined : status,
			} as any,
		});
	};

	const handlePaymentSelect = (method: PaymentMethod) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				paymentMethod: currentPayment === method ? undefined : method,
			} as any,
		});
	};

	const handleItemTypeSelect = (type: OrderItemType) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				itemType: currentItemType === type ? undefined : type,
			} as any,
		});
	};

	const handleReset = () => {
		setSearchFilter({ ...initialInput });
	};

	if (device === 'mobile') return <div>ORDER FILTER MOBILE</div>;

	return (
		<div className="order-filter">

			{/* ── HEADER ── */}
			<div className="of-header">
				<div className="of-header__top">
					<div className="of-header__title-block">
						<FilterListRoundedIcon className="of-header__title-icon" />
						<p className="of-header__title">FILTER</p>
					</div>
					<button className="of-header__reset" onClick={handleReset}>
						<RestartAltIcon fontSize="small" />
						<span>RESET</span>
					</button>
				</div>

				{activeCount > 0 && (
					<div className="of-active-bar">
						<span className="of-active-bar__count">{activeCount}</span>
						<span className="of-active-bar__text">
							active filter{activeCount > 1 ? 's' : ''}
						</span>
					</div>
				)}
			</div>

			{/* ── BODY ── */}
			<div className="of-body">

				{/* Order Status */}
				<Section
					icon={<LocalShippingOutlinedIcon fontSize="small" />}
					label="Order Status"
					count={currentStatus ? 1 : 0}
					open={true}
				>
					<div className="of-tags-wrap">
						{(Object.keys(STATUS_META) as OrderStatus[]).map((status) => (
							<TagChip
								key={status}
								label={STATUS_META[status].label}
								icon={STATUS_META[status].icon}
								cls={STATUS_META[status].cls}
								active={currentStatus === status}
								onClick={() => handleStatusSelect(status)}
							/>
						))}
					</div>
				</Section>

				{/* Payment Method */}
				<Section
					icon={<PaymentOutlinedIcon fontSize="small" />}
					label="Payment Method"
					count={currentPayment ? 1 : 0}
					open={true}
				>
					<div className="of-tags-wrap">
						{(Object.keys(PAYMENT_META) as PaymentMethod[]).map((method) => (
							<TagChip
								key={method}
								label={PAYMENT_META[method].label}
								icon={PAYMENT_META[method].icon}
								active={currentPayment === method}
								onClick={() => handlePaymentSelect(method)}
							/>
						))}
					</div>
				</Section>

				{/* Item Type */}
				<Section
					icon={<CategoryOutlinedIcon fontSize="small" />}
					label="Item Type"
					count={currentItemType ? 1 : 0}
					open={false}
				>
					<div className="of-tags-wrap">
						{(Object.keys(ITEM_TYPE_META) as OrderItemType[]).map((type) => (
							<TagChip
								key={type}
								label={ITEM_TYPE_META[type].label}
								icon={ITEM_TYPE_META[type].icon}
								active={currentItemType === type}
								onClick={() => handleItemTypeSelect(type)}
							/>
						))}
					</div>
				</Section>
			</div>

			{/* ── FOOTER ── */}
			<div className="of-footer">
				<button
					className="of-apply-btn"
					onClick={() => setSearchFilter({ ...searchFilter })}
				>
					<span className="of-apply-btn__label">APPLY</span>
					{activeCount > 0 && (
						<span className="of-apply-btn__count">{activeCount}</span>
					)}
					<SearchRoundedIcon className="of-apply-btn__icon" fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default OrderFilter;