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
} from '@mantine/core';
import { IconUpload, IconUser, IconAlertCircle, IconCheck, IconTrash } from '@tabler/icons-react';
import { PathbuilderCharacter, ProcessedCharacter } from '../../types/character';
import { processPathbuilderCharacter } from '../../utils/characterProcessor';
import classes from './CharacterManager.module.css';

interface CharacterManagerProps {
  characters: ProcessedCharacter[];
  onCharactersUpdate: (characters: ProcessedCharacter[]) => void;
}

export function CharacterManager({ characters, onCharactersUpdate }: CharacterManagerProps) {
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

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
        onCharactersUpdate([...characters, ...newCharacters]);
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
    const updatedCharacters = characters.filter(c => c.id !== characterId);
    onCharactersUpdate(updatedCharacters);
  };

  const getProficiencyColor = (proficiency: number): string => {
    if (proficiency >= 8) return 'violet';
    if (proficiency >= 6) return 'blue';
    if (proficiency >= 4) return 'green';
    if (proficiency >= 2) return 'yellow';
    return 'gray';
  };

  return (
    <Paper p="xl" shadow="sm" className={classes.container}>
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

            <Group>
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleImport}
                loading={isImporting}
                disabled={!importText.trim()}
              >
                Import Character(s)
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Characters List */}
        {characters.length > 0 && (
          <>
            <Divider label={`${characters.length} Character(s) Loaded`} labelPosition="center" />
            <ScrollArea h={400}>
              <Grid>
                {characters.map((character) => (
                  <Grid.Col key={character.id} span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.characterCard}>
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                          <Stack gap="xs">
                            <Text fw={700} size="lg">{character.name}</Text>
                            <Group gap="xs">
                              <Badge color="blue" variant="light">
                                Level {character.level} {character.class}
                              </Badge>
                            </Group>
                          </Stack>
                          <Button
                            size="xs"
                            color="red"
                            variant="subtle"
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
                              <Badge key={ability} variant="outline" size="sm">
                                {ability.toUpperCase()}: {String(score)}
                              </Badge>
                            ))}
                          </Group>
                        </div>

                        {/* Key Stats */}
                        <div>
                          <Text size="sm" fw={600} mb="xs">Key Stats</Text>
                          <Group gap="xs">
                            <Badge color="red" variant="light">AC: {character.ac}</Badge>
                            <Badge color="green" variant="light">HP: {character.hp}</Badge>
                          </Group>
                        </div>

                        {/* Top Skills */}
                        <div>
                          <Text size="sm" fw={600} mb="xs">Top Skills</Text>
                          <Group gap="xs">
                            {character.skills
                              .filter(skill => skill.proficiency > 0)
                              .sort((a, b) => b.total - a.total)
                              .slice(0, 3)
                              .map((skill) => (
                                <Badge 
                                  key={skill.name} 
                                  color={getProficiencyColor(skill.proficiency)}
                                  variant="light"
                                  size="sm"
                                >
                                  {skill.name}: +{skill.total}
                                </Badge>
                              ))}
                          </Group>
                        </div>

                        {/* Spellcasting */}
                        {character.spellcasting.length > 0 && (
                          <div>
                            <Text size="sm" fw={600} mb="xs">Spellcasting</Text>
                            <Group gap="xs">
                              {character.spellcasting.map((casting) => (
                                <Badge 
                                  key={casting.name} 
                                  color="purple" 
                                  variant="light"
                                  size="sm"
                                >
                                  {casting.tradition} DC {casting.dc}
                                </Badge>
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
