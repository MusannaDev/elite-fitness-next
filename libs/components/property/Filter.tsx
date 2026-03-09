import React, { useCallback, useEffect, useState } from 'react';
import { Collapse, FormControl, MenuItem, Select } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import { propertySquare } from '../../config';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
			background: '#ffffff',
			border: '1px solid #d4d2cf',
			borderRadius: '0px',
			boxShadow: '4px 4px 0px rgba(232,57,42,0.15)',
		},
	},
	MenuListProps: {
		sx: {
			'& .MuiMenuItem-root': {
				fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
				fontSize: '13px',
				fontWeight: 600,
				color: '#333338',
				padding: '8px 14px',
				'&:hover': {
					background: 'rgba(232, 57, 42, 0.08)',
					color: '#e8392a',
				},
				'&.Mui-selected': {
					background: 'rgba(232, 57, 42, 0.12)',
					color: '#e8392a',
					'&:hover': {
						background: 'rgba(232, 57, 42, 0.18)',
					},
				},
				'&.Mui-disabled': {
					color: '#c0bebb',
					opacity: 1,
				},
			},
		},
	},
};

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: any;
	initialInput: PropertiesInquiry;
}

// ─── Accordion Section ──────────────────────────────────────────────────────────
const Section = ({
	icon, label, count, children, open: defaultOpen = false,
}: {
	icon: React.ReactNode;
	label: string;
	count?: number;
	children: React.ReactNode;
	open?: boolean;
}) => {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="accordion-section">
			<div className="accordion-header" onClick={() => setOpen((o) => !o)}>
				<div className="accordion-left">
					<div className={`accordion-icon${open ? ' is-open' : ''}`}>{icon}</div>
					<span className={`accordion-label${open ? ' is-open' : ''}`}>{label}</span>
					{!!count && count > 0 && (
						<div className="accordion-badge">
							<span>{count}</span>
						</div>
					)}
				</div>
				<KeyboardArrowDownRoundedIcon className={`accordion-chevron${open ? ' is-open' : ''}`} />
			</div>
			<Collapse in={open} timeout={220}>
				<div className="accordion-body">{children}</div>
			</Collapse>
		</div>
	);
};

// ─── Tag Chip ───────────────────────────────────────────────────────────────────
const TagChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
	<div className={`tag-chip${active ? ' is-active' : ''}`} onClick={onClick}>
		<span>{label}</span>
	</div>
);

// ─── Count Selector (Rooms / Bedrooms) — vertical list ──────────────────────────
const CountSelector = ({
	buttons, isActive, onSelect,
}: {
	buttons: { label: string; value: number }[];
	isActive: (v: number) => boolean | undefined;
	onSelect: (v: number) => void;
}) => (
	<div className="count-selector">
		{buttons.map((btn) => (
			<div
				key={btn.value}
				className={`count-row${isActive(btn.value) ? ' is-active' : ''}`}
				onClick={() => onSelect(btn.value)}
			>
				<span className="count-row-num">{btn.label}</span>
				<span className="count-row-desc">
					{btn.value === 0 ? 'Any amount' :
					 btn.value === 5 ? '5 or more' :
					 `Exactly ${btn.label}`}
				</span>
				<div className="count-row-check">
					{isActive(btn.value) && <div className="count-row-dot" />}
				</div>
			</div>
		))}
	</div>
);

