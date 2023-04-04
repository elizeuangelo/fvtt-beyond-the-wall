import { WeaponItemType, PhysicalItemData } from '../itemTypes.js';

export const weaponItemType: WeaponItemType = 'Weapon';

export type WeaponData = PhysicalItemData & {
	bonus: string;
	damage: string;
	shortRange: string;
	longRange: string;
	reload: string;
};

export const emptyWeaponData: WeaponData = {
	type: weaponItemType,
	description: '',
	weight: 1,
	wearing: true,
	bonus: '0',
	damage: '1d6',
	shortRange: '',
	longRange: '',
	reload: '',
};
