import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
	Pagination, Stack, Typography, Chip, Box,
	Select, MenuItem, FormControl, InputLabel, Slider, Tooltip,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Clothe } from '../../types/clothes/clothes';
import { ClotheInquiry } from '../../types/clothes/clothes.input';
import {
	ClotheCategory, ClotheColor, ClotheGender,
	ClotheMaterial, ClotheSize, ClotheStatus,
} from '../../enums/clothes.enum';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_CLOTHES } from '../../../apollo/user/query';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import { REACT_APP_API_URL } from '../../config';

// ─── Category display labels ─────────────────────────────────────────────────
const CATEGORY_LABELS: Record<ClotheCategory, string> = {
	[ClotheCategory.T_SHIRT]:    'T-Shirt',
	[ClotheCategory.HOODIE]:     'Hoodie',
	[ClotheCategory.SHORTS]:     'Shorts',
	[ClotheCategory.PANTS]:      'Pants',
	[ClotheCategory.SHOES]:      'Shoes',
	[ClotheCategory.GLOVES]:     'Gloves',
	[ClotheCategory.SOCKS]:      'Socks',
	[ClotheCategory.JACKET]:     'Jacket',
	[ClotheCategory.SPORTS_BRA]: 'Sports Bra',
};

// ─── Gender badge colours ─────────────────────────────────────────────────────
const GENDER_STYLE: Record<ClotheGender, { color: string; bg: string }> = {
	[ClotheGender.MEN]:    { color: '#2563eb', bg: 'rgba(37,99,235,0.10)' },
	[ClotheGender.WOMEN]:  { color: '#ec4899', bg: 'rgba(236,72,153,0.10)' },
	[ClotheGender.UNISEX]: { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
};

// ─── Actual CSS hex values for ClotheColor enum ───────────────────────────────
const COLOR_HEX: Record<ClotheColor, string> = {
	[ClotheColor.BLACK]:  '#1a1a1a',
	[ClotheColor.WHITE]:  '#f5f5f5',
	[ClotheColor.GRAY]:   '#9ca3af',
	[ClotheColor.RED]:    '#ef4444',
	[ClotheColor.BLUE]:   '#3b82f6',
	[ClotheColor.GREEN]:  '#22c55e',
	[ClotheColor.YELLOW]: '#eab308',
	[ClotheColor.NAVY]:   '#1e3a5f',
	[ClotheColor.PINK]:   '#f472b6',
};

// ─── Status dot ───────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<ClotheStatus, string> = {
	[ClotheStatus.ACTIVE]: '#059669',
	[ClotheStatus.SOLD]:   '#dc2626',
	[ClotheStatus.DELETE]: '#9ca3af',
};

// ─────────────────────────────────────────────────────────────────────────────

