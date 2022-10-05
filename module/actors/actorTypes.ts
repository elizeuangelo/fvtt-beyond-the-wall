import { Resource } from './shared/Resource.js';

export type CharacterActorType = 'CharacterActor';
export type GeneralActorType = 'GeneralActor';

export type ActorType = CharacterActorType | GeneralActorType;

export type ActorData = {
	type: ActorType;
	hp: Resource;
};
