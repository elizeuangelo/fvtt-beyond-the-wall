import { ArmorItemType, PhysicalItemType, PhysicalItemData } from '../itemTypes.js';

export const armorItemType: ArmorItemType = 'Armor';

export type ArmorData = PhysicalItemData & {
	armorBonus: number;
	macro: string;
};

export const emptyArmorData: ArmorData = {
	type: armorItemType,
	description: '',
	weight: 1,
	armorBonus: 0,
	wearing: true,
	macro: '',
};