const MemberClothes: NextPage = ({ initialInput, ...props }: any) => {
	const device       = useDeviceDetect();
	const router       = useRouter();
	const { memberId } = router.query;

	const [searchFilter, setSearchFilter] = useState<ClotheInquiry>({ ...initialInput });
	const [clothes,      setClothes]      = useState<Clothe[]>([]);
	const [total,        setTotal]        = useState<number>(0);
	const [showFilters,  setShowFilters]  = useState(false);

	// ── filter local states ───────────────────────────────────────────────────
	const [selCategories, setSelCategories] = useState<ClotheCategory[]>([]);
	const [selMaterials,  setSelMaterials]  = useState<ClotheMaterial[]>([]);
	const [selSizes,      setSelSizes]      = useState<ClotheSize[]>([]);
	const [selGenders,    setSelGenders]    = useState<ClotheGender[]>([]);
	const [selColors,     setSelColors]     = useState<ClotheColor[]>([]);
	const [priceRange,    setPriceRange]    = useState<[number, number]>([0, 5000]);

	/** APOLLO **/
	const { loading, refetch } = useQuery(GET_CLOTHES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setClothes(data?.getClothes?.list ?? []);
			setTotal(data?.getClothes?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => { refetch().then(); }, [searchFilter]);
	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (_: T, value: number) =>
		setSearchFilter({ ...searchFilter, page: value });

	const applyFilters = () => {
		setSearchFilter((prev) => ({
			...prev, page: 1,
			search: {
				...prev.search,
				categoryList: selCategories.length ? selCategories : undefined,
				materialList: selMaterials.length  ? selMaterials  : undefined,
				sizeList:     selSizes.length      ? selSizes      : undefined,
				genderList:   selGenders.length    ? selGenders    : undefined,
				colorList:    selColors.length     ? selColors     : undefined,
				pricesRange: priceRange[0] !== 0 || priceRange[1] !== 5000
					? { start: priceRange[0], end: priceRange[1] } : undefined,
			},
		}));
	};

	const clearFilters = () => {
		setSelCategories([]); setSelMaterials([]); setSelSizes([]);
		setSelGenders([]); setSelColors([]); setPriceRange([0, 5000]);
		setSearchFilter({ ...initialInput, search: { memberId: memberId as string } });
	};

	const activeFilterCount =
		selCategories.length + selMaterials.length + selSizes.length +
		selGenders.length + selColors.length +
		(priceRange[0] !== 0 || priceRange[1] !== 5000 ? 1 : 0);

	if (device === 'mobile') return <div>MEMBER CLOTHES MOBILE</div>;

	return (
		<div id="member-clothes-page">

			{/* PAGE HEADER */}
			<Stack className="mcl-page-header">
				<Stack className="mcl-page-header-left">
					<Box className="mcl-header-icon-wrap"><CheckroomOutlinedIcon /></Box>
					<Box>
						<Typography className="mcl-page-title">Clothing Collection</Typography>
						<Typography className="mcl-page-sub">
							{loading ? 'Loading…' : total > 0 ? `${total} items available` : 'No clothing yet'}
						</Typography>
					</Box>
				</Stack>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Chip icon={<StyleOutlinedIcon />} label={`${total} Pieces`} className="mcl-total-chip" size="small" />
					<button
						className={`mcl-filter-toggle${showFilters ? ' open' : ''}${activeFilterCount > 0 ? ' has-filters' : ''}`}
						onClick={() => setShowFilters((v) => !v)}
					>
						<TuneRoundedIcon fontSize="small" />
						Filters
						{activeFilterCount > 0 && <span className="mcl-filter-badge">{activeFilterCount}</span>}
					</button>
				</Stack>
			</Stack>

			{/* FILTER PANEL */}
			{showFilters && (
				<Stack className="mcl-filter-panel">
					<Stack className="mcl-filter-selects">

						{/* categoryList: T_SHIRT | HOODIE | SHORTS | PANTS | SHOES | GLOVES | SOCKS | JACKET | SPORTS_BRA */}
						<FormControl className="mcl-filter-field" size="small">
							<InputLabel>Category</InputLabel>
							<Select multiple value={selCategories} label="Category"
								onChange={(e) => setSelCategories(e.target.value as ClotheCategory[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as ClotheCategory[]).map((v) => <Chip key={v} label={CATEGORY_LABELS[v]} size="small" />)}
									</Stack>
								)}>
								{Object.values(ClotheCategory).map((c) => (
									<MenuItem key={c} value={c}>{CATEGORY_LABELS[c]}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* materialList: COTTON | POLYESTER | NYLON | SPANDEX | FLEECE | MESH */}
						<FormControl className="mcl-filter-field" size="small">
							<InputLabel>Material</InputLabel>
							<Select multiple value={selMaterials} label="Material"
								onChange={(e) => setSelMaterials(e.target.value as ClotheMaterial[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as ClotheMaterial[]).map((v) => <Chip key={v} label={v} size="small" />)}
									</Stack>
								)}>
								{Object.values(ClotheMaterial).map((m) => (
									<MenuItem key={m} value={m}>{m}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* sizeList: XS | S | M | L | XL | XXL */}
						<FormControl className="mcl-filter-field" size="small">
							<InputLabel>Size</InputLabel>
							<Select multiple value={selSizes} label="Size"
								onChange={(e) => setSelSizes(e.target.value as ClotheSize[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as ClotheSize[]).map((v) => <Chip key={v} label={v} size="small" />)}
									</Stack>
								)}>
								{Object.values(ClotheSize).map((s) => (
									<MenuItem key={s} value={s}>{s}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* genderList: MEN | WOMEN | UNISEX */}
						<FormControl className="mcl-filter-field" size="small">
							<InputLabel>Gender</InputLabel>
							<Select multiple value={selGenders} label="Gender"
								onChange={(e) => setSelGenders(e.target.value as ClotheGender[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5}>
										{(sel as ClotheGender[]).map((v) => <Chip key={v} label={v} size="small" />)}
									</Stack>
								)}>
								{Object.values(ClotheGender).map((g) => (
									<MenuItem key={g} value={g}>{g}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* colorList: BLACK | WHITE | GRAY | RED | BLUE | GREEN | YELLOW | NAVY | PINK */}
						<FormControl className="mcl-filter-field" size="small">
							<InputLabel>Color</InputLabel>
							<Select multiple value={selColors} label="Color"
								onChange={(e) => setSelColors(e.target.value as ClotheColor[])}
								renderValue={(sel) => (
									<Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
										{(sel as ClotheColor[]).map((v) => (
											<Box key={v} className="mcl-color-filter-dot"
												title={v}
												style={{ background: COLOR_HEX[v], border: v === 'WHITE' ? '1px solid #e5e7eb' : 'none' }}
											/>
										))}
									</Stack>
								)}>
								{Object.values(ClotheColor).map((c) => (
									<MenuItem key={c} value={c}>
										<Stack direction="row" alignItems="center" gap={1}>
											<Box className="mcl-color-menu-dot"
												style={{ background: COLOR_HEX[c], border: c === 'WHITE' ? '1px solid #e5e7eb' : 'none' }} />
											{c}
										</Stack>
									</MenuItem>
								))}
							</Select>
						</FormControl>

					</Stack>

					{/* pricesRange: { start, end } */}
					<Stack className="mcl-price-row">
						<Typography className="mcl-price-label">
							Price Range: <strong>${priceRange[0].toLocaleString()}</strong> — <strong>${priceRange[1].toLocaleString()}</strong>
						</Typography>
						<Slider
							value={priceRange} min={0} max={5000} step={50}
							onChange={(_: any, v: any) => setPriceRange(v as [number, number])}
							valueLabelDisplay="auto" valueLabelFormat={(v: any) => `$${v}`}
							className="mcl-price-slider"
						/>
					</Stack>

					<Stack direction="row" gap={1.5} className="mcl-filter-actions">
						<button className="mcl-btn-apply" onClick={applyFilters}>
							<FilterListRoundedIcon fontSize="small" /> Apply Filters
						</button>
						<button className="mcl-btn-clear" onClick={clearFilters}>
							<ClearRoundedIcon fontSize="small" /> Clear
						</button>
					</Stack>
				</Stack>
			)}

			{/* TABLE */}
			<Stack className="mcl-table-wrap">

				{clothes.length > 0 && (
					<Stack className="mcl-col-header">
						<Typography className="mcl-th th-item">Item</Typography>
						<Typography className="mcl-th th-category"><StyleOutlinedIcon fontSize="inherit" /> Category</Typography>
						<Typography className="mcl-th th-gender"><WcOutlinedIcon fontSize="inherit" /> Gender</Typography>
						<Typography className="mcl-th th-material">Material</Typography>
						<Typography className="mcl-th th-size">Size</Typography>
						<Typography className="mcl-th th-color"><PaletteOutlinedIcon fontSize="inherit" /> Color</Typography>
						<Typography className="mcl-th th-price">Price</Typography>
						<Typography className="mcl-th th-stock">Stock</Typography>
					</Stack>
				)}

				{loading && (
					<Stack className="mcl-skeleton-list">
						{[1, 2, 3].map((i) => <Box key={i} className="mcl-skeleton-row" />)}
					</Stack>
				)}

				{!loading && clothes.length === 0 && (
					<Stack className="mcl-empty">
						<Box className="mcl-empty-icon-wrap"><CheckroomOutlinedIcon /></Box>
						<Typography className="mcl-empty-title">No Clothing Found</Typography>
						<Typography className="mcl-empty-desc">
							{activeFilterCount > 0 ? 'Try adjusting your filters.' : "This sales manager hasn't listed any clothing yet."}
						</Typography>
						{activeFilterCount > 0 && (
							<button className="mcl-btn-clear" onClick={clearFilters}>
								<ClearRoundedIcon fontSize="small" /> Clear Filters
							</button>
						)}
					</Stack>
				)}

				{!loading && (
					<Stack className="mcl-list">
						{clothes.map((cl: Clothe) => {
							const gStyle    = GENDER_STYLE[cl.clotheGender]    ?? GENDER_STYLE[ClotheGender.UNISEX];
							const statusDot = STATUS_COLOR[cl.clotheStatus]    ?? '#9ca3af';
							const colorHex  = COLOR_HEX[cl.clotheColor]        ?? '#9ca3af';

							return (
								<Stack key={cl._id} className="mcl-row" onClick={() => router.push(`/clothes/detail?id=${cl._id}`)}>

									{/* ① clotheName · clotheBrand */}
									<Stack className="mcl-cell th-item">
										<Box className="mcl-img-wrap">
											<img src={cl.clotheImages?.[0] ? `${REACT_APP_API_URL}/${cl.clotheImages[0]}` : '/img/banner/header1.svg'} alt={cl.clotheName} />
											<Tooltip title={cl.clotheStatus} arrow placement="top">
												<Box className="mcl-status-dot" style={{ background: statusDot }} />
											</Tooltip>
										</Box>
										<Box className="mcl-info">
											<Typography className="mcl-name">{cl.clotheName}</Typography>
											<Typography className="mcl-brand">{cl.clotheBrand}</Typography>
										</Box>
									</Stack>

									{/* ② clotheCategory */}
									<Stack className="mcl-cell th-category">
										<Chip label={CATEGORY_LABELS[cl.clotheCategory]} size="small" className="mcl-cat-chip" />
									</Stack>

									{/* ③ clotheGender: MEN | WOMEN | UNISEX */}
									<Stack className="mcl-cell th-gender">
										<Box className="mcl-gender-badge"
											style={{ color: gStyle.color, background: gStyle.bg }}>
											{cl.clotheGender}
										</Box>
									</Stack>

									{/* ④ clotheMaterial: COTTON | POLYESTER | NYLON | SPANDEX | FLEECE | MESH */}
									<Stack className="mcl-cell th-material">
										<Chip label={cl.clotheMaterial} size="small" className="mcl-material-chip" />
									</Stack>

									{/* ⑤ clotheSize: XS | S | M | L | XL | XXL */}
									<Stack className="mcl-cell th-size">
										<Box className="mcl-size-badge">{cl.clotheSize}</Box>
									</Stack>

									{/* ⑥ clotheColor: BLACK | WHITE | GRAY | RED | BLUE | GREEN | YELLOW | NAVY | PINK */}
									<Stack className="mcl-cell th-color">
										<Tooltip title={cl.clotheColor} arrow>
											<Box className="mcl-color-swatch"
												style={{
													background: colorHex,
													border: cl.clotheColor === ClotheColor.WHITE ? '2px solid #e5e7eb' : '2px solid transparent',
												}}
											/>
										</Tooltip>
										<Typography className="mcl-color-name">{cl.clotheColor}</Typography>
									</Stack>

									{/* ⑦ clothePrice */}
									<Stack className="mcl-cell th-price">
										<Typography className="mcl-price">${cl.clothePrice?.toLocaleString()}</Typography>
									</Stack>

									{/* ⑧ clotheLeftCount */}
									<Stack className="mcl-cell th-stock">
										<Box className={`mcl-stock ${cl.clotheLeftCount > 0 ? 'in' : 'out'}`}>
											{cl.clotheLeftCount > 0 ? `${cl.clotheLeftCount} left` : 'Sold Out'}
										</Box>
									</Stack>

								</Stack>
							);
						})}
					</Stack>
				)}

				{clothes.length > 0 && (
					<Stack className="mcl-pagination">
						<Pagination
							count={Math.ceil(total / searchFilter.limit)}
							page={searchFilter.page}
							shape="rounded" color="primary"
							onChange={paginationHandler}
						/>
						<Typography className="mcl-page-label">{total} items total</Typography>
					</Stack>
				)}

			</Stack>
		</div>
	);
};

MemberClothes.defaultProps = {
	initialInput: {
		page: 1, limit: 6, sort: 'createdAt',
		search: { memberId: '' },
	},
};

export default MemberClothes;
