export const spellItemType = 'Arcana';
export var SpellType;
(function (SpellType) {
    SpellType["Cantrip"] = "Cantrip";
    SpellType["Ritual"] = "Ritual";
    SpellType["Spell"] = "Spell";
})(SpellType || (SpellType = {}));
export const emptySpellData = {
    type: spellItemType,
    time: '',
    description: '',
    spellType: SpellType.Cantrip,
    ability: '',
    macro: '',
};
