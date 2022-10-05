import { GeneralActorType, ActorData } from '../actorTypes.js';

export const generalActorType: GeneralActorType = 'GeneralActor';

export type GeneralData = ActorData & {
	type: GeneralActorType;
	unitType: string;
	initiative: string;
	skills: { name: string; value: number }[];
	maxWeight: number;
	// Generated values
	carryWeight?: number;
};

export const emptyGeneralData: GeneralData = {
	type: generalActorType,
	hp: { max: 10, value: 10 },
	initiative: '1d10',
	unitType: '',
	skills: [],
	maxWeight: 0,
};
