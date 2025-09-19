'use client';

import { DiceRoller } from './components/DiceRoller/DiceRoller';
import { CharacterManager } from './components/CharacterManager/CharacterManager';
import { ContentManager } from './components/ContentManager/ContentManager';
import { SettingsManager } from './components/SettingsManager/SettingsManager';
import { GMNotesManager } from './components/GMNotesManager/GMNotesManager';
import { useCharacters } from './hooks/useCharacters';
import { useContent } from './hooks/useContent';
import { useGMNotes } from './hooks/useGMNotes';
import { Tabs } from '@mantine/core';
import { IconDice5, IconUser, IconPhoto, IconSettings, IconNotes } from '@tabler/icons-react';
import styles from "./page.module.css";

export default function Home() {
  const { characters } = useCharacters();
  const { content } = useContent();
  const { notes } = useGMNotes();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Pathfinder 2e Game Manager</h1>
        
        <Tabs defaultValue="dice" className={styles.tabs}>
          <Tabs.List grow>
            <Tabs.Tab value="dice" leftSection={<IconDice5 size={16} />}>
              Dice Roller
            </Tabs.Tab>
            <Tabs.Tab value="characters" leftSection={<IconUser size={16} />}>
              Characters ({characters.length})
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconPhoto size={16} />}>
              Content ({content.length})
            </Tabs.Tab>
            <Tabs.Tab value="notes" leftSection={<IconNotes size={16} />}>
              GM Notes ({notes.length})
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dice" pt="md">
            <DiceRoller characters={characters} />
          </Tabs.Panel>

          <Tabs.Panel value="characters" pt="md">
            <CharacterManager />
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <ContentManager />
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="md">
            <GMNotesManager />
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <SettingsManager />
          </Tabs.Panel>
        </Tabs>
      </main>
    </div>
  );
}
