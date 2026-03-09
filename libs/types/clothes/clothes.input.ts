import {
  ClotheCategory,
  ClotheColor,
  ClotheGender,
  ClotheMaterial,
  ClotheSize,
  ClotheStatus,
} from '../../enums/clothes.enum';
import { Direction } from '../../enums/common.enum';

// ============================================================
//                        CREATE
// ============================================================

export interface ClotheInput {
  clotheCategory: ClotheCategory;
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
  isBestseller?: boolean;
  memberId?: string;
}

// ============================================================
//                     INQUIRY - USER
// ============================================================

interface ClothesPricesRange {
  start: number;
  end: number;
}

interface ClothesPeriodsRange {
  start: Date | number;
  end: Date | number;
}

interface CLOISearch {
  memberId?: string;
  categoryList?: ClotheCategory[];
  materialList?: ClotheMaterial[];
  sizeList?: ClotheSize[];
  genderList?: ClotheGender[];
  colorList?: ClotheColor[];
  pricesRange?: ClothesPricesRange;
  periodsRange?: ClothesPeriodsRange;
  text?: string;
}

export interface ClotheInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: CLOISearch;
}

// ============================================================
//                     INQUIRY - AGENT
// ============================================================

interface SMCISearch {
  clotheStatus?: ClotheStatus;
}

export interface SalesManagerClotheInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: SMCISearch;
}

// ============================================================
//                     INQUIRY - ADMIN
// ============================================================

interface ALCISearch {
  clotheStatus?: ClotheStatus;
  categoryList?: ClotheCategory[];
}

export interface AllClotheInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: ALCISearch;
}

// ============================================================
//                     ORDINARY INQUIRY
// ============================================================

export interface ClotheOrdinaryInquiry {
  page: number;
  limit: number;
}