import { ProductBenefits, ProductCategory, ProductFlavor, ProductStatus, ProductWeight } from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productCategory?: ProductCategory;
	productStatus?: ProductStatus;
	productName?: string;
	productBrand?: string;
	productPrice?: number;
	productWeight?: ProductWeight;
	productLeftCount?: number;
	productBenefits?: ProductBenefits;
	productFlavor?: ProductFlavor;
	productCalories?: number;
	productProteinPerServing?: number;
	productImages?: string[];
	productDesc?: string;
	isBestseller?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
}