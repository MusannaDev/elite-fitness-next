import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
	Pagination, Stack, Typography, Chip, Box,
	Select, MenuItem, FormControl, InputLabel, Slider, Tooltip,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Equipment } from '../../types/equipment/equipment';
import { EquipmentsInquiry } from '../../types/equipment/equipment.input';
import {
	EquipmentCategory, EquipmentLocation, EquipmentMaterial,
	EquipmentStatus, EquipmentWeightCapacity,
} from '../../enums/equipment.enum';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_EQUIPMENTS } from '../../../apollo/user/query';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

const CATEGORY_COLORS: Record<EquipmentCategory, string> = {
	[EquipmentCategory.MACHINES]:    '#3b82f6',
	[EquipmentCategory.STRENGTH]:    '#f97316',
	[EquipmentCategory.ACCESSORIES]: '#a855f7',
	[EquipmentCategory.CARDIO]:      '#10b981',
	[EquipmentCategory.OTHER]:       '#6b7280',
};

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
	[EquipmentCategory.MACHINES]:    'Machines',
	[EquipmentCategory.STRENGTH]:    'Strength',
	[EquipmentCategory.ACCESSORIES]: 'Accessories',
	[EquipmentCategory.CARDIO]:      'Cardio',
	[EquipmentCategory.OTHER]:       'Other',
};

const STATUS_COLOR: Record<EquipmentStatus, string> = {
	[EquipmentStatus.ACTIVE]: '#059669',
	[EquipmentStatus.SOLD]:   '#dc2626',
	[EquipmentStatus.DELETE]: '#9ca3af',
};

