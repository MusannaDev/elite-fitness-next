import {
  ClotheCategory,
  ClotheColor,
  ClotheGender,
  ClotheMaterial,
  ClotheSize,
  ClotheStatus,
} from '../../enums/clothes.enum';
import { Member } from '../member/member';

export interface MeLiked {
  memberId: string;
  likeRefId: string;
  myFavorite: boolean;
}

export interface TotalCounter {
  total: number;
}

export interface Clothe {
  _id: string;
  clotheCategory: ClotheCategory;
  clotheStatus: ClotheStatus;
  clotheName: string;
  clotheBrand: string;
  clothePrice: number;
  clotheMaterial: ClotheMaterial;
  clotheSize: ClotheSize;
  clotheGender: ClotheGender;
  clotheColor: ClotheColor;
  clotheLeftCount: number;
  clotheImages: string[];
  clotheDesc?: string;
  isBestseller: boolean;
  clotheViews: number;
  clotheLikes: number;
  clotheComments: number;
  clotheRank: number;
  memberId: string;
  soldAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregation **/
  meLiked?: MeLiked[];
  memberData?: Member;
}

export interface Clothes {
  list: Clothe[];
  metaCounter: TotalCounter[];
}