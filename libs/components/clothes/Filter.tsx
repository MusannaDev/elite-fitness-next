import React, { useCallback, useEffect, useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	ClotheCategory,
	ClotheSize,
	ClotheGender,
	ClotheColor,
	ClotheMaterial,
} from '../../enums/clothes.enum';
import { ClotheInquiry } from '../../types/clothes/clothes.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface FilterType {
	searchFilter: ClotheInquiry;
	setSearchFilter: any;
	initialInput: ClotheInquiry;
}

// ─── Color dot map ──────────────────────────────────────────────────────────────
const COLOR_DOT: Record<string, string> = {
	BLACK: '#1a1a1a',
	WHITE: '#f0f0f0',
	RED: '#e8392a',
	GREY: '#b0b0b0',
	YELLOW: '#f5c518',
	PINK: '#f472b6',
	BLUE: '#3b82f6',
	GREEN: '#22c55e',
	BROWN: '#92400e',
	NAVY: '#1e3a5f',
	BEIGE: '#d4c5a9',
	ORANGE: '#f97316',
};

// ─── Section (flat, no accordion) ───────────────────────────────────────────────
const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="cl-filter-section">
		<p className="cl-filter-section__title">{label}</p>
		<div className="cl-filter-section__body">{children}</div>
	</div>
);

// ─── Chip ───────────────────────────────────────────────────────────────────────
const Chip = ({
	label,
	active,
	onClick,
	colorDot,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
	colorDot?: string;
}) => (
	<div className={`cl-chip${active ? ' cl-chip--active' : ''}`} onClick={onClick}>
		{colorDot && (
			<span
				className="cl-chip__dot"
				style={{
					background: colorDot,
					border: colorDot === '#f0f0f0' ? '1px solid #d0d0d0' : 'none',
				}}
			/>
		)}
		<span className="cl-chip__label">{label}</span>
	</div>
);

