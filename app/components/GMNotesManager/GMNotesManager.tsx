'use client';

import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Select,
  Grid,
  Card,
  ActionIcon,
  Modal,
  Badge,
  Divider,
  ScrollArea,
  Alert,
} from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  IconNotes,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconCalendar,
  IconTag,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useGMNotes, GMNote } from '../../hooks/useGMNotes';

export function GMNotesManager() {
  const [selectedNote, setSelectedNote] = useState<GMNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<GMNote | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GMNote['category']>('session');
  const [newTags, setNewTags] = useState('');

  const { notes, addNote, updateNote, removeNote, searchNotes } = useGMNotes();

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: selectedNote?.content || '<p>Start writing your GM notes...</p>',
    immediatelyRender: false,
  });

  // Update editor content when selected note changes
  React.useEffect(() => {
    if (editor && selectedNote) {
      editor.commands.setContent(selectedNote.content);
    }
  }, [selectedNote, editor]);

  const handleCreateNote = () => {
    if (!newTitle.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a title for the note',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    const content = editor?.getHTML() || '<p></p>';
    const tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const note = addNote({
      title: newTitle,
      content,
      category: newCategory,
      tags: tags.length > 0 ? tags : undefined,
    });

    setSelectedNote(note);
    setIsCreating(false);
    setIsEditing(false);
    setNewTitle('');
    setNewTags('');
    
    notifications.show({
      title: 'Note Created',
      message: `"${note.title}" has been saved`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleUpdateNote = () => {
    if (!selectedNote) return;

    const content = editor?.getHTML() || selectedNote.content;
    
    updateNote(selectedNote.id, {
      content,
    });

    setIsEditing(false);
    
    notifications.show({
      title: 'Note Updated',
      message: `"${selectedNote.title}" has been saved`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleDeleteNote = () => {
    if (!noteToDelete) return;

    removeNote(noteToDelete.id);
    
    if (selectedNote?.id === noteToDelete.id) {
      setSelectedNote(null);
    }
    
    setDeleteModalOpen(false);
    setNoteToDelete(null);
    
    notifications.show({
      title: 'Note Deleted',
      message: `"${noteToDelete.title}" has been deleted`,
      color: 'orange',
      icon: <IconTrash size={16} />,
    });
  };

  const startNewNote = () => {
    setIsCreating(true);
    setIsEditing(true);
    setSelectedNote(null);
    setNewTitle('');
    setNewCategory('session');
    setNewTags('');
    editor?.commands.setContent('<p>Start writing your GM notes...</p>');
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setIsEditing(false);
    if (selectedNote) {
      editor?.commands.setContent(selectedNote.content);
    }
  };

  const filteredNotes = () => {
    let filtered = notes;
    
    if (searchQuery) {
      filtered = searchNotes(searchQuery);
    }
    
    if (filterCategory) {
      filtered = filtered.filter(note => note.category === filterCategory);
    }
    
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const getCategoryColor = (category: GMNote['category']) => {
    switch (category) {
      case 'session': return 'blue';
      case 'campaign': return 'purple';
      case 'npc': return 'green';
      case 'location': return 'orange';
      case 'plot': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Paper p="xl" shadow="sm">
      <Stack gap="xl">
        <Group justify="center">
          <IconNotes size={32} />
          <Text size="xl" fw={700}>GM Notes</Text>
        </Group>

        <Grid>
          {/* Notes List */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h={600}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="lg" fw={600}>Notes ({notes.length})</Text>
                  <Button size="xs" leftSection={<IconPlus size={14} />} onClick={startNewNote}>
                    New Note
                  </Button>
                </Group>

                <TextInput
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftSection={<IconSearch size={16} />}
                />

                <Select
                  placeholder="Filter by category"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  data={[
                    { value: 'session', label: 'Session Notes' },
                    { value: 'campaign', label: 'Campaign' },
                    { value: 'npc', label: 'NPCs' },
                    { value: 'location', label: 'Locations' },
                    { value: 'plot', label: 'Plot' },
                    { value: 'other', label: 'Other' },
                  ]}
                  clearable
                />

                <Divider />

                <ScrollArea h={400}>
                  <Stack gap="xs">
                    {filteredNotes().map((note) => (
                      <Card
                        key={note.id}
                        shadow="xs"
                        padding="sm"
                        radius="md"
                        withBorder
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedNote?.id === note.id ? 'var(--mantine-color-blue-9)' : undefined
                        }}
                        onClick={() => {
                          setSelectedNote(note);
                          setIsCreating(false);
                          setIsEditing(false);
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between" align="flex-start">
                            <Text size="sm" fw={600} lineClamp={2}>
                              {note.title}
                            </Text>
                            <ActionIcon
                              size="xs"
                              color="red"
                              variant="filled"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNoteToDelete(note);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Group>
                          
                          <Group gap="xs">
                            <Badge size="xs" color={getCategoryColor(note.category)}>
                              {note.category}
                            </Badge>
                            {note.tags?.map(tag => (
                              <Badge key={tag} size="xs" variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </Group>
                          
                          <Text size="xs" c="dimmed">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                    
                    {filteredNotes().length === 0 && (
                      <Text ta="center" c="dimmed" py="xl">
                        {searchQuery || filterCategory ? 'No matching notes found' : 'No notes yet. Create your first note!'}
                      </Text>
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Editor */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h={600}>
              <Stack gap="md" h="100%">
                {(selectedNote || isCreating) && (
                  <>
                    <Group justify="space-between">
                      <Group>
                        {isCreating ? (
                          <TextInput
                            placeholder="Note title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            size="lg"
                            fw={600}
                            variant="unstyled"
                            w={300}
                          />
                        ) : (
                          <Text size="lg" fw={600}>{selectedNote?.title}</Text>
                        )}
                      </Group>
                      
                      <Group>
                        {isEditing ? (
                          <>
                            <Button size="xs" onClick={isCreating ? handleCreateNote : handleUpdateNote}>
                              <IconCheck size={14} />
                            </Button>
                            <Button size="xs" variant="subtle" onClick={cancelEdit}>
                              <IconX size={14} />
                            </Button>
                          </>
                        ) : (
                          <Button size="xs" leftSection={<IconEdit size={14} />} onClick={() => setIsEditing(true)}>
                            Edit
                          </Button>
                        )}
                      </Group>
                    </Group>

                    {isCreating && (
                      <Group>
                        <Select
                          value={newCategory}
                          onChange={(value) => setNewCategory(value as GMNote['category'])}
                          data={[
                            { value: 'session', label: 'Session Notes' },
                            { value: 'campaign', label: 'Campaign' },
                            { value: 'npc', label: 'NPCs' },
                            { value: 'location', label: 'Locations' },
                            { value: 'plot', label: 'Plot' },
                            { value: 'other', label: 'Other' },
                          ]}
                          w={150}
                        />
                        <TextInput
                          placeholder="Tags (comma separated)"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          leftSection={<IconTag size={16} />}
                          flex={1}
                        />
                      </Group>
                    )}

                    {!isCreating && selectedNote && (
                      <Group>
                        <Badge color={getCategoryColor(selectedNote.category)}>
                          {selectedNote.category}
                        </Badge>
                        {selectedNote.tags?.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="light" leftSection={<IconCalendar size={12} />}>
                          {new Date(selectedNote.updatedAt).toLocaleDateString()}
                        </Badge>
                      </Group>
                    )}

                    <Divider />
                  </>
                )}

                <div style={{ flex: 1 }}>
                  {selectedNote || isCreating ? (
                    <RichTextEditor editor={editor} style={{ height: '100%' }}>
                      <RichTextEditor.Toolbar sticky stickyOffset={60}>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Bold />
                          <RichTextEditor.Italic />
                          <RichTextEditor.Underline />
                          <RichTextEditor.Strikethrough />
                          <RichTextEditor.ClearFormatting />
                          <RichTextEditor.Highlight />
                          <RichTextEditor.Code />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.H1 />
                          <RichTextEditor.H2 />
                          <RichTextEditor.H3 />
                          <RichTextEditor.H4 />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Blockquote />
                          <RichTextEditor.Hr />
                          <RichTextEditor.BulletList />
                          <RichTextEditor.OrderedList />
                          <RichTextEditor.Subscript />
                          <RichTextEditor.Superscript />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Link />
                          <RichTextEditor.Unlink />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.AlignLeft />
                          <RichTextEditor.AlignCenter />
                          <RichTextEditor.AlignJustify />
                          <RichTextEditor.AlignRight />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Undo />
                          <RichTextEditor.Redo />
                        </RichTextEditor.ControlsGroup>
                      </RichTextEditor.Toolbar>

                      <RichTextEditor.Content 
                        style={{ 
                          minHeight: 400,
                          maxHeight: 400,
                          overflowY: 'auto'
                        }} 
                      />
                    </RichTextEditor>
                  ) : (
                    <Stack align="center" justify="center" h="100%">
                      <IconNotes size={64} color="var(--mantine-color-gray-4)" />
                      <Text size="lg" c="dimmed" ta="center">
                        Select a note to view and edit,<br />or create a new one to get started
                      </Text>
                      <Button leftSection={<IconPlus size={16} />} onClick={startNewNote}>
                        Create Note
                      </Button>
                    </Stack>
                  )}
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Note"
        centered
      >
        <Stack gap="md">
          <Alert color="red" title="Warning">
            This action cannot be undone. The note will be permanently deleted.
          </Alert>
          <Text size="sm">
            Are you sure you want to delete &ldquo;{noteToDelete?.title}&rdquo;?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteNote}>
              Delete Note
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}