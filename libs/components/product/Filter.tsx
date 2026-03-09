import React, { useCallback, useEffect, useState } from 'react';
import { Collapse } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCategory, ProductWeight, ProductFlavor, ProductBenefits } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import IcecreamRoundedIcon from '@mui/icons-material/IcecreamRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface FilterType {
	searchFilter: ProductsInquiry;
	setSearchFilter: any;
	initialInput: ProductsInquiry;
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

// ─── Price Range ────────────────────────────────────────────────────────────────
const PriceRangeSection = ({
	searchFilter, productPriceHandler,
}: { searchFilter: ProductsInquiry; productPriceHandler: any }) => (
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
						if (e.target.value >= 0) productPriceHandler(e.target.value, 'start');
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
						if (e.target.value >= 0) productPriceHandler(e.target.value, 'end');
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
	const [productCategory] = useState<ProductCategory[]>(Object.values(ProductCategory));
	const [productWeight] = useState<ProductWeight[]>(Object.values(ProductWeight));
	const [productFlavor] = useState<ProductFlavor[]>(Object.values(ProductFlavor));
	const [productBenefits] = useState<ProductBenefits[]>(Object.values(ProductBenefits));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);

	useEffect(() => {
		if (searchFilter?.search?.categoryList?.length == 0) {
			delete searchFilter.search.categoryList;
			setShowMore(false);
			router.push(
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.weightList?.length == 0) {
			delete searchFilter.search.weightList;
			router.push(
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.flavorList?.length == 0) {
			delete searchFilter.search.flavorList;
			router.push(
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.benefitsList?.length == 0) {
			delete searchFilter.search.benefitsList;
			router.push(
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search } })}`,
				{ scroll: false },
			).then();
		}
		if (searchFilter?.search?.categoryList) setShowMore(true);
	}, [searchFilter]);

	const productCategorySelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.categoryList?.includes(value)) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value) } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, productCategorySelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productWeightSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightList: [...(searchFilter?.search?.weightList || []), value] } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightList: [...(searchFilter?.search?.weightList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.weightList?.includes(value)) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightList: searchFilter?.search?.weightList?.filter((item: string) => item !== value) } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, weightList: searchFilter?.search?.weightList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, productWeightSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productFlavorSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, flavorList: [...(searchFilter?.search?.flavorList || []), value] } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, flavorList: [...(searchFilter?.search?.flavorList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.flavorList?.includes(value)) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, flavorList: searchFilter?.search?.flavorList?.filter((item: string) => item !== value) } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, flavorList: searchFilter?.search?.flavorList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, productFlavorSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productBenefitsSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, benefitsList: [...(searchFilter?.search?.benefitsList || []), value] } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, benefitsList: [...(searchFilter?.search?.benefitsList || []), value] } })}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.benefitsList?.includes(value)) {
					await router.push(
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, benefitsList: searchFilter?.search?.benefitsList?.filter((item: string) => item !== value) } })}`,
						`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, benefitsList: searchFilter?.search?.benefitsList?.filter((item: string) => item !== value) } })}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, productBenefitsSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productPriceHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 } } })}`,
					`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 } } })}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 } } })}`,
					`/product?input=${JSON.stringify({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 } } })}`,
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
				`/product?input=${JSON.stringify(initialInput)}`,
				`/product?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const catCount     = searchFilter?.search?.categoryList?.length || 0;
	const weightCount  = searchFilter?.search?.weightList?.length   || 0;
	const flavorCount  = searchFilter?.search?.flavorList?.length   || 0;
	const benefitCount = searchFilter?.search?.benefitsList?.length || 0;
	const totalActive  = catCount + weightCount + flavorCount + benefitCount;

	if (device === 'mobile') return <div>PRODUCTS FILTER</div>;

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
						{productCategory.map((cat: string) => {
							const active = (searchFilter?.search?.categoryList || []).includes(cat as ProductCategory);
							return (
								<TagChip key={cat} label={cat} active={active}
									onClick={() => productCategorySelectHandler({ target: { checked: !active, value: cat } })}
								/>
							);
						})}
					</div>
				</Section>

				{/* WEIGHT */}
				<Section icon={<FitnessCenterRoundedIcon />} label="Weight" count={weightCount} open={true}>
					<div className="tag-chips-wrap">
						{productWeight.map((weight: string) => {
							const active = (searchFilter?.search?.weightList || []).includes(weight as ProductWeight);
							return (
								<TagChip key={weight} label={weight} active={active}
									onClick={() => productWeightSelectHandler({ target: { checked: !active, value: weight } })}
								/>
							);
						})}
					</div>
				</Section>

				{/* FLAVOR */}
				<Section icon={<IcecreamRoundedIcon />} label="Flavor" count={flavorCount} open={false}>
					<div className="tag-chips-wrap">
						{productFlavor.map((flavor: string) => {
							const active = (searchFilter?.search?.flavorList || []).includes(flavor as ProductFlavor);
							return (
								<TagChip key={flavor} label={flavor} active={active}
									onClick={() => productFlavorSelectHandler({ target: { checked: !active, value: flavor } })}
								/>
							);
						})}
					</div>
				</Section>

				{/* BENEFITS */}
				<Section icon={<StarRoundedIcon />} label="Benefits" count={benefitCount} open={false}>
					<div className="tag-chips-wrap">
						{productBenefits.map((benefit: string) => {
							const active = (searchFilter?.search?.benefitsList || []).includes(benefit as ProductBenefits);
							return (
								<TagChip key={benefit} label={benefit} active={active}
									onClick={() => productBenefitsSelectHandler({ target: { checked: !active, value: benefit } })}
								/>
							);
						})}
					</div>
				</Section>

				{/* PRICE RANGE */}
				<Section icon={<AttachMoneyRoundedIcon />} label="Price Range" open={false}>
					<PriceRangeSection
						searchFilter={searchFilter}
						productPriceHandler={productPriceHandler}
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