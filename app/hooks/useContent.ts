'use client';

import { useLocalStorage } from '@mantine/hooks';
import { ContentItem, ImageContent, VideoContent } from '../types/content';

export function useContent() {
  const [content, setContent] = useLocalStorage<ContentItem[]>({
    key: 'pf2e-content',
    defaultValue: [],
    serialize: JSON.stringify,
    deserialize: (str) => {
      try {
        if (!str) return [];
        const parsed = JSON.parse(str);
        // Restore Date objects and handle File objects
        return parsed.map((item: ContentItem & { createdAt?: string }) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          // Note: File objects cannot be serialized, so we lose the original file
          // Users will need to re-upload if they need the file object
        }));
      } catch {
        return [];
      }
    },
  });

  const addContent = (contentItem: ContentItem) => {
    const newContent = {
      ...contentItem,
      createdAt: new Date(),
    };
    setContent((current) => [...current, newContent]);
  };

  const addMultipleContent = (contentItems: ContentItem[]) => {
    const newContent = contentItems.map(item => ({
      ...item,
      createdAt: new Date(),
    }));
    setContent((current) => [...current, ...newContent]);
  };

  const removeContent = (contentId: string) => {
    setContent((current) => current.filter(item => item.id !== contentId));
  };

  const updateContent = (contentId: string, updates: Partial<ContentItem>) => {
    setContent((current) => 
      current.map(item => 
        item.id === contentId 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const getContentById = (contentId: string) => {
    return content.find(item => item.id === contentId);
  };

  const getImageContent = (): ImageContent[] => {
    return content.filter((item): item is ImageContent => item.type === 'image');
  };

  const getVideoContent = (): VideoContent[] => {
    return content.filter((item): item is VideoContent => item.type === 'video');
  };

  const clearAllContent = () => {
    setContent([]);
  };

  return {
    content,
    setContent,
    addContent,
    addMultipleContent,
    removeContent,
    updateContent,
    getContentById,
    getImageContent,
    getVideoContent,
    clearAllContent,
  };
}