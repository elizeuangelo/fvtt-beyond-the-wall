import { CharacterData, Save, saves } from '../actors/character/CharacterData.js';
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
				this.target = Number.parseInt(roller.system.abilities[data as AbilityScore]) + mod;
				this.direction = RollDirection.low;
				this.showOffset = false;
				break;
			case 'save':
				const savesMap = Object.values(roller.system.saves).map(({ name, value }: Save, idx) => {
					if (name === '') name = saves[idx];
					return { name, value };
				});
				super(`1d20 + ${mod}`);
				this.name = `${data} Save`;
				this.modifier = mod;
				this.target = Number.parseInt(savesMap.find((save) => save.name === data)!.value);
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

		if (!this._evaluated) await this.evaluate({ async: true });

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
			die: '1d' + this.dice[0].faces,
			total: this.total,
			vs,
			modifiers: SystemRoll.toModString(this.modifier),
			result,
			offset,
			parts: this.dice.map((d) => d.getTooltipData()),
		};

		return renderTemplate(chatOptions.template, chatData);
	}

	static fromData(data) {
		// Create the Roll instance
		const roll = new Roll(data.formula) as any;

		// Expand terms
		roll.terms = data.terms.map((t) => {
			if (t.class) {
				if (t.class === 'DicePool') t.class = 'PoolTerm'; // backwards compatibility
				return RollTerm.fromData(t);
			}
			return t;
		});

		// Repopulate evaluated state
		if (data.evaluated ?? true) {
			roll._total = data.total;
			roll._dice = (data.dice || []).map((t) => DiceTerm.fromData(t));
			roll._evaluated = true;
		}

		return roll;
	}
}
