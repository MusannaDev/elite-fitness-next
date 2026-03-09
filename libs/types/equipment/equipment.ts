import {
  EquipmentCategory,
  EquipmentLocation,
  EquipmentMaterial,
  EquipmentStatus,
  EquipmentWeightCapacity,
} from '../../enums/equipment.enum';
import { Member } from '../member/member';

export interface MeLiked {
  memberId: string;
  likeRefId: string;
  myFavorite: boolean;
}

export interface TotalCounter {
  total: number;
}

export interface Equipment {
  _id: string;
  equipmentCategory: EquipmentCategory;
  equipmentStatus: EquipmentStatus;
  equipmentName: string;
  equipmentBrand: string;
  equipmentPrice: number;
  equipmentMaterial: EquipmentMaterial;
  equipmentWeightCapacity?: EquipmentWeightCapacity;
  equipmentLocation: EquipmentLocation;
  equipmentWeight?: number;
  equipmentLeftCount: number;
  equipmentViews: number;
  equipmentLikes: number;
  equipmentComments: number;
  equipmentRank: number;
  equipmentImages: string[];
  equipmentDesc?: string;
  isBestseller: boolean;
  memberId: string;
  soldAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregation **/
  meLiked?: MeLiked[];
  memberData?: Member;
}

export interface Equipments {
  list: Equipment[];
  metaCounter: TotalCounter[];
}