const MemberEquipments: NextPage = ({ initialInput, ...props }: any) => {
	const device       = useDeviceDetect();
	const router       = useRouter();
	const { memberId } = router.query;

	const [searchFilter,  setSearchFilter]  = useState<EquipmentsInquiry>({ ...initialInput });
	const [equipments,    setEquipments]    = useState<Equipment[]>([]);
	const [total,         setTotal]         = useState<number>(0);
	const [showFilters,   setShowFilters]   = useState(false);

	const [selCategories, setSelCategories] = useState<EquipmentCategory[]>([]);
	const [selMaterials,  setSelMaterials]  = useState<EquipmentMaterial[]>([]);
	const [selLocations,  setSelLocations]  = useState<EquipmentLocation[]>([]);
	const [selWeightCaps, setSelWeightCaps] = useState<EquipmentWeightCapacity[]>([]);
	const [priceRange,    setPriceRange]    = useState<[number, number]>([0, 10000]);

	const { loading, refetch } = useQuery(GET_EQUIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setEquipments(data?.getEquipments?.list ?? []);
			setTotal(data?.getEquipments?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => { refetch().then(); }, [searchFilter]);
	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	const paginationHandler = (_: T, value: number) =>
		setSearchFilter({ ...searchFilter, page: value });

	const applyFilters = () => {
		setSearchFilter((prev) => ({
			...prev, page: 1,
			search: {
				...prev.search,
				categoryList:       selCategories.length ? selCategories : undefined,
				materialList:       selMaterials.length  ? selMaterials  : undefined,
				locationList:       selLocations.length  ? selLocations  : undefined,
				weightCapacityList: selWeightCaps.length ? selWeightCaps : undefined,
				pricesRange: priceRange[0] !== 0 || priceRange[1] !== 10000
					? { start: priceRange[0], end: priceRange[1] } : undefined,
			},
		}));
	};

	const clearFilters = () => {
		setSelCategories([]); setSelMaterials([]); setSelLocations([]);
		setSelWeightCaps([]); setPriceRange([0, 10000]);
		setSearchFilter({ ...initialInput, search: { memberId: memberId as string } });
	};

	const activeFilterCount =
		selCategories.length + selMaterials.length + selLocations.length +
		selWeightCaps.length + (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0);

	if (device === 'mobile') return <div>MEMBER EQUIPMENTS MOBILE</div>;

	return (
		<div id="member-equipments-page">

			{/* PAGE HEADER */}
			<Stack className="meq-page-header">
				<Stack className="meq-page-header-left">
					<Box className="meq-header-icon-wrap"><FitnessCenterIcon /></Box>
					<Box>
						<Typography className="meq-page-title">Equipment Listings</Typography>
						<Typography className="meq-page-sub">
							{loading ? 'Loading…' : total > 0 ? `${total} items available` : 'No equipment yet'}
						</Typography>
					</Box>
				</Stack>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Chip icon={<InventoryOutlinedIcon />} label={`${total} Items`} className="meq-total-chip" size="small" />
					<button
						className={`meq-filter-toggle${showFilters ? ' open' : ''}${activeFilterCount > 0 ? ' has-filters' : ''}`}
						onClick={() => setShowFilters((v) => !v)}
					>
						<TuneRoundedIcon fontSize="small" />
						Filters
						{activeFilterCount > 0 && <span className="meq-filter-badge">{activeFilterCount}</span>}
					</button>
				</Stack>
			</Stack>

			{/* FILTER PANEL */}
			{showFilters && (
				<Stack className="meq-filter-panel">
					<Stack className="meq-filter-selects">

						{/* Category: FREE_WEIGHTS | MACHINES | ACCESSORIES */}
						<FormControl className="meq-filter-field" size="small">
							<InputLabel>Category</InputLabel>
							<Select multiple value={selCategories} label="Category"
								onChange={(e) => setSelCategories(e.target.value as EquipmentCategory[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as EquipmentCategory[]).map((v) => <Chip key={v} label={CATEGORY_LABELS[v]} size="small" />)}
									</Stack>
								)}>
								{Object.values(EquipmentCategory).map((c) => (
									<MenuItem key={c} value={c}>{CATEGORY_LABELS[c]}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Material: STEEL | IRON | RUBBER | FOAM | ALUMINUM | PLASTIC */}
						<FormControl className="meq-filter-field" size="small">
							<InputLabel>Material</InputLabel>
							<Select multiple value={selMaterials} label="Material"
								onChange={(e) => setSelMaterials(e.target.value as EquipmentMaterial[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as EquipmentMaterial[]).map((v) => <Chip key={v} label={v} size="small" />)}
									</Stack>
								)}>
								{Object.values(EquipmentMaterial).map((m) => (
									<MenuItem key={m} value={m}>{m}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Location: INDOOR | OUTDOOR | BOTH */}
						<FormControl className="meq-filter-field" size="small">
							<InputLabel>Location</InputLabel>
							<Select multiple value={selLocations} label="Location"
								onChange={(e) => setSelLocations(e.target.value as EquipmentLocation[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as EquipmentLocation[]).map((v) => <Chip key={v} label={v} size="small" />)}
									</Stack>
								)}>
								{Object.values(EquipmentLocation).map((l) => (
									<MenuItem key={l} value={l}>{l}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* WeightCapacity: 50KG | 100KG | … | 500KG */}
						<FormControl className="meq-filter-field" size="small">
							<InputLabel>Weight Cap.</InputLabel>
							<Select multiple value={selWeightCaps} label="Weight Cap."
								onChange={(e) => setSelWeightCaps(e.target.value as EquipmentWeightCapacity[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as EquipmentWeightCapacity[]).map((v) => <Chip key={v} label={v} size="small" />)}
									</Stack>
								)}>
								{Object.values(EquipmentWeightCapacity).map((w) => (
									<MenuItem key={w} value={w}>{w}</MenuItem>
								))}
							</Select>
						</FormControl>

					</Stack>

					{/* pricesRange: { start, end } */}
					<Stack className="meq-price-row">
						<Typography className="meq-price-label">
							Price Range: <strong>${priceRange[0].toLocaleString()}</strong> — <strong>${priceRange[1].toLocaleString()}</strong>
						</Typography>
						<Slider
							value={priceRange} min={0} max={10000} step={100}
							onChange={(_: any, v: any) => setPriceRange(v as [number, number])}
							valueLabelDisplay="auto" valueLabelFormat={(v: any) => `$${v}`}
							className="meq-price-slider"
						/>
					</Stack>

					<Stack direction="row" gap={1.5} className="meq-filter-actions">
						<button className="meq-btn-apply" onClick={applyFilters}>
							<FilterListRoundedIcon fontSize="small" /> Apply Filters
						</button>
						<button className="meq-btn-clear" onClick={clearFilters}>
							<ClearRoundedIcon fontSize="small" /> Clear
						</button>
					</Stack>
				</Stack>
			)}

			{/* TABLE */}
			<Stack className="meq-table-wrap">

				{equipments.length > 0 && (
					<Stack className="meq-col-header">
						<Typography className="meq-th th-item">Equipment</Typography>
						<Typography className="meq-th th-category"><CategoryOutlinedIcon fontSize="inherit" /> Category</Typography>
						<Typography className="meq-th th-material">Material</Typography>
						<Typography className="meq-th th-location"><LocationOnOutlinedIcon fontSize="inherit" /> Location</Typography>
						<Typography className="meq-th th-weight"><ScaleOutlinedIcon fontSize="inherit" /> Cap.</Typography>
						<Typography className="meq-th th-price">Price</Typography>
						<Typography className="meq-th th-stock">Stock</Typography>
					</Stack>
				)}

				{loading && (
					<Stack className="meq-skeleton-list">
						{[1, 2, 3].map((i) => <Box key={i} className="meq-skeleton-row" />)}
					</Stack>
				)}

				{!loading && equipments.length === 0 && (
					<Stack className="meq-empty">
						<Box className="meq-empty-icon-wrap"><FitnessCenterIcon /></Box>
						<Typography className="meq-empty-title">No Equipment Found</Typography>
						<Typography className="meq-empty-desc">
							{activeFilterCount > 0 ? 'Try adjusting your filters.' : "This sales manager hasn't listed any equipment yet."}
						</Typography>
						{activeFilterCount > 0 && (
							<button className="meq-btn-clear" onClick={clearFilters}>
								<ClearRoundedIcon fontSize="small" /> Clear Filters
							</button>
						)}
					</Stack>
				)}

				{!loading && (
					<Stack className="meq-list">
						{equipments.map((eq: Equipment) => {
							const catColor  = CATEGORY_COLORS[eq.equipmentCategory] ?? '#64748b';
							const catLabel  = CATEGORY_LABELS[eq.equipmentCategory]  ?? eq.equipmentCategory;
							const statusDot = STATUS_COLOR[eq.equipmentStatus]        ?? '#9ca3af';

							return (
								<Stack key={eq._id} className="meq-row" onClick={() => router.push(`/equipment?id=${eq._id}`)}>

									{/* ① equipmentName · equipmentBrand · equipmentWeight */}
									<Stack className="meq-cell th-item">
										<Box className="meq-img-wrap">
											<img src={eq.equipmentImages?.[0] ?? '/img/banner/header1.svg'} alt={eq.equipmentName} />
											<Tooltip title={eq.equipmentStatus} arrow placement="top">
												<Box className="meq-status-dot" style={{ background: statusDot }} />
											</Tooltip>
										</Box>
										<Box className="meq-info">
											<Typography className="meq-name">{eq.equipmentName}</Typography>
											<Typography className="meq-brand">{eq.equipmentBrand}</Typography>
											{eq.equipmentWeight && (
												<Typography className="meq-weight-info">{eq.equipmentWeight} kg</Typography>
											)}
										</Box>
									</Stack>

									{/* ② equipmentCategory: FREE_WEIGHTS | MACHINES | ACCESSORIES */}
									<Stack className="meq-cell th-category">
										<Box className="meq-cat-badge"
											style={{ color: catColor, background: `${catColor}18`, borderColor: `${catColor}30` }}>
											<CategoryOutlinedIcon fontSize="inherit" />
											{catLabel}
										</Box>
									</Stack>

									{/* ③ equipmentMaterial: STEEL | IRON | RUBBER | FOAM | ALUMINUM | PLASTIC */}
									<Stack className="meq-cell th-material">
										<Chip label={eq.equipmentMaterial} size="small" className="meq-material-chip" />
									</Stack>

									{/* ④ equipmentLocation: INDOOR | OUTDOOR | BOTH */}
									<Stack className="meq-cell th-location">
										<Box className="meq-location">
											<LocationOnOutlinedIcon fontSize="small" className="meq-loc-icon" />
											<Typography className="meq-loc-text">{eq.equipmentLocation}</Typography>
										</Box>
									</Stack>

									{/* ⑤ equipmentWeightCapacity: 50KG … 500KG (optional) */}
									<Stack className="meq-cell th-weight">
										{eq.equipmentWeightCapacity ? (
											<Box className="meq-wc-badge">
												<ScaleOutlinedIcon fontSize="inherit" />
												{eq.equipmentWeightCapacity}
											</Box>
										) : (
											<Typography className="meq-na">—</Typography>
										)}
									</Stack>

									{/* ⑥ equipmentPrice */}
									<Stack className="meq-cell th-price">
										<Typography className="meq-price">${eq.equipmentPrice?.toLocaleString()}</Typography>
									</Stack>

									{/* ⑦ equipmentLeftCount */}
									<Stack className="meq-cell th-stock">
										<Box className={`meq-stock ${eq.equipmentLeftCount > 0 ? 'in' : 'out'}`}>
											{eq.equipmentLeftCount > 0 ? `${eq.equipmentLeftCount} left` : 'Sold Out'}
										</Box>
									</Stack>

								</Stack>
							);
						})}
					</Stack>
				)}

				{equipments.length > 0 && (
					<Stack className="meq-pagination">
						<Pagination
							count={Math.ceil(total / searchFilter.limit)}
							page={searchFilter.page}
							shape="rounded" color="primary"
							onChange={paginationHandler}
						/>
						<Typography className="meq-page-label">{total} equipment total</Typography>
					</Stack>
				)}

			</Stack>
		</div>
	);
};

MemberEquipments.defaultProps = {
	initialInput: {
		page: 1, limit: 6, sort: 'createdAt',
		search: { memberId: '' },
	},
};

export default MemberEquipments;