import { spellItemType } from './items/spell/spellData.js';
import { equipmentItemType } from './items/equipment/equipmentData.js';
import { weaponItemType } from './items/weapon/weaponData.js';
export const preloadTemplates = async function () {
    const templatePaths = [
        'systems/beyond-the-wall/templates/character/header.hbs',
        'systems/beyond-the-wall/templates/character/main.hbs',
        'systems/beyond-the-wall/templates/character/items.hbs',
        'systems/beyond-the-wall/templates/character/description.hbs',
        'systems/beyond-the-wall/templates/item/abilitySelector.hbs',
    ];
    Handlebars.registerHelper('isArcana', (t) => t == spellItemType);
    Handlebars.registerHelper('isEquipment', (t) => t == equipmentItemType);
    Handlebars.registerHelper('isWeapon', (t) => t == weaponItemType);
    return loadTemplates(templatePaths);
};
