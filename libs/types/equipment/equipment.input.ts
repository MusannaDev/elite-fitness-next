import {
  EquipmentCategory,
  EquipmentLocation,
  EquipmentMaterial,
  EquipmentStatus,
  EquipmentWeightCapacity,
} from '../../enums/equipment.enum';
import { Direction } from '../../enums/common.enum';

// ============================================================
//                        CREATE
// ============================================================

export interface EquipmentInput {
  equipmentCategory: EquipmentCategory;
  equipmentName: string;
  equipmentBrand: string;
  equipmentPrice: number;
  equipmentMaterial: EquipmentMaterial;
  equipmentLocation: EquipmentLocation;
  equipmentLeftCount: number;
  equipmentImages: string[];
  equipmentWeightCapacity?: EquipmentWeightCapacity;
  equipmentWeight?: number;
  equipmentDesc?: string;
  isBestseller?: boolean;
  memberId?: string;
}

// ============================================================
//                     INQUIRY - USER
// ============================================================

interface EISearch {
  memberId?: string;
  categoryList?: EquipmentCategory[];
  materialList?: EquipmentMaterial[];
  locationList?: EquipmentLocation[];
  weightCapacityList?: EquipmentWeightCapacity[];
  pricesRange?: Range;
  periodsRange?: PeriodsRange;
  text?: string;
}

export interface EquipmentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: EISearch;
}

// ============================================================
//                     INQUIRY - AGENT
// ============================================================

interface SMEISearch {
  equipmentStatus?: EquipmentStatus;
}

export interface SalesManagerEquipmentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: SMEISearch;
}

// ============================================================
//                     INQUIRY - ADMIN
// ============================================================

interface ALLEISearch {
  equipmentStatus?: EquipmentStatus;
  categoryList?: EquipmentCategory[];
}

export interface AllEquipmentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: ALLEISearch;
}

// ============================================================
//                     COMMON TYPES
// ============================================================

interface Range {
  start: number;
  end: number;
}

interface PeriodsRange {
  start: Date | number;
  end: Date | number;
}