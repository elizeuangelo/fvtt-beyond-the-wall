import { TraitItemType, ItemData } from '../itemTypes.js';

export const traitItemType: TraitItemType = 'Trait';

export type TraitData = ItemData & {
	type: TraitItemType;
	macro: string;
	traitType: string;
};

export const emptyTraitData: TraitData = {
	type: traitItemType,
	description: '',
	macro: '',
	traitType: '',
};
