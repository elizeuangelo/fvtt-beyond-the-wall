import { SpellItemType, ItemData } from '../itemTypes.js';
import { AbilityScore } from '../../actors/shared/AbilityScores.js';

export const spellItemType: SpellItemType = 'Arcana';

export enum SpellType {
	Cantrip = 'Cantrip',
	Ritual = 'Ritual',
	Spell = 'Spell',
}

export type SpellData = ItemData & {
	type: SpellItemType;
	time: string;
	spellType: SpellType;
	ability: AbilityScore | '';
	macro: string;
};

export const emptySpellData: SpellData = {
	type: spellItemType,
	time: '',
	description: '',
	spellType: SpellType.Cantrip,
	ability: '',
	macro: '',
};
