'use client';

import { useLocalStorage } from '@mantine/hooks';
import { ProcessedCharacter } from '../types/character';

export function useCharacters() {
  const [characters, setCharacters] = useLocalStorage<ProcessedCharacter[]>({
    key: 'pf2e-characters',
    defaultValue: [],
    serialize: JSON.stringify,
    deserialize: (str) => {
      try {
        if (!str) return [];
        const parsed = JSON.parse(str);
        // Ensure each character has required fields and restore Date objects
        return parsed.map((char: ProcessedCharacter & { createdAt?: string; updatedAt?: string }) => ({
          ...char,
          createdAt: char.createdAt ? new Date(char.createdAt) : new Date(),
          updatedAt: char.updatedAt ? new Date(char.updatedAt) : new Date(),
        }));
      } catch {
        return [];
      }
    },
  });

  const addCharacter = (character: ProcessedCharacter) => {
    const newCharacter = {
      ...character,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCharacters((current) => [...current, newCharacter]);
  };

  const removeCharacter = (characterId: string) => {
    setCharacters((current) => current.filter(char => char.id !== characterId));
  };

  const updateCharacter = (characterId: string, updates: Partial<ProcessedCharacter>) => {
    setCharacters((current) => 
      current.map(char => 
        char.id === characterId 
          ? { ...char, ...updates, updatedAt: new Date() }
          : char
      )
    );
  };

  const getCharacterById = (characterId: string) => {
    return characters.find(char => char.id === characterId);
  };

  const clearAllCharacters = () => {
    setCharacters([]);
  };

  return {
    characters,
    setCharacters,
    addCharacter,
    removeCharacter,
    updateCharacter,
    getCharacterById,
    clearAllCharacters,
  };
}