'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  Text,
  Paper,
  Stack,
  Textarea,
  Badge,
  Alert,
  ScrollArea,
  Card,
  Grid,
  Divider,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconUser, IconAlertCircle, IconCheck, IconTrash, IconDice } from '@tabler/icons-react';
import { PathbuilderCharacter, ProcessedCharacter } from '../../types/character';
import { processPathbuilderCharacter } from '../../utils/characterProcessor';
import { useCharacters } from '../../hooks/useCharacters';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import styles from './CharacterManager.module.css';

export function CharacterManager() {
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const { characters, addCharacter, removeCharacter } = useCharacters();
  const { preferences } = useUserPreferences();

  const handleImport = async () => {
    if (!importText.trim()) {
      setImportError('Please paste character JSON data');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      // Support multiple character imports (one per line or comma-separated)
      const jsonStrings = importText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.startsWith('{'));

      if (jsonStrings.length === 0) {
        // Try to parse as single JSON
        jsonStrings.push(importText.trim());
      }

      const newCharacters: ProcessedCharacter[] = [];

      for (const jsonString of jsonStrings) {
        try {
          const pathbuilderData: PathbuilderCharacter = JSON.parse(jsonString);
          
          if (!pathbuilderData.success || !pathbuilderData.build) {
            throw new Error('Invalid Pathbuilder export format');
          }

          const processedCharacter = processPathbuilderCharacter(pathbuilderData);
          
          // Check for duplicates
          const exists = characters.some(c => c.name === processedCharacter.name);
          if (!exists) {
            newCharacters.push(processedCharacter);
          }
        } catch (error) {
          console.error('Error parsing character:', error);
          throw new Error(`Failed to parse character: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (newCharacters.length === 0) {
        setImportError('No new characters found (duplicates skipped)');
      } else {
        // Use addCharacter for each new character
        newCharacters.forEach(character => addCharacter(character));
        setImportSuccess(`Successfully imported ${newCharacters.length} character(s): ${newCharacters.map(c => c.name).join(', ')}`);
        setImportText('');
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    removeCharacter(characterId);
  };

  const handleRoll = (modifier: number, skillName: string, characterName: string) => {
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const total = d20Roll + modifier;
    
    // Determine if it's a critical success/failure
    const isCritSuccess = d20Roll === 20;
    const isCritFailure = d20Roll === 1;
    
    let color = 'blue';
    let title = `${characterName} - ${skillName}`;
    
    if (isCritSuccess && preferences.diceRolls.showCriticals) {
      color = 'green';
      title += ' NAT 20';
    } else if (isCritFailure && preferences.diceRolls.showCriticals) {
      color = 'red';
      title += ' NAT 1';
    }
    
    notifications.show({
      id: `roll-${Date.now()}`,
      title,
      message: (
        <Group gap="xs" align="center">
          <IconDice size={20} />
          <Text size="sm">
            <Text span fw={700} size="lg">🎲</Text>
            {' '}
            <Text span fw={700} c={d20Roll === 20 ? 'green' : d20Roll === 1 ? 'red' : undefined} size="lg">
              {d20Roll}
            </Text>
            {modifier !== 0 && preferences.diceRolls.showBreakdown && (
              <>
                <Text span size="sm"> + </Text>
                <Text span fw={600} size="md">{modifier}</Text>
              </>
            )}
            <Text span size="sm"> = </Text>
            <Text span fw={700} size="xl" c={isCritSuccess ? 'green' : isCritFailure ? 'red' : 'blue'}>
              {total}
            </Text>
          </Text>
        </Group>
      ),
      color,
      autoClose: preferences.notifications.duration,
      withCloseButton: true,
      withBorder: true,
      radius: 'md',
      position: preferences.notifications.position,
    });
  };

  const getProficiencyColor = (proficiency: number): string => {
    if (proficiency >= 8) return 'violet';
    if (proficiency >= 6) return 'blue';
    if (proficiency >= 4) return 'green';
    if (proficiency >= 2) return 'yellow';
    return 'gray';
  };

  return (
    <Paper p="xl" shadow="sm" className={styles.container}>
      <Stack gap="xl">
        <Group justify="center">
          <IconUser size={32} />
          <Text size="xl" fw={700}>Character Manager</Text>
        </Group>

        {/* Import Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={600}>Import Characters from Pathbuilder</Text>
            <Text size="sm" c="dimmed">
              Paste the JSON export from Pathbuilder 2e below. You can paste multiple characters (one per line).
            </Text>
            
            <Textarea
              placeholder="Paste your Pathbuilder JSON export here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
              disabled={isImporting}
            />

            {importError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" title="Import Error">
                {importError}
              </Alert>
            )}

            {importSuccess && (
              <Alert icon={<IconCheck size={16} />} color="green" title="Import Successful">
                {importSuccess}
              </Alert>
            )}
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleImport}
                loading={isImporting}
                disabled={!importText.trim()}
              >
                Import Character(s)
              </Button>
          </Stack>
        </Card>

        {/* Characters List */}
        {characters.length > 0 && (
          <>
            <Divider label={`${characters.length} Character(s) Loaded`} labelPosition="center" />
            <ScrollArea h={900}>
              <Grid>
                {characters.map((character) => (
                  <Grid.Col key={character.id} span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.characterCard}>
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                          <Stack gap="xs">
                            <Text fw={700} size="lg">{character.name}</Text>
                            <Group gap="xs">
                              <Badge variant="default">
                                Level {character.level} {character.class} {character.ancestry}
                              </Badge>
                            </Group>
                          </Stack>
                          <Button
                            size="xs"
                            color="red"
                            variant="filled"
                            onClick={() => handleRemoveCharacter(character.id)}
                          >
                            <IconTrash size={14} />
                          </Button>
                        </Group>

                        {/* Ability Scores */}
                        <div>
                          <Text size="sm" fw={600} mb="xs">Ability Scores</Text>
                          <Group gap="xs">
                            {Object.entries(character.abilities).filter(([key]) => key !== 'breakdown').map(([ability, score]) => (
                              <Badge key={ability} variant="default" size="sm">
                                {ability.toUpperCase()}: {String(score)}
                              </Badge>
                            ))}
                          </Group>
                        </div>

                        {/* Key Stats */}
                        <div>
                          <Text size="sm" fw={600} mb="xs">Key Stats</Text>
                          <Group gap="xs">
                            <Badge variant="default">AC: {character.ac}</Badge>
                            <Badge variant="default">HP: {character.hp}</Badge>
                          </Group>
                        </div>

                        {/* Saving Throws */}
                        <div>
                          <Text size="sm" fw={600} mb="xs">Saving Throws</Text>
                          <Group gap="xs">
                            {character.saves.map((save) => (
                              <Tooltip
                                key={save.name}
                                label={`DC: ${10 + save.total} | ${save.ability} ${save.abilityMod > 0 ? '+' : ''}${save.abilityMod} + Prof ${save.profBonus}`}
                                withArrow
                                position="top"
                                events={{ hover: true, focus: false, touch: false }}
                              >
                                <Badge 
                                  color={getProficiencyColor(save.proficiency)}
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRoll(save.total, save.name, character.name);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {save.name}: {save.total > 0 && '+'}{save.total}
                                </Badge>
                              </Tooltip>
                            ))}
                          </Group>
                        </div>

                        {/* Attacks */}
                        {character.attacks.length > 0 && (
                          <div>
                            <Text size="sm" fw={600} mb="xs">Attack Bonuses</Text>
                            <Group gap="xs">
                              {character.attacks.map((attack) => (
                                <Tooltip
                                  key={attack.name}
                                  label={`Attack Roll: d20 + ${attack.total}`}
                                  withArrow
                                  position="top"
                                  events={{ hover: true, focus: false, touch: false }}
                                >
                                  <Badge 
                                    color={getProficiencyColor(attack.proficiency)}
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRoll(attack.total, `${attack.name} Attack`, character.name);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {attack.name}: {attack.total > 0 && '+'}{attack.total}
                                  </Badge>
                                </Tooltip>
                              ))}
                            </Group>
                          </div>
                        )}

                        {/* Skills */}
                        <div>
                          <Text size="sm" fw={600} mb="xs">Skills</Text>
                          <Group gap="xs">
                            {character.skills
                              .map((skill) => (
                                <Tooltip
                                  key={skill.name}
                                  label={`DC: ${10 + skill.total} | ${skill.ability} ${skill.abilityMod > 0 ? '+' : ''}${skill.abilityMod} + Prof ${skill.profBonus}`}
                                  withArrow
                                  position="top"
                                  events={{ hover: true, focus: false, touch: false }}
                                >
                                  <Badge 
                                    color={getProficiencyColor(skill.proficiency)}
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRoll(skill.total, skill.name, character.name);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {skill.name}: {skill.total > 0 && '+'}{skill.total}
                                  </Badge>
                                </Tooltip>
                              ))}
                          </Group>
                        </div>

                        {/* Spellcasting */}
                        {character.spellcasting.length > 0 && (
                          <div>
                            <Text size="sm" fw={600} mb="xs">Spellcasting</Text>
                            <Group gap="xs">
                              {character.spellcasting.map((casting) => (
                                <Tooltip
                                  key={casting.name}
                                  label={`Spell Attack: d20 + ${casting.attackBonus} | Save DC: ${casting.dc}`}
                                  withArrow
                                  position="top"
                                  events={{ hover: true, focus: false, touch: false }}
                                >
                                  <Badge 
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRoll(casting.attackBonus, `${casting.tradition} Spell Attack`, character.name);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {casting.tradition} DC {casting.dc}
                                  </Badge>
                                </Tooltip>
                              ))}
                            </Group>
                          </div>
                        )}
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </ScrollArea>
          </>
        )}

        {characters.length === 0 && (
          <Text ta="center" c="dimmed" size="lg" py="xl">
            No characters imported yet. Import your first character from Pathbuilder!
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
