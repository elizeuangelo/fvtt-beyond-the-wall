export type ArmorItemType = "Armor";
export type WeaponItemType = "Weapon";
export type EquipmentItemType = "Equipment";
export type PhysicalItemType = ArmorItemType | WeaponItemType | EquipmentItemType;
export type TraitItemType = "Trait";
export type SpellItemType = "Arcana";

export type ItemType = PhysicalItemType | TraitItemType | SpellItemType;

export type ItemData = {
    type: ItemType;
    description: string;
};

export type PhysicalItemData = ItemData & {
    type: PhysicalItemType;
    weight: number;
    wearing: boolean;
};
