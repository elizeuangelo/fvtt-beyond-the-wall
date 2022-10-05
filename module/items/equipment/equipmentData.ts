import { EquipmentItemType, PhysicalItemData } from '../itemTypes.js';

export const equipmentItemType: EquipmentItemType = 'Equipment';
export type EquipmentData = PhysicalItemData & {
	quantity: number;
	macro: string;
};

export const emptyEquipmentData: EquipmentData = {
	type: equipmentItemType,
	description: '',
	wearing: true,
	weight: 1,
	quantity: 1,
	macro: '',
};
