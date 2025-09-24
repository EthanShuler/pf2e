// Pathbuilder Character Export Types
export interface PathbuilderCharacter {
  success: boolean;
  build: CharacterBuild;
}

export interface CharacterBuild {
  name: string;
  class: string;
  dualClass: string | null;
  level: number;
  xp: number;
  ancestry: string;
  heritage: string;
  background: string;
  alignment: string;
  gender: string;
  age: string;
  deity: string;
  size: number;
  sizeName: string;
  keyability: string;
  languages: string[];
  rituals: unknown[];
  resistances: unknown[];
  inventorMods: unknown[];
  abilities: Abilities;
  attributes: Attributes;
  proficiencies: Proficiencies;
  mods: Record<string, unknown>;
  feats: Feat[];
  lores: Lore[];
  equipmentContainers: Record<string, unknown>;
  equipment: unknown[];
  specificProficiencies: SpecificProficiencies;
  weapons: unknown[];
  money: Money;
  armor: unknown[];
  spellCasters: SpellCaster[];
  formula: Formula[];
  acTotal: ACTotal;
  pets: unknown[];
  familiars: unknown[];
}

export interface Abilities {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  breakdown: AbilityBreakdown;
}

export interface AbilityBreakdown {
  ancestryFree: string[];
  ancestryBoosts: string[];
  ancestryFlaws: string[];
  backgroundBoosts: string[];
  classBoosts: string[];
  mapLevelledBoosts: Record<string, string[]>;
}

export interface Attributes {
  ancestryhp: number;
  classhp: number;
  bonushp: number;
  bonushpPerLevel: number;
  speed: number;
  speedBonus: number;
}

export interface Proficiencies {
  classDC: number;
  perception: number;
  fortitude: number;
  reflex: number;
  will: number;
  heavy: number;
  medium: number;
  light: number;
  unarmored: number;
  advanced: number;
  martial: number;
  simple: number;
  unarmed: number;
  castingArcane: number;
  castingDivine: number;
  castingOccult: number;
  castingPrimal: number;
  // Skills
  acrobatics: number;
  arcana: number;
  athletics: number;
  crafting: number;
  deception: number;
  diplomacy: number;
  intimidation: number;
  medicine: number;
  nature: number;
  occultism: number;
  performance: number;
  religion: number;
  society: number;
  stealth: number;
  survival: number;
  thievery: number;
}

export type Feat = [string, string | null, string, number, string?, string?, unknown?];

export type Lore = [string, number];

export interface SpecificProficiencies {
  trained: string[];
  expert: string[];
  master: string[];
  legendary: string[];
}

export interface Money {
  cp: number;
  sp: number;
  gp: number;
  pp: number;
}

export interface SpellCaster {
  name: string;
  magicTradition: string;
  spellcastingType: string;
  ability: string;
  proficiency: number;
  focusPoints: number;
  innate: boolean;
  perDay: number[];
  spells: Spell[];
  prepared: unknown[];
  blendedSpells: unknown[];
}

export interface Spell {
  spellLevel: number;
  list: unknown[];
}

export interface Formula {
  type: string;
  known: string[];
}

export interface ACTotal {
  acProfBonus: number;
  acAbilityBonus: number;
  acItemBonus: number;
  acTotal: number;
  shieldBonus: number | null;
}

// Helper types for our app
export interface ProcessedCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  ancestry: string;
  abilities: Abilities;
  proficiencies: Proficiencies;
  skills: SkillData[];
  saves: SaveData[];
  attacks: AttackData[];
  spellcasting: SpellcastingData[];
  perception: SkillData;
  loreSkills: SkillData[];
  ac: number;
  hp: number;
  lores: Lore[];
}

export interface SkillData {
  name: string;
  ability: string;
  proficiency: number;
  total: number;
  abilityMod: number;
  profBonus: number;
}

export interface SaveData {
  name: string;
  ability: string;
  proficiency: number;
  total: number;
  abilityMod: number;
  profBonus: number;
}

export interface AttackData {
  name: string;
  proficiency: number;
  total: number;
}

export interface SpellcastingData {
  name: string;
  tradition: string;
  ability: string;
  proficiency: number;
  dc: number;
  attackBonus: number;
}

// Proficiency rank names
export const PROFICIENCY_NAMES = {
  0: 'Untrained',
  2: 'Trained', 
  4: 'Expert',
  6: 'Master',
  8: 'Legendary'
} as const;

// Ability score modifiers
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Skill to ability mapping
export const SKILL_ABILITIES: Record<string, keyof Abilities> = {
  acrobatics: 'dex',
  arcana: 'int',
  athletics: 'str',
  crafting: 'int',
  deception: 'cha',
  diplomacy: 'cha',
  intimidation: 'cha',
  medicine: 'wis',
  nature: 'wis',
  occultism: 'int',
  performance: 'cha',
  religion: 'wis',
  society: 'int',
  stealth: 'dex',
  survival: 'wis',
  thievery: 'dex'
};

// Save to ability mapping
export const SAVE_ABILITIES = {
  fortitude: 'con',
  reflex: 'dex',
  will: 'wis'
} as const;
