import { getModifier } from '../shared/AbilityScores.js';
import { weaponItemType } from '../../items/weapon/weaponData.js';
import { spellItemType } from '../../items/spell/spellData.js';
import { traitItemType } from '../../items/trait/traitData.js';
import { armorItemType } from '../../items/armor/armorData.js';
import { equipmentItemType } from '../../items/equipment/equipmentData.js';
import { SystemRoll } from '../../rolls/SystemRoll.js';
export class CharacterSheet extends ActorSheet {
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
        var data = super.getData();
        data.data.system.abilityMods = Object.entries(data.data.system.abilities)
            .map(([k, v]) => [k, getModifier(v)])
            .reduce((p, c) => ({ ...p, [c[0]]: c[1] }), {});
        data.data.system.checkedFortunes = new Array(data.data.system.fortune).fill(true);
        data.data.system.checkedSlots = new Array(data.data.system.slots).fill(true);
        data.data.system.carryWeight = Math.roundDecimals(data.items
            .filter((i) => i.system.weight != undefined)
            .filter((i) => i.system.wearing)
            .map((i) => Number.parseFloat(i.system.weight) * Number.parseInt(i.system.quantity ?? 1))
            .reduce((p, c) => p + c, 0), 3);
        while (data.data.system.misc.length < 3) {
            data.data.system.misc.push('');
        }
        data.data.system.itemGroups = this.generateItemGroups(data.items);
        return data;
    }
    generateItemGroups(items) {
        return {
            active: items.filter((i) => i.system.wearing).filter((i) => i.system.type == weaponItemType),
            arcana: items.filter((i) => i.system.type == spellItemType),
            traits: items.filter((i) => i.system.type == traitItemType),
            weapons: items.filter((i) => i.system.type == weaponItemType),
            armor: items.filter((i) => i.system.type == armorItemType),
            equipment: items.filter((i) => i.system.type == equipmentItemType),
        };
    }
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find('.sheet-body');
        const bodyHeight = position.height - 150;
        sheetBody.css('height', bodyHeight);
        return position;
    }
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable)
            return;
        html.find('.rollable').click(async (ev) => {
            let target = $(ev.currentTarget).data();
            let roll;
            let mod;
            let flavor = '';
            const mods = Object.entries(this.actor.system.abilities)
                .map(([k, v]) => [k, getModifier(v)])
                .reduce((p, c) => ({ ...p, [c[0].toLowerCase()]: c[1] }), {});
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
                    roll = new Roll(this.actor.items.get(target.itemId).system.damage, data);
                    flavor = `<h3>${this.actor.items.get(target.itemId).name} Damage</h3>`;
                    break;
                case 'attack':
                    mod = await SystemRoll.getModifier('Modifier');
                    roll = new SystemRoll(this.actor, this.actor.items.get(target.itemId), target.type, mod, data);
                    break;
                case 'macro':
                    const macro = this.actor.items.get(target.itemId).system.macro;
                    if (!macro)
                        return ui.notifications.warn('The macro formula is empty.');
                    roll = new Roll(macro, data);
                    flavor = `<h3>${this.actor.items.get(target.itemId).name}</h3>`;
                    break;
            }
            if (roll.formula)
                roll.render().then((content) => {
                    ChatMessage.create({
                        user: game.user.id,
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        content: flavor + content,
                        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                        sound: CONFIG.sounds.dice,
                        rolls: [roll],
                    });
                });
        });
        html.find('.item-edit').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'));
            item.sheet.render(true);
        });
        html.find('.item-inc').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'));
            item.update({ system: { quantity: Number.parseFloat(item.system.quantity) + 1 } }, {});
        });
        html.find('.item-dec').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'));
            item.update({ system: { quantity: Number.parseFloat(item.system.quantity) - 1 } }, {});
        });
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            this.actor.deleteEmbeddedDocuments('Item', [li.data('itemId')]);
            li.slideUp(200, () => this.render(false));
        });
        html.find('.item-stash').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            var item = this.actor.items.get(li.data('itemId'));
            item.update({ system: { wearing: !item.system.wearing } }, {});
        });
        html.find('.skill-add').click(this._onClickSkillControl.bind(this));
        html.find('.skill-delete').click(this._onClickSkillControl.bind(this));
        html.find('.goal-add').click(this._onClickGoalControl.bind(this));
        html.find('.goal-delete').click(this._onClickGoalControl.bind(this));
    }
    async _onClickSkillControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const action = a.dataset.action;
        const skills = this.actor.system.skills;
        if (action == 'add') {
            const nk = Object.keys(skills).reduce((p, c) => Math.max(p, parseInt(c)), 0) + 1;
            let newKey = document.createElement('input');
            newKey.type = 'text';
            newKey.name = `system.skills.${nk}.name`;
            newKey.value = 'New Skill';
            this.form.appendChild(newKey);
            await this._onSubmit(event);
        }
        if (action == 'remove') {
            $(`input[name^="system.skills.${a.dataset.index}"]`).remove();
            await this._onSubmit(event);
        }
    }
    async _onClickGoalControl(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const action = a.dataset.action;
        const goals = this.actor.system.goals;
        if (action == 'add') {
            const nk = Object.keys(goals).reduce((p, c) => Math.max(p, parseInt(c)), 0) + 1;
            let newKey = document.createElement('input');
            newKey.type = 'text';
            newKey.name = `system.goals.${nk}.description`;
            newKey.value = 'New Goal';
            this.form.appendChild(newKey);
            await this._onSubmit(event);
        }
        if (action == 'remove') {
            $(`input[name^="system.goals.${a.dataset.index}"]`).remove();
            await this._onSubmit(event);
        }
    }
    _updateObject(_, formData) {
        const exp = expandObject(formData).system;
        const skills = exp.skills || [];
        for (let k of Object.keys(this.object.system.skills)) {
            if (!skills.hasOwnProperty(k))
                skills[`-=${k}`] = null;
        }
        const goals = exp.goals || [];
        for (let k of Object.keys(this.object.system.goals)) {
            if (!goals.hasOwnProperty(k))
                goals[`-=${k}`] = null;
        }
        const fortune = Object.values(exp.checkedFortunes)
            .map((v) => (v ? 1 : 0))
            .reduce((p, c) => p + c);
        const slots = Object.values(exp.checkedSlots)
            .map((v) => (v ? 1 : 0))
            .reduce((p, c) => p + c);
        formData = Object.entries(formData).reduce((obj, e) => {
            obj[e[0]] = e[1];
            return obj;
        }, {
            system: {
                fortune,
                slots,
                skills,
                goals,
            },
        });
        return this.object.update(formData);
    }
}
