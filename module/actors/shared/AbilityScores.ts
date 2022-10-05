export type AbilityScoreBlock = {
    [k in AbilityScore]: number;
};

export type AbilityScore = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export const baseAbilityScoreBlock: AbilityScoreBlock = {
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8,
};

export function getModifier(attr: number): number {
    if (attr == 1) {
        return -4;
    } else if (attr <= 3) {
        return -3;
    } else if (attr <= 5) {
        return -2;
    } else if (attr <= 8) {
        return -1;
    } else if (attr <= 12) {
        return 0;
    } else if (attr <= 15) {
        return 1;
    } else if (attr <= 17) {
        return 2;
    } else if (attr <= 19) {
        return 3;
    } else {
        return 4;
    }
}
