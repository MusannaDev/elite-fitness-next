import { ProductWeight, ProductWeightLabel } from '../enums/product.enum';

const NUMERIC_WEIGHT_PATTERN = /^\d+(\.\d+)?\s*(KG|G)$/i;

export const formatProductWeight = (weight?: ProductWeight | string | null): string => {
	if (!weight) return '';

	const rawWeight = String(weight).trim();
	if (!rawWeight) return '';

	if (NUMERIC_WEIGHT_PATTERN.test(rawWeight)) {
		return rawWeight.replace(/\s+/g, '').toUpperCase();
	}

	if ((Object.values(ProductWeight) as string[]).includes(rawWeight)) {
		return ProductWeightLabel[rawWeight as ProductWeight];
	}

	return rawWeight.replace(/_/g, ' ').toUpperCase();
};
