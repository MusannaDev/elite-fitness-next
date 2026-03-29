
export enum EquipmentCategory {
  MACHINES = "MACHINES",
  STRENGTH = "STRENGTH",
  ACCESSORIES = "ACCESSORIES",
  CARDIO = "CARDIO",
  OTHER = "OTHER",
}

export enum EquipmentStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  DELETE = "DELETE",
}

export enum EquipmentMaterial {
  STEEL = "STEEL",
  IRON = "IRON",
  RUBBER = "RUBBER",
  FOAM = "FOAM",
  ALUMINUM = "ALUMINUM",
  PLASTIC = "PLASTIC",
}

export enum EquipmentWeightCapacity {
  KG_50 = "KG_50",
  KG_100 = "KG_100",
  KG_150 = "KG_150",
  KG_200 = "KG_200",
  KG_250 = "KG_250",
  KG_300 = "KG_300",
  KG_500 = "KG_500",
}

export const EquipmentWeightCapacityLabel: Record<EquipmentWeightCapacity, string> = {
  [EquipmentWeightCapacity.KG_50]: '50 KG',
  [EquipmentWeightCapacity.KG_100]: '100 KG',
  [EquipmentWeightCapacity.KG_150]: '150 KG',
  [EquipmentWeightCapacity.KG_200]: '200 KG',
  [EquipmentWeightCapacity.KG_250]: '250 KG',
  [EquipmentWeightCapacity.KG_300]: '300 KG',
  [EquipmentWeightCapacity.KG_500]: '500 KG',
};


export enum EquipmentLocation {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  BOTH = "BOTH",
}
