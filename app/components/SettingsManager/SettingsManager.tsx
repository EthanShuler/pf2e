'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  Text,
  Paper,
  Stack,
  Textarea,
  Alert,
  Modal,
  Divider,
  Badge,
  FileInput,
  Card,
} from '@mantine/core';
import { 
  IconSettings, 
  IconDownload, 
  IconUpload, 
  IconTrash, 
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconFile,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCharacters } from '../../hooks/useCharacters';
import { useContent } from '../../hooks/useContent';
import { useGMNotes, GMNote } from '../../hooks/useGMNotes';
import { ProcessedCharacter } from '../../types/character';
import { ContentItem } from '../../types/content';

interface ExportData {
  version: string;
  timestamp: string;
  characters: ProcessedCharacter[];
  content: ContentItem[];
  gmNotes: GMNote[];
}

export function SettingsManager() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [exportData, setExportData] = useState('');

  const { characters, clearAllCharacters } = useCharacters();
  const { content, clearAllContent } = useContent();
  const { notes: gmNotes, clearAllNotes } = useGMNotes();

  const generateExportData = (): ExportData => {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      characters,
      content,
      gmNotes,
    };
  };

  const handleExportData = () => {
    const data = generateExportData();
    setExportData(JSON.stringify(data, null, 2));
    setExportModalOpen(true);
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pf2e-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    notifications.show({
      title: 'Export Complete',
      message: 'Data exported successfully',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleFileImport = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
      setImportModalOpen(true);
    };
    reader.readAsText(file);
  };

  const handleImportData = () => {
    try {
      const data: ExportData = JSON.parse(importText);
      
      // Validate the data structure
      if (!data.version || !data.characters || !data.content || !data.gmNotes) {
        throw new Error('Invalid export format');
      }

      // For now, just show a warning that this would import data
      // In a real implementation, you'd restore the data to localStorage
      notifications.show({
        title: 'Import Note',
        message: 'Import functionality would restore data from backup. Implementation requires careful state management.',
        color: 'blue',
        icon: <IconCheck size={16} />,
        autoClose: 8000,
      });
      
      setImportModalOpen(false);
      setImportText('');
    } catch {
      notifications.show({
        title: 'Import Failed',
        message: 'Failed to import data. Please check the format.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleClearAllData = () => {
    clearAllCharacters();
    clearAllContent();
    clearAllNotes();
    setClearDataModalOpen(false);
    
    notifications.show({
      title: 'Data Cleared',
      message: 'All data has been cleared.',
      color: 'orange',
      icon: <IconTrash size={16} />,
    });
  };

  const getStorageUsage = () => {
    try {
      const used = JSON.stringify(localStorage).length;
      const usedKB = Math.round(used / 1024);
      const totalKB = 5120; // 5MB typical limit
      const percentage = Math.round((used / (totalKB * 1024)) * 100);
      
      return { used: usedKB, total: totalKB, percentage };
    } catch {
      return { used: 0, total: 5120, percentage: 0 };
    }
  };

  const storageInfo = getStorageUsage();

  return (
    <Paper p="xl" shadow="sm">
      <Stack gap="xl">
        <Group justify="center">
          <IconSettings size={32} />
          <Text size="xl" fw={700}>Data Management</Text>
        </Group>

        {/* Storage Info */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={600} mb="md">Storage Information</Text>
          <Group>
            <Badge variant="light">
              Characters: {characters.length}
            </Badge>
            <Badge variant="light">
              Content: {content.length}
            </Badge>
            <Badge variant="light">
              GM Notes: {gmNotes.length}
            </Badge>
            <Badge variant="light">
              Used: {storageInfo.used} KB
            </Badge>
            <Badge variant="light">
              Total: {storageInfo.total} KB
            </Badge>
            <Badge variant="light" color={storageInfo.percentage > 80 ? 'red' : storageInfo.percentage > 60 ? 'orange' : 'green'}>
              {storageInfo.percentage}% Used
            </Badge>
          </Group>
        </Card>

        {/* Data Management */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={600} mb="md">Data Management</Text>
          <Stack gap="md">
            <Group>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={handleExportData}
                variant="default"
              >
                Export Data
              </Button>
              <FileInput
                placeholder="Import from file..."
                leftSection={<IconFile size={16} />}
                accept=".json"
                onChange={handleFileImport}
                w={200}
              />
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={() => setImportModalOpen(true)}
                variant="default"
              >
                Import from Text
              </Button>
            </Group>
            <Divider />
            <Group>
              <Button
                leftSection={<IconTrash size={16} />}
                onClick={() => setClearDataModalOpen(true)}
                color="red"
                variant="light"
              >
                Clear All Data
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Data"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Copy this JSON data to backup your characters, content, and preferences:
          </Text>
          <Textarea
            value={exportData}
            readOnly
            rows={12}
            autosize
            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
          />
          <Group justify="flex-end">
            <Button onClick={handleDownloadExport} leftSection={<IconDownload size={16} />}>
              Download as File
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Import Modal */}
      <Modal
        opened={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Data"
        size="lg"
      >
        <Stack gap="md">
          <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
            Warning: This will overwrite your existing data. Make sure to export your current data first!
          </Alert>
          <Text size="sm" c="dimmed">
            Paste the exported JSON data here:
          </Text>
          <Textarea
            value={importText}
            onChange={(event) => setImportText(event.currentTarget.value)}
            placeholder="Paste JSON data here..."
            rows={8}
            autosize
            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportData} 
              disabled={!importText.trim()}
              leftSection={<IconUpload size={16} />}
            >
              Import Data
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Clear Data Confirmation Modal */}
      <Modal
        opened={clearDataModalOpen}
        onClose={() => setClearDataModalOpen(false)}
        title="Clear All Data"
        centered
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={16} />}>
            This action cannot be undone! All your characters, content, and preferences will be permanently deleted.
          </Alert>
          <Text size="sm">
            Are you sure you want to clear all data? Consider exporting your data first.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setClearDataModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleClearAllData}>
              Clear All Data
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}