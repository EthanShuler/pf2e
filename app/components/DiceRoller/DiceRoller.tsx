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

const DICE_TYPES = [
  { value: '4', label: 'd4' },
  { value: '6', label: 'd6' },
  { value: '8', label: 'd8' },
  { value: '10', label: 'd10' },
  { value: '12', label: 'd12' },
  { value: '20', label: 'd20' },
];

export function DiceRoller() {
  const [selectedDice, setSelectedDice] = useState<string>('20');
  const [quantity, setQuantity] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
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
    
    const total = results.reduce((sum, result) => sum + result, 0) + modifier;
    
    const newRoll: DiceRoll = {
      id: Date.now().toString(),
      diceType,
      quantity,
      modifier,
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

        <Group justify="center">
          <Button
            size="xl"
            onClick={handleRoll}
            loading={isRolling}
            leftSection={<IconDice size={20} />}
            className={classes.rollButton}
          >
            {isRolling ? 'Rolling...' : `Roll ${quantity}d${selectedDice}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`}
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
              handleRoll();
            }}
            title="Attack Roll (d20)"
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
              handleRoll();
            }}
            title="Saving Throw (d20)"
          >
            🛡️
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
}
