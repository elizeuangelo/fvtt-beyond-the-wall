import { saves } from '../actors/character/CharacterData.js';
var RollDirection;
(function (RollDirection) {
    RollDirection[RollDirection["high"] = 0] = "high";
    RollDirection[RollDirection["low"] = 1] = "low";
})(RollDirection || (RollDirection = {}));
export class SystemRoll extends Roll {
    name;
    modifier;
    target;
    direction;
    showOffset;
    static async getModifier(term) {
        const content = `
            <div class="form-group dialog mod-prompt">
            <label>${term}</label> <input type="number" name="modifier" value="0"/>
            </div>`;
        return await new Promise((resolve, reject) => {
            new Dialog({
                title: term,
                content: content,
                default: 'ok',
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'ok',
                        callback: (html) => {
                            resolve(Number.parseInt(html.find('.mod-prompt.dialog [name="modifier"]')[0].value));
                        },
                    },
                },
            }, { width: 50 }).render(true);
        });
    }
    static toModString = (value) => (value == 0 ? '' : value > 0 ? `+ ${value}` : `- ${Math.abs(value)}`);
    constructor(roller, data, type, mod) {
        var item = data;
        switch (type) {
            case 'skill':
                super(`1d20`);
                this.name = `${data} Check`;
                this.modifier = 0;
                this.target = Number.parseInt(roller.system.abilities[data]) + mod;
                this.direction = RollDirection.low;
                this.showOffset = false;
                break;
            case 'save':
                const savesMap = Object.values(roller.system.saves).map(({ name, value }, idx) => {
                    if (name === '')
                        name = saves[idx];
                    return { name, value };
                });
                super(`1d20 + ${mod}`);
                this.name = `${data} Save`;
                this.modifier = mod;
                this.target = Number.parseInt(savesMap.find((save) => save.name === data).value);
                this.direction = RollDirection.high;
                this.showOffset = false;
                break;
            case 'attack':
                var amod = Number.parseInt(item.system.bonus) + mod;
                super(`1d20 + ${amod}`);
                this.name = `${item.name} Attack`;
                this.modifier = amod;
                this.target = NaN;
                break;
        }
    }
    async render(chatOptions = {}) {
        chatOptions = mergeObject({
            user: game.user.id,
            flavor: null,
            template: 'systems/beyond-the-wall/templates/roll.hbs',
        }, chatOptions || {});
        if (!this._evaluated)
            await this.evaluate({ async: true });
        var result = '';
        var vs = '';
        var offset = '';
        if (!isNaN(this.target)) {
            vs = `vs ${this.target}`;
            offset = this.showOffset ? ` (${Math.abs(this.total - this.target)})` : '';
            switch (this.direction) {
                case RollDirection.low:
                    result = this.total <= this.target ? 'success' : 'failure';
                    break;
                case RollDirection.high:
                    result = this.total >= this.target ? 'success' : 'failure';
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
}
