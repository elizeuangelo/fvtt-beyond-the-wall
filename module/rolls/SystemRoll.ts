import { CharacterData } from '../actors/character/CharacterData.js';
import { AbilityScore } from '../actors/shared/AbilityScores.js';
import { WeaponData } from '../items/weapon/weaponData.js';
import { SpellData } from '../items/spell/spellData.js';

enum RollDirection {
	high,
	low,
}

export class SystemRoll extends Roll {
	name: string;
	modifier: number;
	target: number;
	direction: RollDirection;
	showOffset: boolean;

	static async getModifier(term: string): Promise<number> {
		const content = `
            <div class="form-group dialog mod-prompt">
            <label>${term}</label> <input type="number" name="modifier" value="0"/>
            </div>`;
		return await new Promise<number>((resolve, reject) => {
			new Dialog(
				{
					title: term,
					content: content,
					default: 'ok',
					buttons: {
						ok: {
							icon: '<i class="fas fa-check"></i>',
							label: 'ok',
							callback: (html: JQuery<HTMLElement>) => {
								resolve(Number.parseInt(html.find<HTMLInputElement>('.mod-prompt.dialog [name="modifier"]')[0].value));
							},
						},
					},
				},
				{ width: 50 }
			).render(true);
		});
	}

	static readonly toModString = (value: number) => (value == 0 ? '' : value > 0 ? `+ ${value}` : `- ${Math.abs(value)}`);

	constructor(roller, data: Item | string, type: 'skill' | 'save' | 'attack' | 'check', mod: number) {
		var item = data as Item;
		switch (type) {
			case 'skill':
				super(`1d20`);
				this.name = `${data} Check`;
				this.modifier = 0;
				this.target = Number.parseInt(roller.system.abilities[data as AbilityScore]) - mod;
				this.direction = RollDirection.low;
				this.showOffset = true;
				break;
			case 'save':
				super(`1d20 + ${mod}`);
				this.name = `${data} Save`;
				this.modifier = mod;
				this.target = Number.parseInt(roller.system.saves[data as string]);
				this.direction = RollDirection.high;
				this.showOffset = false;
				break;
			case 'attack':
				var amod = Number.parseInt((item.system as any).bonus) + mod;
				super(`1d20 + ${amod}`);
				this.name = `${item.name} Attack`;
				this.modifier = amod;
				this.target = NaN;
				break;
		}
	}

	async render(chatOptions: any = {}) {
		chatOptions = mergeObject(
			{
				user: game.user!.id,
				flavor: null,
				template: 'systems/beyond-the-wall/templates/roll.hbs',
			},
			chatOptions || {}
		);

		if (!this._evaluated) {
			await this.roll({ async: true });
		}

		var result: string = '';
		var vs: string = '';
		var offset: string = '';
		if (!isNaN(this.target)) {
			vs = `vs ${this.target}`;
			offset = this.showOffset ? ` (${Math.abs(this.total! - this.target)})` : '';
			switch (this.direction) {
				case RollDirection.low:
					result = this.total! <= this.target ? 'success' : 'failure';
					break;
				case RollDirection.high:
					result = this.total! >= this.target ? 'success' : 'failure';
					break;
			}
		}

		const chatData = {
			user: chatOptions.user,
			name: this.name,
			die: this.dice[0].faces,
			total: this.total,
			vs,
			modifiers: SystemRoll.toModString(this.modifier),
			result,
			offset,
		};

		return renderTemplate(chatOptions.template, chatData);
	}
	async toMessage(chatData) {
		chatData.content = await this.render({ user: chatData.user });
		return ChatMessage.create(chatData);
	}
}