// ─── Price Slider (dual range) ──────────────────────────────────────────────────
const PriceSlider = ({
	start,
	end,
	onStartChange,
	onEndChange,
}: {
	start: number;
	end: number;
	onStartChange: (v: number) => void;
	onEndChange: (v: number) => void;
}) => {
	const MIN = 0;
	const MAX = 500;
	const clampedStart = Math.max(MIN, Math.min(start, MAX));
	const clampedEnd = Math.max(MIN, Math.min(end || MAX, MAX));
	const leftPct = ((clampedStart - MIN) / (MAX - MIN)) * 100;
	const rightPct = ((clampedEnd - MIN) / (MAX - MIN)) * 100;

	return (
		<div className="cl-price">
			<div className="cl-price__values">
				<span className="cl-price__tag">${clampedStart}</span>
				<span className="cl-price__tag">${clampedEnd}</span>
			</div>
			<div className="cl-price__track-wrap">
				<div className="cl-price__track">
					<div
						className="cl-price__fill"
						style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
					/>
				</div>
				<input
					type="range"
					className="cl-price__range cl-price__range--min"
					min={MIN}
					max={MAX}
					value={clampedStart}
					onChange={(e) => onStartChange(Number(e.target.value))}
				/>
				<input
					type="range"
					className="cl-price__range cl-price__range--max"
					min={MIN}
					max={MAX}
					value={clampedEnd}
					onChange={(e) => onEndChange(Number(e.target.value))}
				/>
			</div>
		</div>
	);
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [clothesCategory] = useState<ClotheCategory[]>(Object.values(ClotheCategory));
	const [clothesSize] = useState<ClotheSize[]>(Object.values(ClotheSize));
	const [clothesGender] = useState<ClotheGender[]>(Object.values(ClotheGender));
	const [clothesColor] = useState<ClotheColor[]>(Object.values(ClotheColor));
	const [clothesMaterial] = useState<ClotheMaterial[]>(Object.values(ClotheMaterial));
	const [searchText, setSearchText] = useState<string>('');

	/** push helper */
	const pushFilter = useCallback(
		async (nextSearch: any) => {
			const next = { ...searchFilter, search: { ...searchFilter.search, ...nextSearch } };
			await router.push(`/clothes?input=${JSON.stringify(next)}`, `/clothes?input=${JSON.stringify(next)}`, {
				scroll: false,
			});
		},
		[searchFilter, router],
	);

	/** generic list toggle */
	const toggleList = useCallback(
		(listKey: string, value: string) => {
			const current: string[] = (searchFilter?.search as any)?.[listKey] || [];
			const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
			pushFilter({ [listKey]: next });
		},
		[searchFilter, pushFilter],
	);

	/** clean up empty lists */
	useEffect(() => {
		const s = searchFilter?.search;
		const emptyKeys = ['categoryList', 'sizeList', 'genderList', 'colorList', 'materialList'].filter(
			(k) => (s as any)?.[k]?.length === 0,
		);
		if (emptyKeys.length) {
			const cleaned = { ...s };
			emptyKeys.forEach((k) => delete (cleaned as any)[k]);
			router
				.push(
					`/clothes?input=${JSON.stringify({ ...searchFilter, search: cleaned })}`,
					`/clothes?input=${JSON.stringify({ ...searchFilter, search: cleaned })}`,
					{ scroll: false },
				)
				.then();
		}
	}, [searchFilter]);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(`/clothes?input=${JSON.stringify(initialInput)}`, `/clothes?input=${JSON.stringify(initialInput)}`, {
				scroll: false,
			});
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const catCount = searchFilter?.search?.categoryList?.length || 0;
	const sizeCount = searchFilter?.search?.sizeList?.length || 0;
	const genderCount = searchFilter?.search?.genderList?.length || 0;
	const colorCount = searchFilter?.search?.colorList?.length || 0;
	const materialCount = searchFilter?.search?.materialList?.length || 0;
	const totalActive = catCount + sizeCount + genderCount + colorCount + materialCount;

	if (device === 'mobile') return <div>CLOTHES FILTER</div>;

	return (
		<div className="cl-filter">
			{/* ── Header ── */}
			<div className="cl-filter__header">
				<CloseRoundedIcon className="cl-filter__close" onClick={refreshHandler} />
				<h2 className="cl-filter__heading">Filter</h2>
				<button className="cl-filter__trash" onClick={refreshHandler}>
					<DeleteOutlineRoundedIcon />
				</button>
			</div>

			<div className="cl-filter__divider" />

			{/* ── Scroll body ── */}
			<div className="cl-filter__body">
				{/* GENDER */}
				<Section label="Gender">
					<div className="cl-chips">
						{clothesGender.map((g) => (
							<Chip
								key={g}
								label={g}
								active={(searchFilter?.search?.genderList || []).includes(g)}
								onClick={() => toggleList('genderList', g)}
							/>
						))}
					</div>
				</Section>

				{/* SIZE */}
				<Section label="Size">
					<div className="cl-chips">
						{clothesSize.map((s) => (
							<Chip
								key={s}
								label={s}
								active={(searchFilter?.search?.sizeList || []).includes(s)}
								onClick={() => toggleList('sizeList', s)}
							/>
						))}
					</div>
				</Section>

				{/* CATEGORY */}
				<Section label="Category">
					<div className="cl-chips">
						{clothesCategory.map((c) => (
							<Chip
								key={c}
								label={c}
								active={(searchFilter?.search?.categoryList || []).includes(c)}
								onClick={() => toggleList('categoryList', c)}
							/>
						))}
					</div>
				</Section>

				{/* PRICE */}
				<Section label="Price">
					<PriceSlider
						start={searchFilter?.search?.pricesRange?.start ?? 0}
						end={searchFilter?.search?.pricesRange?.end ?? 500}
						onStartChange={(v) => pushFilter({ pricesRange: { ...searchFilter.search.pricesRange, start: v } })}
						onEndChange={(v) => pushFilter({ pricesRange: { ...searchFilter.search.pricesRange, end: v } })}
					/>
				</Section>

				{/* COLOR */}
				<Section label="Color">
					<div className="cl-chips">
						{clothesColor.map((c) => (
							<Chip
								key={c}
								label={c}
								active={(searchFilter?.search?.colorList || []).includes(c)}
								onClick={() => toggleList('colorList', c)}
								colorDot={COLOR_DOT[c] || '#ccc'}
							/>
						))}
					</div>
				</Section>

				{/* MATERIAL */}
				<Section label="Material">
					<div className="cl-chips">
						{clothesMaterial.map((m) => (
							<Chip
								key={m}
								label={m}
								active={(searchFilter?.search?.materialList || []).includes(m)}
								onClick={() => toggleList('materialList', m)}
							/>
						))}
					</div>
				</Section>
			</div>

			{/* ── Footer ── */}
			<div className="cl-filter__footer">
				<button
					className="cl-filter__apply"
					onClick={() => setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: searchText } })}
				>
					<span>Show Results</span>
					{totalActive > 0 && <span className="cl-filter__apply-count">{totalActive}</span>}
				</button>
			</div>
		</div>
	);
};

export default Filter;