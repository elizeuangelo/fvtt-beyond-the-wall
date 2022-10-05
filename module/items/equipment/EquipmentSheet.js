export class EquipmentSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['beyond-the-wall', 'sheet', 'equipment'],
            template: 'systems/beyond-the-wall/templates/equipment.hbs',
            width: 520,
            height: 275,
        });
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
    }
    _updateObject(_, formData) {
        formData = Object.entries(formData).reduce((obj, e) => {
            obj[e[0]] = e[1];
            return obj;
        }, { _id: this.object.id });
        return this.object.update(formData);
    }
}
