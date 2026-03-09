import { ProductCategory, ProductStatus, ProductWeight, ProductFlavor, ProductBenefits } from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';

export interface ProductInput {
	productCategory: ProductCategory;
	productName: string;
	productBrand: string;
	productPrice: number;
	productWeight: ProductWeight;
	productLeftCount: number;
	productBenefits: ProductBenefits;
	productFlavor: ProductFlavor;
	productCalories: number;
	productProteinPerServing: number;
	productImages: string[];
	productDesc?: string;
	isBestseller?: boolean;
	memberId?: string;
}

interface PISearch {
	memberId?: string;
	categoryList?: ProductCategory[];
	weightList?: ProductWeight[];
	flavorList?: ProductFlavor[];
	benefitsList?: ProductBenefits[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface TPISearch {
	productStatus?: ProductStatus;
}

export interface TrainerProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: TPISearch;
}

interface ALPRISearch {
	productStatus?: ProductStatus;
	categoryList?: ProductCategory[];
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPRISearch;
}

export interface ProductOrdinaryInquiry {
	page: number;
	limit: number;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}