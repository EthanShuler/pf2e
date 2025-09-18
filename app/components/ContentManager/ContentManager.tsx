// TODO:
// Add drag + Drop for slideshow order
// Use separate page or display slideshow in new popout/window

'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  Text,
  Paper,
  Stack,
  TextInput,
  Alert,
  Grid,
  Card,
  Image,
  ActionIcon,
  Modal,
  Divider,
  FileInput,
  Tooltip,
  ScrollArea,
} from '@mantine/core';
import { 
  IconUpload, 
  IconPhoto, 
  IconVideo, 
  IconTrash, 
  IconEye, 
  IconZoomIn, 
  IconZoomOut,
  IconPlayerPlay,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconPlus
} from '@tabler/icons-react';
import { 
  ContentItem, 
  ImageContent, 
  VideoContent,
  extractYouTubeId,
  getYouTubeThumbnail,
  isValidImageFile,
  createImagePreview
} from '../../types/content';
import styles from './ContentManager.module.css';

interface ContentManagerProps {
  content: ContentItem[];
  onContentUpdate: (content: ContentItem[]) => void;
}

export function ContentManager({ content, onContentUpdate }: ContentManagerProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleImageUpload = async (files: File[] | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setSuccess(null);

    try {
      const newImages: ImageContent[] = [];

      for (const file of files) {
        if (!isValidImageFile(file)) {
          setError(`Invalid file type: ${file.name}`);
          continue;
        }

        const preview = await createImagePreview(file);
        const imageContent: ImageContent = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: 'image',
          url: preview,
          file,
          createdAt: new Date(),
          thumbnail: preview,
        };

        newImages.push(imageContent);
      }

      if (newImages.length > 0) {
        onContentUpdate([...content, ...newImages]);
        setSuccess(`Successfully uploaded ${newImages.length} image(s)`);
      }
    } catch (err) {
      setError('Failed to upload images');
      console.error('Image upload error:', err);
    }
  };

  const handleYouTubeAdd = () => {
    setError(null);
    setSuccess(null);

    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL format');
      return;
    }

    const videoContent: VideoContent = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `YouTube Video ${videoId}`,
      type: 'video',
      url: youtubeUrl,
      videoId,
      title: 'YouTube Video',
      thumbnail: getYouTubeThumbnail(videoId),
      createdAt: new Date(),
      autoplay: false,
      loop: true,
    };

    onContentUpdate([...content, videoContent]);
    setSuccess('YouTube video added successfully');
    setYoutubeUrl('');
  };

  const handleRemoveContent = (contentId: string) => {
    const updatedContent = content.filter(item => item.id !== contentId);
    onContentUpdate(updatedContent);
  };

  const startSlideshow = (startIndex: number = 0) => {
    const images = content.filter(item => item.type === 'image');
    if (images.length === 0) return;

    setSlideshowMode(true);
    setCurrentSlideIndex(startIndex);
    setZoomLevel(1);
  };

  const nextSlide = () => {
    const images = content.filter(item => item.type === 'image');
    setCurrentSlideIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const prevSlide = () => {
    const images = content.filter(item => item.type === 'image');
    setCurrentSlideIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const images = content.filter(item => item.type === 'image');
  const videos = content.filter(item => item.type === 'video');
  const currentImage = images[currentSlideIndex];

  // Keyboard navigation for slideshow
  useEffect(() => {
    if (!slideshowMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const images = content.filter(item => item.type === 'image');
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentSlideIndex((prev) => (prev - 1 + images.length) % images.length);
          setZoomLevel(1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentSlideIndex((prev) => (prev + 1) % images.length);
          setZoomLevel(1);
          break;
        case 'Escape':
          e.preventDefault();
          setSlideshowMode(false);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoomLevel(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          e.preventDefault();
          setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
          break;
        case '0':
          e.preventDefault();
          setZoomLevel(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [slideshowMode, content]);

  return (
    <Paper p="xl" shadow="sm" className={styles.container}>
      <Stack gap="xl">
        <Group justify="center">
          <IconPhoto size={32} />
          <Text size="xl" fw={700}>Content Manager</Text>
        </Group>

        {/* Upload Controls */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text size="lg" fw={600}>Upload Images</Text>
                <FileInput
                  label="Select images"
                  placeholder="Choose image files..."
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  leftSection={<IconUpload size={16} />}
                />
                <Text size="xs" c="dimmed">
                  Supports: JPEG, PNG, GIF, WebP
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text size="lg" fw={600}>Add YouTube Video</Text>
                  <Stack gap="sm">
                    <TextInput
                      label="YouTube URL"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      leftSection={<IconVideo size={16} />}
                    />
                    <Group>
                      <Button size="sm" onClick={handleYouTubeAdd}>
                        Add Video
                      </Button>
                      <Button 
                        size="sm" 
                        variant="subtle" 
                        onClick={() => {
                          setYoutubeUrl('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Status Messages */}
        {error && (
          <Alert color="red" title="Error" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" title="Success" onClose={() => setSuccess(null)} withCloseButton>
            {success}
          </Alert>
        )}

        {/* Content Display */}
        {content.length > 0 && (
          <>
            <Divider 
              label={`${content.length} Content Item(s) - ${images.length} Images, ${videos.length} Videos`} 
              labelPosition="center" 
            />

            {/* Slideshow Controls */}
            {images.length > 0 && (
              <Group justify="center">
                <Button
                  leftSection={<IconEye size={16} />}
                  onClick={() => startSlideshow(0)}
                  variant="default"
                >
                  Start Slideshow ({images.length} images)
                </Button>
              </Group>
            )}

            {/* Content Grid */}
            <ScrollArea h={500}>
              <Grid>
                {content.map((item) => (
                  <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card shadow="sm" padding="md" radius="md" withBorder className={styles.contentCard}>
                      <Stack gap="sm">
                        {/* Thumbnail */}
                        <div className={styles.thumbnailContainer}>
                          {item.type === 'image' ? (
                            <Image
                              src={item.thumbnail || item.url}
                              alt={item.name}
                              fit="cover"
                              className={styles.thumbnail}
                              onClick={() => startSlideshow(images.findIndex(img => img.id === item.id))}
                            />
                          ) : (
                            <div 
                              className={styles.videoThumbnail}
                              onClick={() => setSelectedContent(item)}
                            >
                              <Image
                                src={item.thumbnail}
                                alt={item.name}
                                fit="cover"
                                className={styles.thumbnail}
                              />
                              <div className={styles.playButton}>
                                <IconPlayerPlay size={24} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <Group justify="space-between">
                          <ActionIcon
                            color="red"
                            variant="filled"
                            onClick={() => handleRemoveContent(item.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </ScrollArea>
          </>
        )}

        {content.length === 0 && (
          <Text ta="center" c="dimmed" size="lg" py="xl">
            No content uploaded yet. Add some images or YouTube videos to get started!
          </Text>
        )}
      </Stack>

      {/* Slideshow Modal */}
      <Modal
        opened={slideshowMode && !!currentImage}
        onClose={() => setSlideshowMode(false)}
        size="100%"
        padding={0}
        withCloseButton={false}
        classNames={{ content: styles.slideshowModal }}
        
      >
        {currentImage && (
          <div className={styles.slideshowContainer}>
            {/* Controls Overlay */}
            <div className={styles.slideshowControls}>
              <Group justify="space-between" w="100%">
                <Group>
                  <ActionIcon
                    color="white"
                    variant="subtle"
                    onClick={() => setSlideshowMode(false)}
                  >
                    <IconX size={20} />
                  </ActionIcon>
                  <Text c="white" size="sm">
                    {currentSlideIndex + 1} / {images.length}
                  </Text>
                </Group>

                <Group>
                  <Tooltip label="Zoom Out">
                    <ActionIcon
                      color="white"
                      variant="subtle"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.25}
                    >
                      <IconZoomOut size={20} />
                    </ActionIcon>
                  </Tooltip>
                  <Text c="white" size="sm">
                    {Math.round(zoomLevel * 100)}%
                  </Text>
                  <Tooltip label="Zoom In">
                    <ActionIcon
                      color="white"
                      variant="subtle"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                    >
                      <IconZoomIn size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </div>

            {/* Image Display */}
            <div className={styles.imageContainer}>
              <Image
                src={currentImage.url}
                alt={currentImage.name}
                fit="contain"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease'
                }}
                className={styles.slideshowImage}
              />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <ActionIcon
                  className={styles.navButton + ' ' + styles.navLeft}
                  color="white"
                  variant="subtle"
                  onClick={prevSlide}
                  size="xl"
                >
                  <IconChevronLeft size={32} />
                </ActionIcon>
                <ActionIcon
                  className={styles.navButton + ' ' + styles.navRight}
                  color="white"
                  variant="subtle"
                  onClick={nextSlide}
                  size="xl"
                >
                  <IconChevronRight size={32} />
                </ActionIcon>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Video Modal */}
      <Modal
        opened={!!selectedContent && selectedContent.type === 'video'}
        onClose={() => setSelectedContent(null)}
        size="xl"
        title={selectedContent?.name}
      >
        {selectedContent?.type === 'video' && (
          <div className={styles.videoContainer}>
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${(selectedContent as VideoContent).videoId}?autoplay=1&loop=1&playlist=${(selectedContent as VideoContent).videoId}`}
              title={selectedContent.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </Paper>
  );
}
