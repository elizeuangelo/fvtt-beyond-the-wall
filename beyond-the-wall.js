import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { CharacterSheet } from './module/actors/character/CharacterSheet.js';
import { GeneralSheet } from './module/actors/general/GeneralSheet.js';
import { characterActorType } from './module/actors/character/CharacterData.js';
import { generalActorType } from './module/actors/general/GeneralData.js';
import { spellItemType } from './module/items/spell/spellData.js';
import { SpellSheet } from './module/items/spell/SpellSheet.js';
import { EquipmentSheet } from './module/items/equipment/EquipmentSheet.js';
import { ArmorSheet } from './module/items/armor/ArmorSheet.js';
import { WeaponSheet } from './module/items/weapon/WeaponSheet.js';
import { TraitSheet } from './module/items/trait/TraitSheet.js';
import { traitItemType } from './module/items/trait/traitData.js';
import { weaponItemType } from './module/items/weapon/weaponData.js';
import { armorItemType } from './module/items/armor/armorData.js';
import { equipmentItemType } from './module/items/equipment/equipmentData.js';
import { SystemRoll } from './module/rolls/SystemRoll.js';
Hooks.once('init', async function () {
    console.log('beyond-the-wall | Initializing beyond-the-wall');
    registerSettings();
    await preloadTemplates();
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('beyond-the-wall', CharacterSheet, { types: [characterActorType], makeDefault: true });
    Actors.registerSheet('beyond-the-wall', GeneralSheet, { types: [generalActorType], makeDefault: true });
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('beyond-the-wall', SpellSheet, { types: [spellItemType], makeDefault: true });
    Items.registerSheet('beyond-the-wall', EquipmentSheet, { types: [equipmentItemType], makeDefault: true });
    Items.registerSheet('beyond-the-wall', ArmorSheet, { types: [armorItemType], makeDefault: true });
    Items.registerSheet('beyond-the-wall', WeaponSheet, { types: [weaponItemType], makeDefault: true });
    Items.registerSheet('beyond-the-wall', TraitSheet, { types: [traitItemType], makeDefault: true });
    CONFIG.Dice.rolls.push(SystemRoll);
});
Hooks.once('setup', function () {
});
Hooks.once('ready', function () {
});
