'use client';

import { useState } from 'react';
import { DiceRoller } from './components/DiceRoller/DiceRoller';
import { CharacterManager } from './components/CharacterManager/CharacterManager';
import { ContentManager } from './components/ContentManager/ContentManager';
import { ProcessedCharacter } from './types/character';
import { ContentItem } from './types/content';
import { Tabs } from '@mantine/core';
import { IconDice, IconUser, IconPhoto } from '@tabler/icons-react';
import styles from "./page.module.css";

export default function Home() {
  const [characters, setCharacters] = useState<ProcessedCharacter[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Pathfinder 2e Game Manager</h1>
        <p className={styles.subtitle}>Roll Dice, Manager Characters, Display Content</p>
        
        <Tabs defaultValue="dice" className={styles.tabs}>
          <Tabs.List grow>
            <Tabs.Tab value="dice" leftSection={<IconDice size={16} />}>
              Dice Roller
            </Tabs.Tab>
            <Tabs.Tab value="characters" leftSection={<IconUser size={16} />}>
              Characters ({characters.length})
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconPhoto size={16} />}>
              Content ({content.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dice" pt="md">
            <DiceRoller characters={characters} />
          </Tabs.Panel>

          <Tabs.Panel value="characters" pt="md">
            <CharacterManager 
              characters={characters} 
              onCharactersUpdate={setCharacters}
            />
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <ContentManager 
              content={content} 
              onContentUpdate={setContent}
            />
          </Tabs.Panel>
        </Tabs>
      </main>
    </div>
  );
}
