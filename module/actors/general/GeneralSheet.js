import { weaponItemType } from '../../items/weapon/weaponData.js';
import { SystemRoll } from '../../rolls/SystemRoll.js';
export class GeneralSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['beyond-the-wall', 'sheet', 'general'],
            template: 'systems/beyond-the-wall/templates/general.hbs',
            width: 520,
            height: 450,
            dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
        });
    }
    getData() {
        var data = super.getData();
        data.data.system.carryWeight = Math.roundDecimals(data.items
            .filter((i) => i.system.weight != undefined)
            .filter((i) => i.system.wearing)
            .map((i) => Number.parseFloat(i.system.weight) * Number.parseInt(i.system.quantity ?? 1))
            .reduce((p, c) => p + c, 0), 3);
        return data;
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
            let item = this.actor.items.get(target.itemId);
            let roll;
            let mod;
            let flavor = '';
            if (item.type == weaponItemType) {
                switch (target.type) {
                    case 'use':
                        mod = await SystemRoll.getModifier('Modifier');
                        roll = new SystemRoll(this.actor, this.actor.items.get(target.itemId), 'attack', mod);
                        break;
                    case 'damage':
                        roll = new Roll(this.actor.items.get(target.itemId).data.system.damage);
                        flavor = `<h3>${this.actor.items.get(target.itemId).name} Damage</h3>`;
                        break;
                }
            }
            else {
                roll = new Roll(this.actor.items.get(target.itemId).system.macro);
                flavor = `<h3>${this.actor.items.get(target.itemId).name}</h3>`;
            }
            if (roll.formula)
                roll.render().then((content) => {
                    ChatMessage.create({
                        user: game.user.id,
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        content: flavor + content,
                    });
                });
        });
        html.find('.item-inc').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            var item = this.actor.items.get(li.data('itemId'));
            item.update({ system: { quantity: Number.parseFloat(item.system.quantity) + 1 } }, {});
        });
        html.find('.item-dec').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            var item = this.actor.items.get(li.data('itemId'));
            item.update({ system: { quantity: Number.parseFloat(item.system.quantity) - 1 } }, {});
        });
        html.find('.item-edit').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'));
            item.sheet.render(true);
        });
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.item');
            this.actor.deleteEmbeddedDocuments('Item', [li.data('itemId')]);
            li.slideUp(200, () => this.render(false));
        });
        html.find('.skill-add').click(this._onClickSkillControl.bind(this));
        html.find('.skill-delete').click(this._onClickSkillControl.bind(this));
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
            newKey.value = 'New Statistic';
            this.form.appendChild(newKey);
            await this._onSubmit(event);
        }
        if (action == 'remove') {
            $(`input[name^="system.skills.${a.dataset.index}"]`).remove();
            await this._onSubmit(event);
        }
    }
    _updateObject(_, formData) {
        const skills = expandObject(formData).system.skills || [];
        for (let k of Object.keys(this.object.system.skills)) {
            if (!skills.hasOwnProperty(k))
                skills[`-=${k}`] = null;
        }
        formData = Object.entries(formData).reduce((obj, e) => {
            obj[e[0]] = e[1];
            return obj;
        }, { system: { skills } });
        return this.object.update(formData);
    }
}
