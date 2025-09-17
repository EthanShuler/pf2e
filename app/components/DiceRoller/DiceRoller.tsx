'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  NumberInput,
  Select,
  Text,
  Paper,
  Stack,
  Grid,
  Badge,
  ActionIcon,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { IconDice, IconPlus, IconMinus } from '@tabler/icons-react';
import { ProcessedCharacter } from '../../types/character';
import classes from './DiceRoller.module.css';

interface DiceRoll {
  id: string;
  diceType: number;
  quantity: number;
  modifier: number;
  results: number[];
  total: number;
  timestamp: Date;
}

interface DiceRollerProps {
  characters?: ProcessedCharacter[];
}

const DICE_TYPES = [
  { value: '4', label: 'd4' },
  { value: '6', label: 'd6' },
  { value: '8', label: 'd8' },
  { value: '10', label: 'd10' },
  { value: '12', label: 'd12' },
  { value: '20', label: 'd20' },
];

export function DiceRoller({ characters = [] }: DiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState<string>('20');
  const [quantity, setQuantity] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [rollType, setRollType] = useState<string>('manual');

  const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const getAutoModifier = (): number => {
    if (!selectedCharacter || rollType === 'manual') return 0;
    
    const character = characters.find(c => c.id === selectedCharacter);
    if (!character) return 0;

    switch (rollType) {
      case 'attack':
        // Use the best weapon proficiency available
        const bestAttack = character.attacks.reduce((best, current) => 
          current.total > best.total ? current : best, character.attacks[0]);
        return bestAttack ? bestAttack.total : 0;
      
      case 'save':
        // Average of all saves - in a real implementation, you'd select specific save
        const avgSave = character.saves.reduce((sum, save) => sum + save.total, 0) / character.saves.length;
        return Math.floor(avgSave);
      
      case 'skill':
        // Use the highest skill modifier - in a real implementation, you'd select specific skill
        const bestSkill = character.skills.reduce((best, current) => 
          current.total > best.total ? current : best, character.skills[0]);
        return bestSkill ? bestSkill.total : 0;
      
      case 'spell':
        // Use spell attack bonus if available
        const spellcaster = character.spellcasting.find(sc => sc.proficiency > 0);
        return spellcaster ? spellcaster.attackBonus : 0;
      
      default:
        return 0;
    }
  };

  const getEffectiveModifier = (): number => {
    const autoMod = getAutoModifier();
    return rollType === 'manual' ? modifier : autoMod + modifier;
  };

  const handleRoll = async () => {
    setIsRolling(true);
    
    // Simulate rolling animation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const diceType = parseInt(selectedDice);
    const results: number[] = [];
    
    for (let i = 0; i < quantity; i++) {
      results.push(rollDice(diceType));
    }
    
    const effectiveModifier = getEffectiveModifier();
    const total = results.reduce((sum, result) => sum + result, 0) + effectiveModifier;
    
    const newRoll: DiceRoll = {
      id: Date.now().toString(),
      diceType,
      quantity,
      modifier: effectiveModifier,
      results,
      total,
      timestamp: new Date(),
    };
    
    setRollHistory(prev => [newRoll, ...prev.slice(0, 9)]);
    setIsRolling(false);
  };

  const getDiceColor = (diceType: number): string => {
    const colors: Record<number, string> = {
      4: 'blue',
      6: 'green',
      8: 'orange',
      10: 'purple',
      12: 'pink',
      20: 'red',
    };
    return colors[diceType] || 'gray';
  };

  return (
    <Paper p="xl" shadow="sm" className={classes.container}>
      <Stack gap="xl">
        <Group justify="center">
          <IconDice size={32} />
          <Text size="xl" fw={700}>Pathfinder 2e Dice Roller</Text>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label="Dice Type"
              data={DICE_TYPES}
              value={selectedDice}
              onChange={(value) => setSelectedDice(value || '20')}
              size="lg"
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberInput
              label="Quantity"
              value={quantity}
              onChange={(value) => setQuantity(Number(value) || 1)}
              min={1}
              max={10}
              size="lg"
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberInput
              label="Modifier"
              value={modifier}
              onChange={(value) => setModifier(Number(value) || 0)}
              min={-20}
              max={20}
              size="lg"
              leftSection={modifier >= 0 ? <IconPlus size={16} /> : <IconMinus size={16} />}
            />
          </Grid.Col>
        </Grid>

        {/* Character Integration */}
        {characters.length > 0 && (
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Character (Optional)"
                placeholder="Select a character for auto-modifiers"
                data={[
                  { value: '', label: 'Manual Roll' },
                  ...characters.map(char => ({ 
                    value: char.id, 
                    label: `${char.name} (Level ${char.level} ${char.class})` 
                  }))
                ]}
                value={selectedCharacter}
                onChange={(value) => setSelectedCharacter(value || '')}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Roll Type"
                data={[
                  { value: 'manual', label: 'Manual Roll' },
                  { value: 'attack', label: 'Attack Roll' },
                  { value: 'save', label: 'Saving Throw' },
                  { value: 'skill', label: 'Skill Check' },
                  { value: 'spell', label: 'Spell Attack' },
                ]}
                value={rollType}
                onChange={(value) => setRollType(value || 'manual')}
                disabled={!selectedCharacter}
              />
            </Grid.Col>
          </Grid>
        )}

        <Group justify="center">
          <Button
            size="xl"
            onClick={handleRoll}
            loading={isRolling}
            leftSection={<IconDice size={20} />}
            className={classes.rollButton}
          >
            {isRolling ? 'Rolling...' : (() => {
              const effectiveModifier = getEffectiveModifier();
              return `Roll ${quantity}d${selectedDice}${effectiveModifier !== 0 ? (effectiveModifier > 0 ? `+${effectiveModifier}` : effectiveModifier) : ''}`;
            })()}
          </Button>
        </Group>

        {/* Enhanced Dice Animation */}
        {isRolling && (
          <div className={classes.diceBox}>
            <Group justify="center" className={classes.diceContainer}>
              {Array.from({ length: quantity }).map((_, index) => (
                <div key={index} className={classes.dice} data-dice-type={selectedDice}>
                  <div className={classes.diceInner}>
                    <div className={classes.diceFace}>
                      <span className={classes.diceIcon}>🎲</span>
                    </div>
                  </div>
                </div>
              ))}
            </Group>
            <Text ta="center" c="white" size="lg" mt="md">
              Rolling {quantity}d{selectedDice}...
            </Text>
          </div>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <>
            <Divider label="Roll History" labelPosition="center" />
            <ScrollArea h={300}>
              <Stack gap="sm">
                {rollHistory.map((roll) => (
                  <Paper key={roll.id} p="md" withBorder className={classes.historyItem}>
                    <Group justify="space-between" align="flex-start">
                      <Stack gap="xs">
                        <Group gap="xs">
                          <Badge color={getDiceColor(roll.diceType)} variant="filled">
                            {roll.quantity}d{roll.diceType}
                            {roll.modifier !== 0 && (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier)}
                          </Badge>
                          <Text fw={700} size="lg">
                            {roll.quantity === 1 ? 'Result' : 'Total'}: {roll.total}
                          </Text>
                        </Group>
                        
                        <Group gap="xs">
                          <Text size="sm">Individual rolls:</Text>
                          {roll.results.map((result, index) => (
                            <Badge
                              key={index}
                              variant='light'
                              color={getDiceColor(roll.diceType)}
                            >
                              {result}
                            </Badge>
                          ))}
                        </Group>
                      </Stack>
                      
                      <Text size="xs" c="dimmed">
                        {roll.timestamp.toLocaleTimeString()}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          </>
        )}

        {/* Quick Roll Buttons */}
        <Group justify="center" gap="md">
          <Text size="sm" c="dimmed">Quick Rolls:</Text>
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => {
              setSelectedDice('20');
              setQuantity(1);
              setModifier(0);
              if (selectedCharacter) {
                setRollType('attack');
              }
              handleRoll();
            }}
            title={selectedCharacter ? "Character Attack Roll" : "Attack Roll (d20)"}
          >
            ⚔️
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => {
              setSelectedDice('6');
              setQuantity(1);
              setModifier(0);
              setRollType('manual'); // Damage is always manual
              handleRoll();
            }}
            title="Damage Roll (d6)"
          >
            💥
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="green"
            onClick={() => {
              setSelectedDice('20');
              setQuantity(1);
              setModifier(0);
              if (selectedCharacter) {
                setRollType('save');
              }
              handleRoll();
            }}
            title={selectedCharacter ? "Character Saving Throw" : "Saving Throw (d20)"}
          >
            🛡️
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
}