// ─── Square Range ───────────────────────────────────────────────────────────────
const SquareRangeSection = ({
	searchFilter, propertySquareHandler,
}: { searchFilter: PropertiesInquiry; propertySquareHandler: any }) => {
	const startVal = searchFilter?.search?.squaresRange?.start ?? 0;
	const endVal   = searchFilter?.search?.squaresRange?.end   ?? 500;
	const leftPct  = (startVal / 500) * 100;
	const rightPct = 100 - (endVal  / 500) * 100;

	return (
		<div className="square-range-wrap">
			<div className="sq-row">
				<div className="sq-field">
					<span className="sq-field-label">FROM</span>
					<FormControl fullWidth size="small" className="sq-form-control">
						<Select
							value={startVal}
							onChange={(e: any) => propertySquareHandler(e, 'start')}
							MenuProps={MenuProps}
							displayEmpty
							className="sq-select"
						>
							{propertySquare.map((sq: number) => (
								<MenuItem
									key={sq}
									value={sq}
									disabled={(searchFilter?.search?.squaresRange?.end || 0) < sq}
									className="sq-menu-item"
								>
									{sq}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				<div className="sq-unit-badge">m²</div>

				<div className="sq-field">
					<span className="sq-field-label">TO</span>
					<FormControl fullWidth size="small" className="sq-form-control">
						<Select
							value={endVal}
							onChange={(e: any) => propertySquareHandler(e, 'end')}
							MenuProps={MenuProps}
							displayEmpty
							className="sq-select"
						>
							{propertySquare.map((sq: number) => (
								<MenuItem
									key={sq}
									value={sq}
									disabled={(searchFilter?.search?.squaresRange?.start || 0) > sq}
									className="sq-menu-item"
								>
									{sq}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
			</div>

			{/* Progress track */}
			<div className="sq-track">
				<div
					className="sq-fill"
					style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
				/>
				<div className="sq-track-label sq-track-label--left">{startVal}</div>
				<div className="sq-track-label sq-track-label--right">{endVal}</div>
			</div>
		</div>
	);
};

// ─── Price Range ────────────────────────────────────────────────────────────────
const PriceRangeSection = ({
	searchFilter, propertyPriceHandler,
}: { searchFilter: PropertiesInquiry; propertyPriceHandler: any }) => (
	<div className="price-range-wrap">
		<div className="price-block">
			<div className="price-block-label">
				<span className="price-block-tag">MIN</span>
				<span className="price-block-currency">USD</span>
			</div>
			<div className="price-input-wrap">
				<span className="price-prefix">$</span>
				<input
					type="number"
					placeholder="0"
					min={0}
					value={searchFilter?.search?.pricesRange?.start ?? 0}
					onChange={(e: any) => {
						if (e.target.value >= 0) propertyPriceHandler(e.target.value, 'start');
					}}
					className="price-input"
				/>
			</div>
		</div>

		<div className="price-rule" />

		<div className="price-block">
			<div className="price-block-label">
				<span className="price-block-tag">MAX</span>
				<span className="price-block-currency">USD</span>
			</div>
			<div className="price-input-wrap">
				<span className="price-prefix price-prefix--dim">$</span>
				<input
					type="number"
					placeholder="No limit"
					value={searchFilter?.search?.pricesRange?.end ?? 0}
					onChange={(e: any) => {
						if (e.target.value >= 0) propertyPriceHandler(e.target.value, 'end');
					}}
					className="price-input"
				/>
			</div>
		</div>
	</div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [propertyLocation] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const [propertyType]     = useState<PropertyType[]>(Object.values(PropertyType));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore]     = useState<boolean>(false);

	useEffect(() => {
		if (searchFilter?.search?.locationList?.length == 0) {
			delete searchFilter.search.locationList;
			setShowMore(false);
			router.push(
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.typeList?.length == 0) {
			delete searchFilter.search.typeList;
			router.push(
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.roomsList?.length == 0) {
			delete searchFilter.search.roomsList;
			router.push(
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.options?.length == 0) {
			delete searchFilter.search.options;
			router.push(
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.bedsList?.length == 0) {
			delete searchFilter.search.bedsList;
			router.push(
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.locationList) setShowMore(true);
	}, [searchFilter]);

	const propertyLocationSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.locationList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value) } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
				if (searchFilter?.search?.typeList?.length == 0) { alert('error'); }
			} catch (err: any) {
				console.log('ERROR, propertyLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyTypeSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.typeList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value) } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
				if (searchFilter?.search?.typeList?.length == 0) { alert('error'); }
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyRoomSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (searchFilter?.search?.roomsList?.includes(number)) {
						await router.push(
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, roomsList: searchFilter?.search?.roomsList?.filter((item: Number) => item !== number) } })}`,
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, roomsList: searchFilter?.search?.roomsList?.filter((item: Number) => item !== number) } })}`,
							{ scroll: false },
						);
					} else {
						await router.push(
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, roomsList: [...(searchFilter?.search?.roomsList || []), number] } })}`,
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, roomsList: [...(searchFilter?.search?.roomsList || []), number] } })}`,
							{ scroll: false },
						);
					}
				} else {
					delete searchFilter?.search.roomsList;
					setSearchFilter({ ...searchFilter });
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, propertyRoomSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, options: [...(searchFilter?.search?.options || []), value] } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, options: [...(searchFilter?.search?.options || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.options?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, options: searchFilter?.search?.options?.filter((item: string) => item !== value) } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, options: searchFilter?.search?.options?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, propertyOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyBathSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (searchFilter?.search?.bedsList?.includes(number)) {
						await router.push(
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, bedsList: searchFilter?.search?.bedsList?.filter((item: Number) => item !== number) } })}`,
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, bedsList: searchFilter?.search?.bedsList?.filter((item: Number) => item !== number) } })}`,
							{ scroll: false },
						);
					} else {
						await router.push(
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, bedsList: [...(searchFilter?.search?.bedsList || []), number] } })}`,
							`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, bedsList: [...(searchFilter?.search?.bedsList || []), number] } })}`,
							{ scroll: false },
						);
					}
				} else {
					delete searchFilter?.search.bedsList;
					setSearchFilter({ ...searchFilter });
					await router.push(
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
						`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, propertyBathSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertySquareHandler = useCallback(
		async (e: any, type: string) => {
			const value = e.target.value;
			if (type == 'start') {
				await router.push(
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, squaresRange: { ...searchFilter.search.squaresRange, start: value } } })}`,
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, squaresRange: { ...searchFilter.search.squaresRange, start: value } } })}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, squaresRange: { ...searchFilter.search.squaresRange, end: value } } })}`,
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, squaresRange: { ...searchFilter.search.squaresRange, end: value } } })}`,
					{ scroll: false },
				);
			}
		},
		[searchFilter],
	);

	const propertyPriceHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 } } })}`,
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 } } })}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 } } })}`,
					`/property?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 } } })}`,
					{ scroll: false },
				);
			}
		},
		[searchFilter],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
				`/property?input=${JSON.stringify(initialInput)}`,
				`/property?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const roomButtons = [
		{ label: 'Any', value: 0 },
		{ label: '1',   value: 1 },
		{ label: '2',   value: 2 },
		{ label: '3',   value: 3 },
		{ label: '4',   value: 4 },
		{ label: '5+',  value: 5 },
	];

	const isRoomActive = (val: number) =>
		val === 0 ? !searchFilter?.search?.roomsList : searchFilter?.search?.roomsList?.includes(val);
	const isBedActive = (val: number) =>
		val === 0 ? !searchFilter?.search?.bedsList : searchFilter?.search?.bedsList?.includes(val);

	const locCount    = searchFilter?.search?.locationList?.length || 0;
	const typeCount   = searchFilter?.search?.typeList?.length     || 0;
	const roomCount   = searchFilter?.search?.roomsList?.length    || 0;
	const bedCount    = searchFilter?.search?.bedsList?.length     || 0;
	const optCount    = searchFilter?.search?.options?.length      || 0;
	const totalActive = locCount + typeCount + roomCount + bedCount + optCount;

	if (device === 'mobile') return <div>PROPERTIES FILTER</div>;

	return (
		<div className="filter-main">

			{/* ─── HEADER ─── */}
			<div className="filter-header">
				<div className="filter-header-top">
					<div className="filter-title-block">
						<div className="filter-title-line" />
						<p className="filter-title">FILTER</p>
					</div>
					<button className="reset-btn" onClick={refreshHandler}>
						<RestartAltIcon />
						<span>RESET</span>
					</button>
				</div>

				{totalActive > 0 && (
					<div className="filter-active-bar">
						<span className="filter-active-count">{totalActive}</span>
						<span className="filter-active-text">active filter{totalActive > 1 ? 's' : ''}</span>
					</div>
				)}

				<div className="filter-search">
					<SearchRoundedIcon />
					<input
						value={searchText}
						placeholder="Search..."
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e: any) => {
							if (e.key === 'Enter')
								setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: searchText } });
						}}
					/>
					{searchText && (
						<CancelRoundedIcon
							className="search-clear"
							onClick={() => {
								setSearchText('');
								setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: '' } });
							}}
						/>
					)}
				</div>
			</div>

			{/* ─── BODY ─── */}
			<div className="filter-scroll-body">

				<Section icon={<LocationOnRoundedIcon />} label="Location" count={locCount} open={true}>
					<div className="tag-chips-wrap">
						{propertyLocation.map((loc: string) => {
							const active = (searchFilter?.search?.locationList || []).includes(loc as PropertyLocation);
							return (
								<TagChip key={loc} label={loc} active={active}
									onClick={() => propertyLocationSelectHandler({ target: { checked: !active, value: loc } })}
								/>
							);
						})}
					</div>
				</Section>

				<Section icon={<HomeWorkRoundedIcon />} label="Property Type" count={typeCount} open={true}>
					<div className="tag-chips-wrap">
						{propertyType.map((type: string) => {
							const active = (searchFilter?.search?.typeList || []).includes(type as PropertyType);
							return (
								<TagChip key={type} label={type} active={active}
									onClick={() => propertyTypeSelectHandler({ target: { checked: !active, value: type } })}
								/>
							);
						})}
					</div>
				</Section>

				{/* ROOMS — Number Grid */}
				<Section icon={<MeetingRoomRoundedIcon />} label="Rooms" count={roomCount} open={false}>
					<CountSelector
						buttons={roomButtons}
						isActive={isRoomActive}
						onSelect={propertyRoomSelectHandler}
					/>
				</Section>

				{/* BEDROOMS — Number Grid */}
				<Section icon={<BedRoundedIcon />} label="Bedrooms" count={bedCount} open={false}>
					<CountSelector
						buttons={roomButtons}
						isActive={isBedActive}
						onSelect={propertyBathSelectHandler}
					/>
				</Section>

				{/* OPTIONS */}
				<Section icon={<TuneRoundedIcon />} label="Options" count={optCount} open={false}>
					<div className="options-list">
						{[
							{ value: 'propertyBarter', label: 'Barter',   sub: 'Exchange property',    icon: <SwapHorizRoundedIcon /> },
							{ value: 'propertyRent',   label: 'For Rent', sub: 'Monthly rental',       icon: <KeyRoundedIcon /> },
						].map((opt) => {
							const checked = (searchFilter?.search?.options || []).includes(opt.value);
							return (
								<div
									key={opt.value}
									className={`option-card${checked ? ' is-active' : ''}`}
									onClick={() => propertyOptionSelectHandler({ target: { checked: !checked, value: opt.value } })}
								>
									<div className={`option-icon${checked ? ' is-active' : ''}`}>{opt.icon}</div>
									<div className="option-text">
										<p className={`option-name${checked ? ' is-active' : ''}`}>{opt.label}</p>
										<p className="option-sub">{opt.sub}</p>
									</div>
									<div className={`option-toggle${checked ? ' is-active' : ''}`}>
										<div className="toggle-knob" />
									</div>
								</div>
							);
						})}
					</div>
				</Section>

				{/* SQUARE METER */}
				<Section icon={<SquareFootRoundedIcon />} label="Square Meter" open={false}>
					<SquareRangeSection
						searchFilter={searchFilter}
						propertySquareHandler={propertySquareHandler}
					/>
				</Section>

				{/* PRICE RANGE */}
				<Section icon={<AttachMoneyRoundedIcon />} label="Price Range" open={false}>
					<PriceRangeSection
						searchFilter={searchFilter}
						propertyPriceHandler={propertyPriceHandler}
					/>
				</Section>
			</div>

			{/* ─── FOOTER ─── */}
			<div className="filter-footer">
				<button
					className="apply-btn"
					onClick={() => setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: searchText } })}
				>
					<span className="apply-label">APPLY</span>
					{totalActive > 0 && <span className="apply-count">{totalActive}</span>}
					<SearchRoundedIcon className="apply-icon" />
				</button>
			</div>
		</div>
	);
};

export default Filter;