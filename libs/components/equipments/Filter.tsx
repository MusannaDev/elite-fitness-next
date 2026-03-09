import React, { useCallback, useEffect, useState } from 'react';
import { Collapse } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	EquipmentCategory,
	EquipmentMaterial,
	EquipmentLocation,
	EquipmentWeightCapacity,
} from '../../enums/equipment.enum';
import { EquipmentsInquiry } from '../../types/equipment/equipment.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface FilterType {
	searchFilter: EquipmentsInquiry;
	setSearchFilter: any;
	initialInput: EquipmentsInquiry;
}

// ─── Accordion Section ──────────────────────────────────────────────────────────
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

// ─── Price Range ────────────────────────────────────────────────────────────────
const PriceRangeSection = ({
	searchFilter,
	equipmentPriceHandler,
}: {
	searchFilter: EquipmentsInquiry;
	equipmentPriceHandler: any;
}) => (
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
						if (e.target.value >= 0) equipmentPriceHandler(e.target.value, 'start');
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
						if (e.target.value >= 0) equipmentPriceHandler(e.target.value, 'end');
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
	const [equipmentCategory] = useState<EquipmentCategory[]>(Object.values(EquipmentCategory));
	const [equipmentMaterial] = useState<EquipmentMaterial[]>(Object.values(EquipmentMaterial));
	const [equipmentLocation] = useState<EquipmentLocation[]>(Object.values(EquipmentLocation));
	const [equipmentWeightCapacity] = useState<EquipmentWeightCapacity[]>(Object.values(EquipmentWeightCapacity));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);

	useEffect(() => {
		if (searchFilter?.search?.categoryList?.length == 0) {
			delete searchFilter.search.categoryList;
			setShowMore(false);
			router
				.push(
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					{ scroll: false },
				)
				.then();
		}
		if (searchFilter?.search?.materialList?.length == 0) {
			delete searchFilter.search.materialList;
			router
				.push(
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					{ scroll: false },
				)
				.then();
		}
		if (searchFilter?.search?.locationList?.length == 0) {
			delete searchFilter.search.locationList;
			router
				.push(
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					{ scroll: false },
				)
				.then();
		}
		if (searchFilter?.search?.weightCapacityList?.length == 0) {
			delete searchFilter.search.weightCapacityList;
			router
				.push(
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
					{ scroll: false },
				)
				.then();
		}
		if (searchFilter?.search?.categoryList) setShowMore(true);
	}, [searchFilter]);

	const equipmentCategorySelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.categoryList?.includes(value)) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value) } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, equipmentCategorySelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const equipmentMaterialSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, materialList: [...(searchFilter?.search?.materialList || []), value] } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, materialList: [...(searchFilter?.search?.materialList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.materialList?.includes(value)) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, materialList: searchFilter?.search?.materialList?.filter((item: string) => item !== value) } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, materialList: searchFilter?.search?.materialList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, equipmentMaterialSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const equipmentLocationSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.locationList?.includes(value)) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value) } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, equipmentLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const equipmentWeightCapacitySelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightCapacityList: [...(searchFilter?.search?.weightCapacityList || []), value] } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightCapacityList: [...(searchFilter?.search?.weightCapacityList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.weightCapacityList?.includes(value)) {
					await router.push(
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightCapacityList: searchFilter?.search?.weightCapacityList?.filter((item: string) => item !== value) } })}`,
						`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightCapacityList: searchFilter?.search?.weightCapacityList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, equipmentWeightCapacitySelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const equipmentPriceHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 } } })}`,
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 } } })}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 } } })}`,
					`/equipment?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 } } })}`,
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
				`/equipment?input=${JSON.stringify(initialInput)}`,
				`/equipment?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const catCount = searchFilter?.search?.categoryList?.length || 0;
	const materialCount = searchFilter?.search?.materialList?.length || 0;
	const locationCount = searchFilter?.search?.locationList?.length || 0;
	const weightCapCount = searchFilter?.search?.weightCapacityList?.length || 0;
	const totalActive = catCount + materialCount + locationCount + weightCapCount;

	if (device === 'mobile') return <div>EQUIPMENTS FILTER</div>;

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
				{/* CATEGORY */}
				<Section icon={<CategoryRoundedIcon />} label="Category" count={catCount} open={true}>
					<div className="tag-chips-wrap">
						{equipmentCategory.map((cat: string) => {
							const active = (searchFilter?.search?.categoryList || []).includes(cat as EquipmentCategory);
							return (
								<TagChip
									key={cat}
									label={cat}
									active={active}
									onClick={() =>
										equipmentCategorySelectHandler({ target: { checked: !active, value: cat } })
									}
								/>
							);
						})}
					</div>
				</Section>

				{/* MATERIAL */}
				<Section icon={<FitnessCenterRoundedIcon />} label="Material" count={materialCount} open={true}>
					<div className="tag-chips-wrap">
						{equipmentMaterial.map((material: string) => {
							const active = (searchFilter?.search?.materialList || []).includes(
								material as EquipmentMaterial,
							);
							return (
								<TagChip
									key={material}
									label={material}
									active={active}
									onClick={() =>
										equipmentMaterialSelectHandler({ target: { checked: !active, value: material } })
									}
								/>
							);
						})}
					</div>
				</Section>

				{/* LOCATION */}
				<Section icon={<LocationOnRoundedIcon />} label="Location" count={locationCount} open={false}>
					<div className="tag-chips-wrap">
						{equipmentLocation.map((location: string) => {
							const active = (searchFilter?.search?.locationList || []).includes(
								location as EquipmentLocation,
							);
							return (
								<TagChip
									key={location}
									label={location}
									active={active}
									onClick={() =>
										equipmentLocationSelectHandler({ target: { checked: !active, value: location } })
									}
								/>
							);
						})}
					</div>
				</Section>

				{/* WEIGHT CAPACITY */}
				<Section icon={<ScaleRoundedIcon />} label="Weight Capacity" count={weightCapCount} open={false}>
					<div className="tag-chips-wrap">
						{equipmentWeightCapacity.map((cap: string) => {
							const active = (searchFilter?.search?.weightCapacityList || []).includes(
								cap as EquipmentWeightCapacity,
							);
							return (
								<TagChip
									key={cap}
									label={cap}
									active={active}
									onClick={() =>
										equipmentWeightCapacitySelectHandler({ target: { checked: !active, value: cap } })
									}
								/>
							);
						})}
					</div>
				</Section>

				{/* PRICE RANGE */}
				<Section icon={<AttachMoneyRoundedIcon />} label="Price Range" open={false}>
					<PriceRangeSection searchFilter={searchFilter} equipmentPriceHandler={equipmentPriceHandler} />
				</Section>
			</div>

			{/* ─── FOOTER ─── */}
			<div className="filter-footer">
				<button
					className="apply-btn"
					onClick={() =>
						setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: searchText } })
					}
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