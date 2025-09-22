'use client';

import { ActionIcon, useComputedColorScheme, useMantineColorScheme, Tooltip } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  const handleToggle = () => {
    setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light');
  };

  const getIcon = () => {
    return computedColorScheme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />;
  };

  const getTooltipText = () => {
    return computedColorScheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  };

  return (
    <Tooltip label={getTooltipText()} position="top">
      <ActionIcon
        onClick={handleToggle}
        variant="default"
        size="lg"
        aria-label="Toggle color scheme"
        className={styles.toggle}
      >
        {getIcon()}
      </ActionIcon>
    </Tooltip>
  );
}