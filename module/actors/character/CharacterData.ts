import { CharacterActorType, ActorData } from '../actorTypes.js';
import { Resource } from '../shared/Resource.js';
import { AbilityScoreBlock, baseAbilityScoreBlock } from '../shared/AbilityScores.js';

export const characterActorType: CharacterActorType = 'CharacterActor';

type Save = {
	name: string;
	value: number;
};

export type CharacterData = ActorData & {
	type: CharacterActorType;
	class: string;
	exp: Resource;
	speed: number;
	initiative: string;
	ac: number;
	abilities: AbilityScoreBlock;
	saves: { 0: Save; 1: Save; 2: Save; 3: Save; 4: Save };
	fortune: number;
	slots: number;
	skills: { name: string; bonus: number }[];
	bab: number;
	mab: number;
	rab: number;
	coinage: {
		iron: number;
		copper: number;
		silver: number;
		gold: number;
		platinum: number;
	};
	maxWeight: number;
	goals: { type: string; description: string; exp: number }[];

	heightWeight: string;
	features: string;
	traits: string;
	misc: string[];
	notes: string;
	background: string;
	mainNotes: string;
	treasure: string;

	// Sheet use values
	abilityMods?: AbilityScoreBlock;
	checkedFortunes?: boolean[];
	checkedSlots?: boolean[];
	carryWeight?: number;
	itemGroups?: {
		arcana: ItemSheet.Data[];
		traits: ItemSheet.Data[];
		active: ItemSheet.Data[];
		weapons: ItemSheet.Data[];
		armor: ItemSheet.Data[];
		equipment: ItemSheet.Data[];
	};
};

export const emptyCharacterData: CharacterData = {
	type: characterActorType,
	class: '',
	abilities: baseAbilityScoreBlock,
	ac: 10,
	bab: 0,
	background: '',
	coinage: {
		iron: 0,
		copper: 0,
		silver: 0,
		gold: 0,
		platinum: 0,
	},
	exp: { max: 0, value: 0 },
	features: '',
	fortune: 0,
	goals: [],
	heightWeight: '',
	hp: { max: 10, value: 10 },
	initiative: '1d10',
	mab: 0,
	mainNotes: '',
	maxWeight: 0,
	misc: [],
	notes: '',
	rab: 0,
	saves: {
		0: { name: '', value: 0 },
		1: { name: '', value: 0 },
		2: { name: '', value: 0 },
		3: { name: '', value: 0 },
		4: { name: '', value: 0 },
	},
	skills: [],
	slots: 0,
	speed: 0,
	traits: '',
	treasure: '',
};
