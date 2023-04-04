import { CharacterData } from './CharacterData.js';
import { getModifier, AbilityScoreBlock } from '../shared/AbilityScores.js';
import { weaponItemType } from '../../items/weapon/weaponData.js';
import { spellItemType } from '../../items/spell/spellData.js';
import { traitItemType } from '../../items/trait/traitData.js';
import { armorItemType } from '../../items/armor/armorData.js';
import { equipmentItemType } from '../../items/equipment/equipmentData.js';
import { SystemRoll } from '../../rolls/SystemRoll.js';

export class CharacterSheet extends ActorSheet<ActorSheet.Options, CharacterData> {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['beyond-the-wall', 'sheet', 'character'],
			template: 'systems/beyond-the-wall/templates/character.hbs',
			width: 575,
			height: 730,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'main',
				},
			],
			dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
		});
	}

	getData() {
		var data = super.getData() as any;

		data.data.system.abilityMods = Object.entries(data.data.system.abilities)
			.map(([k, v]) => [k, getModifier(v as number)])
			.reduce<AbilityScoreBlock>((p, c) => ({ ...p, [c[0]]: c[1] }), {} as any);
		data.data.system.checkedFortunes = new Array(data.data.system.fortune).fill(true);
		data.data.system.checkedSlots = new Array(data.data.system.slots).fill(true);
		data.data.system.carryWeight = Math.roundDecimals(
			data.items
				.filter((i) => i.system.weight != undefined)
				.filter((i) => i.system.wearing)
				.map((i) => Number.parseFloat(i.system.weight) * Number.parseInt(i.system.quantity ?? 1))
				.reduce((p, c) => p + c, 0),
			3
		);
		while (data.data.system.misc.length < 3) {
			data.data.system.misc.push('');
		}
		data.data.system.itemGroups = this.generateItemGroups(data.items);
		return data;
	}

	generateItemGroups(items: any) {
		return {
			active: items.filter((i) => i.system.wearing).filter((i) => i.system.type == weaponItemType),
			arcana: items.filter((i) => i.system.type == spellItemType),
			traits: items.filter((i) => i.system.type == traitItemType),
			weapons: items.filter((i) => i.system.type == weaponItemType),
			armor: items.filter((i) => i.system.type == armorItemType),
			equipment: items.filter((i) => i.system.type == equipmentItemType),
		};
	}

	/** @override */
	setPosition(options = {}) {
		const position = super.setPosition(options);
		const sheetBody = this.element.find('.sheet-body');
		const bodyHeight = position!.height - 150;
		sheetBody.css('height', bodyHeight);
		return position;
	}

	/** @override */
	activateListeners(html: JQuery) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		html.find('.rollable').click(async (ev) => {
			let target = $(ev.currentTarget).data();
			let roll: Roll;
			let mod: number;
			let flavor: string = '';

			const mods: Record<string, number> = Object.entries((this.actor.system as any).abilities)
				.map(([k, v]) => [k, getModifier(v as number)])
				.reduce((p, c) => ({ ...p, [(c[0] as string).toLowerCase()]: c[1] }), {});

			const data = { ...mods, system: this.actor.system, melee: this.actor.system.mab, ranged: this.actor.system.rab };

			switch (target.type) {
				case 'skill':
					mod = await SystemRoll.getModifier('Modifier');
					roll = new SystemRoll(this.actor, target.ability, target.type, mod);
					break;
				case 'save':
					mod = await SystemRoll.getModifier('Modifier');
					roll = new SystemRoll(this.actor, target.ability, target.type, mod);
					break;
				case 'damage':
					roll = new Roll((this.actor.items.get(target.itemId)!.system as any).damage, data);
					flavor = `<h3>${this.actor.items.get(target.itemId)!.name} Damage</h3>`;
					break;
				case 'attack':
					mod = await SystemRoll.getModifier('Modifier');
					roll = new SystemRoll(this.actor, this.actor.items.get(target.itemId)!, target.type, mod, data);
					break;
				case 'macro':
					const macro = (this.actor.items.get(target.itemId)!.system as any).macro;
					if (!macro) return ui.notifications.warn('The macro formula is empty.');
					roll = new Roll(macro, data);
					flavor = `<h3>${this.actor.items.get(target.itemId)!.name}</h3>`;
					break;
			}
			if (roll!.formula)
				roll!.render().then((content) => {
					ChatMessage.create({
						user: game.user!.id,
						speaker: ChatMessage.getSpeaker({ actor: this.actor }),
						content: flavor + content,
						type: CONST.CHAT_MESSAGE_TYPES.ROLL,
						sound: CONFIG.sounds.dice,
						rolls: [roll],
					});
				});
		});

		// Update Inventory Item
		html.find('.item-edit').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.getEmbeddedDocument('Item', li.data('itemId')) as Item;
			item.sheet!.render(true);
		});

		html.find('.item-inc').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.getEmbeddedDocument('Item', li.data('itemId')) as Item;
			item.update({ system: { quantity: Number.parseFloat((item!.system as any).quantity) + 1 } }, {});
		});

		html.find('.item-dec').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.getEmbeddedDocument('Item', li.data('itemId')) as Item;
			item.update({ system: { quantity: Number.parseFloat((item!.system as any).quantity) - 1 } }, {});
		});

		// Delete Inventory Item
		html.find('.item-delete').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			this.actor.deleteEmbeddedDocuments('Item', [li.data('itemId')]);
			li.slideUp(200, () => this.render(false));
		});
		html.find('.item-stash').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			var item = this.actor.items.get(li.data('itemId'));
			item!.update({ system: { wearing: !(item!.system as any).wearing } }, {});
		});

		html.find('.skill-add').click(this._onClickSkillControl.bind(this));
		html.find('.skill-delete').click(this._onClickSkillControl.bind(this));

		html.find('.goal-add').click(this._onClickGoalControl.bind(this));
		html.find('.goal-delete').click(this._onClickGoalControl.bind(this));
	}

	async _onClickSkillControl(event: JQuery.ClickEvent) {
		event.preventDefault();
		const a = event.currentTarget;
		const action = a.dataset.action;
		//@ts-ignore
		const skills = this.actor.system.skills;

		if (action == 'add') {
			const nk = Object.keys(skills).reduce((p, c) => Math.max(p, parseInt(c)), 0) + 1;
			let newKey = document.createElement('input');
			newKey.type = 'text';
			newKey.name = `system.skills.${nk}.name`;
			newKey.value = 'New Skill';
			this.form!.appendChild(newKey);
			await this._onSubmit(event as any);
		}

		if (action == 'remove') {
			$(`input[name^="system.skills.${a.dataset.index}"]`).remove();
			await this._onSubmit(event as any);
		}
	}

	async _onClickGoalControl(event: JQuery.ClickEvent) {
		event.preventDefault();
		const a = event.currentTarget;
		const action = a.dataset.action;
		//@ts-ignore
		const goals = this.actor.system.goals;

		if (action == 'add') {
			const nk = Object.keys(goals).reduce((p, c) => Math.max(p, parseInt(c)), 0) + 1;
			let newKey = document.createElement('input');
			newKey.type = 'text';
			newKey.name = `system.goals.${nk}.description`;
			newKey.value = 'New Goal';
			this.form!.appendChild(newKey);
			await this._onSubmit(event as any);
		}

		if (action == 'remove') {
			$(`input[name^="system.goals.${a.dataset.index}"]`).remove();
			await this._onSubmit(event as any);
		}
	}

	/** @override */
	_updateObject(_: Event, formData: any) {
		const exp = expandObject(formData).system as CharacterData;
		const skills = exp.skills || [];
		for (let k of Object.keys((this.object as any).system.skills)) {
			if (!skills.hasOwnProperty(k)) skills[`-=${k}`] = null;
		}

		const goals = exp.goals || [];
		for (let k of Object.keys((this.object as any).system.goals)) {
			if (!goals.hasOwnProperty(k)) goals[`-=${k}`] = null;
		}

		const fortune = Object.values(exp.checkedFortunes as any)
			.map<number>((v) => (v ? 1 : 0))
			.reduce((p, c) => p + c);
		const slots = Object.values(exp.checkedSlots as any)
			.map<number>((v) => (v ? 1 : 0))
			.reduce((p, c) => p + c);
		// Re-combine formData
		formData = Object.entries(formData).reduce<any>(
			(obj, e) => {
				obj[e[0]] = e[1];
				return obj;
			},
			{
				system: {
					fortune,
					slots,
					skills,
					goals,
				},
			}
		);

		// Update the Item
		return this.object.update(formData);
	}
}
