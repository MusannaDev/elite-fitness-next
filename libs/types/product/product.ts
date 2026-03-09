import { ProductBenefits, ProductCategory, ProductFlavor, ProductStatus, ProductWeight } from '../../enums/product.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Product {
	_id: string;
	productCategory: ProductCategory;
	productStatus: ProductStatus;
	productName: string;
	productBrand: string;
	productPrice: number;
	productWeight: ProductWeight;
	productLeftCount: number;
	productBenefits: ProductBenefits;
	productFlavor: ProductFlavor;
	productCalories: number;
	productProteinPerServing: number;
	productDesc?: string;
	productImages: string[];
	isBestseller: boolean;
	productViews: number;
	productLikes: number;
	productComments: number;
	productRank: number;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}