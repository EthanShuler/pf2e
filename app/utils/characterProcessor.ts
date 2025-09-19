import { 
  PathbuilderCharacter, 
  ProcessedCharacter, 
  SkillData, 
  SaveData, 
  AttackData, 
  SpellcastingData,
  getAbilityModifier,
  SKILL_ABILITIES,
  SAVE_ABILITIES
} from '../types/character';

export function processPathbuilderCharacter(pathbuilderData: PathbuilderCharacter): ProcessedCharacter {
  const { build } = pathbuilderData;
  
  // Calculate ability modifiers
  const abilityMods = {
    str: getAbilityModifier(build.abilities.str),
    dex: getAbilityModifier(build.abilities.dex),
    con: getAbilityModifier(build.abilities.con),
    int: getAbilityModifier(build.abilities.int),
    wis: getAbilityModifier(build.abilities.wis),
    cha: getAbilityModifier(build.abilities.cha),
  };

  // Process skills
  const skills: SkillData[] = Object.entries(SKILL_ABILITIES).map(([skillName, abilityKey]) => {
    const proficiency = build.proficiencies[skillName as keyof typeof build.proficiencies] as number;
    const abilityMod = abilityMods[abilityKey as keyof typeof abilityMods];
    // Untrained (0) doesn't add level, trained and above do
    const profBonus = proficiency === 0 ? 0 : proficiency + build.level;
    const total = abilityMod + profBonus;

    return {
      name: skillName.charAt(0).toUpperCase() + skillName.slice(1),
      ability: abilityKey.toUpperCase(),
      proficiency,
      total,
      abilityMod,
      profBonus,
    };
  });

  // Process saving throws
  const saves: SaveData[] = Object.entries(SAVE_ABILITIES).map(([saveName, abilityKey]) => {
    const proficiency = build.proficiencies[saveName as keyof typeof build.proficiencies] as number;
    const abilityMod = abilityMods[abilityKey as keyof typeof abilityMods];
    // Untrained (0) doesn't add level, trained and above do
    const profBonus = proficiency === 0 ? 0 : proficiency + build.level;
    const total = abilityMod + profBonus;

    return {
      name: saveName.charAt(0).toUpperCase() + saveName.slice(1),
      ability: abilityKey.toUpperCase(),
      proficiency,
      total,
      abilityMod,
      profBonus,
    };
  });

  // Process attacks (basic weapon proficiencies)
  const attacks: AttackData[] = [
    {
      name: 'Simple Weapons',
      proficiency: build.proficiencies.simple,
      total: abilityMods.str + (build.proficiencies.simple === 0 ? 0 : build.proficiencies.simple + build.level),
    },
    {
      name: 'Martial Weapons', 
      proficiency: build.proficiencies.martial,
      total: abilityMods.str + (build.proficiencies.martial === 0 ? 0 : build.proficiencies.martial + build.level),
    },
    {
      name: 'Advanced Weapons',
      proficiency: build.proficiencies.advanced,
      total: abilityMods.str + (build.proficiencies.advanced === 0 ? 0 : build.proficiencies.advanced + build.level),
    },
    {
      name: 'Unarmed',
      proficiency: build.proficiencies.unarmed,
      total: abilityMods.str + (build.proficiencies.unarmed === 0 ? 0 : build.proficiencies.unarmed + build.level),
    },
  ].filter(attack => attack.proficiency > 0);

  // Process spellcasting
  const spellcasting: SpellcastingData[] = build.spellCasters.map(caster => {
    const abilityKey = caster.ability as keyof typeof abilityMods;
    const abilityMod = abilityMods[abilityKey];
    // Untrained (0) doesn't add level, trained and above do
    const profBonus = caster.proficiency === 0 ? 0 : caster.proficiency + build.level;
    const dc = 10 + abilityMod + profBonus;
    const attackBonus = abilityMod + profBonus;

    return {
      name: caster.name,
      tradition: caster.magicTradition,
      ability: caster.ability.toUpperCase(),
      proficiency: caster.proficiency,
      dc,
      attackBonus,
    };
  });

  // Calculate HP
  const hp = build.attributes.ancestryhp + 
             (build.attributes.classhp + abilityMods.con + build.attributes.bonushpPerLevel) * build.level + 
             build.attributes.bonushp;

  return {
    id: `${build.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    name: build.name,
    class: build.class,
    level: build.level,
    ancestry: build.ancestry,
    abilities: build.abilities,
    proficiencies: build.proficiencies,
    skills,
    saves,
    attacks,
    spellcasting,
    ac: build.acTotal.acTotal,
    hp,
    lores: build.lores,
  };
}

export function calculateDC(characterId: string, rollType: string, characters: ProcessedCharacter[]): number | null {
  const character = characters.find(c => c.id === characterId);
  if (!character) return null;

  // Class DC
  if (rollType === 'class') {
    const keyAbility = character.abilities[character.proficiencies.classDC === 8 ? 'con' : 'str']; // This is simplified
    const abilityMod = getAbilityModifier(keyAbility);
    const profBonus = character.proficiencies.classDC === 0 ? 0 : character.proficiencies.classDC + character.level;
    return 10 + abilityMod + profBonus;
  }

  // Spell DC
  const spellcaster = character.spellcasting.find(sc => sc.proficiency > 0);
  if (rollType === 'spell' && spellcaster) {
    return spellcaster.dc;
  }

  // Skill DC (using the highest relevant skill)
  const skill = character.skills.find(s => s.name.toLowerCase() === rollType.toLowerCase());
  if (skill) {
    return 10 + skill.total;
  }

  return null;
}

export function getSkillModifier(characterId: string, skillName: string, characters: ProcessedCharacter[]): number | null {
  const character = characters.find(c => c.id === characterId);
  if (!character) return null;

  const skill = character.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
  return skill ? skill.total : null;
}

export function getSaveModifier(characterId: string, saveName: string, characters: ProcessedCharacter[]): number | null {
  const character = characters.find(c => c.id === characterId);
  if (!character) return null;

  const save = character.saves.find(s => s.name.toLowerCase() === saveName.toLowerCase());
  return save ? save.total : null;
}

export function getAttackModifier(characterId: string, attackType: string, characters: ProcessedCharacter[]): number | null {
  const character = characters.find(c => c.id === characterId);
  if (!character) return null;

  const attack = character.attacks.find(a => a.name.toLowerCase().includes(attackType.toLowerCase()));
  return attack ? attack.total : null;
}
