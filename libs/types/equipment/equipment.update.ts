import {
  EquipmentCategory,
  EquipmentLocation,
  EquipmentMaterial,
  EquipmentStatus,
  EquipmentWeightCapacity,
} from '../../enums/equipment.enum';

export interface EquipmentUpdate {
  _id: string;
  equipmentCategory?: EquipmentCategory;
  equipmentStatus?: EquipmentStatus;
  equipmentName?: string;
  equipmentBrand?: string;
  equipmentPrice?: number;
  equipmentMaterial?: EquipmentMaterial;
  equipmentWeightCapacity?: EquipmentWeightCapacity;
  equipmentLocation?: EquipmentLocation;
  equipmentWeight?: number;
  equipmentLeftCount?: number;
  equipmentImages?: string[];
  equipmentDesc?: string;
  isBestseller?: boolean;
  soldAt?: Date;
  deletedAt?: Date;
}