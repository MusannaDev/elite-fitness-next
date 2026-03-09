import {
  ClotheCategory,
  ClotheColor,
  ClotheGender,
  ClotheMaterial,
  ClotheSize,
  ClotheStatus,
} from '../../enums/clothes.enum';

export interface ClotheUpdate {
  _id: string;
  clotheCategory?: ClotheCategory;
  clotheStatus?: ClotheStatus;
  clotheName?: string;
  clotheBrand?: string;
  clothePrice?: number;
  clotheMaterial?: ClotheMaterial;
  clotheSize?: ClotheSize;
  clotheGender?: ClotheGender;
  clotheColor?: ClotheColor;
  clotheLeftCount?: number;
  clotheImages?: string[];
  clotheDesc?: string;
  isBestseller?: boolean;
  soldAt?: Date;
  deletedAt?: Date;
}