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
  Badge,
  ScrollArea,
  Collapse,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconMinus, IconDice5, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import styles from './FloatingDiceRoller.module.css';

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

export function FloatingDiceRoller() {
  const [selectedDice, setSelectedDice] = useState<string>('20');
  const [quantity, setQuantity] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleRoll = async () => {
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

    setRollHistory(prev => [newRoll, ...prev.slice(0, 4)]); // Keep only 5 most recent rolls
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
    <Paper shadow="lg" className={styles.floatingContainer}>
      {/* Header with toggle */}
      <Group justify="space-between" className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <Group gap="xs">
          <IconDice5 size={20} />
          <Text size="sm" fw={600}>Dice Roller</Text>
        </Group>
        <Tooltip label={isExpanded ? "Collapse" : "Expand"}>
          <ActionIcon variant="subtle" size="sm">
            {isExpanded ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
          </ActionIcon>
        </Tooltip>
      </Group>

      <Collapse in={isExpanded}>
        <Stack gap="sm" className={styles.content}>
          {/* Dice Controls */}
          <Group gap="xs">
            <Select
              size="sm"
              data={DICE_TYPES}
              value={selectedDice}
              onChange={(value) => setSelectedDice(value || '20')}
              w={90}
              allowDeselect={false}
              searchable={false}
              comboboxProps={{ zIndex: 1100 }}
            />
            <NumberInput
              size="sm"
              value={quantity}
              onChange={(value) => setQuantity(Number(value) || 1)}
              min={1}
              max={10}
              w={55}
              hideControls
            />
            <NumberInput
              size="sm"
              value={modifier}
              onChange={(value) => setModifier(Number(value) || 0)}
              min={-20}
              max={20}
              w={70}
              hideControls
              leftSection={modifier >= 0 ? <IconPlus size={12} /> : <IconMinus size={12} />}
            />
          </Group>

          {/* Roll Button */}
          <Button
            size="xs"
            onClick={handleRoll}
            leftSection={<IconDice5 size={14} />}
            className={styles.rollButton}
            fullWidth
          >
            {`${quantity}d${selectedDice}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`}
          </Button>

          {/* Roll History */}
          {rollHistory.length > 0 && (
            <ScrollArea h={120}>
              <Stack gap={4}>
                {rollHistory.map((roll) => (
                  <Paper key={roll.id} p={6} withBorder className={styles.historyItem}>
                    <Group justify="space-between" align="center">
                      <Group gap={4}>
                        <Badge 
                          color={getDiceColor(roll.diceType)} 
                          variant="filled" 
                          size="xs"
                        >
                          {roll.quantity}d{roll.diceType}
                          {roll.modifier !== 0 && (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier)}
                        </Badge>
                        <Text size="xs" fw={600}>
                          {roll.total}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {roll.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Group>
                    <Group gap={2} mt={2}>
                      {roll.results.map((result, index) => (
                        <Badge
                          key={index}
                          variant='light'
                          size="xs"
                          color="gray"
                        >
                          {result}
                        </Badge>
                      ))}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}