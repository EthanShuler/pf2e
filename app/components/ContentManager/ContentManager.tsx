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
  IconPlus,
  IconLink
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
import { useContent } from '../../hooks/useContent';
import styles from './ContentManager.module.css';

export function ContentManager() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [slideshowWindow, setSlideshowWindow] = useState<Window | null>(null);

  const { content, addContent, addMultipleContent, removeContent, getImageContent, getVideoContent } = useContent();

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
        addMultipleContent(newImages);
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

    addContent(videoContent);
    setSuccess('YouTube video added successfully');
    setYoutubeUrl('');
  };

  const handleImageUrlAdd = () => {
    setError(null);
    setSuccess(null);

    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    // Check if URL looks like an image
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const isImageUrl = imageExtensions.test(imageUrl) || imageUrl.includes('imgur') || imageUrl.includes('i.redd.it');
    
    if (!isImageUrl) {
      setError('URL does not appear to be an image. Supported formats: JPG, PNG, GIF, WebP, SVG, BMP');
      return;
    }

    // Test if the image can be loaded
    const testImage = document.createElement('img');
    testImage.onload = () => {
      const imageContent: ImageContent = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `Image from URL`,
        type: 'image',
        url: imageUrl,
        thumbnail: imageUrl,
        createdAt: new Date(),
      };

      addContent(imageContent);
      setSuccess('Image from URL added successfully');
      setImageUrl('');
    };
    
    testImage.onerror = () => {
      setError('Could not load image from URL. Please check the URL and try again.');
    };
    
    testImage.src = imageUrl;
  };

  const handleRemoveContent = (contentId: string) => {
    removeContent(contentId);
  };

  const startSlideshow = (startIndex: number = 0) => {
    const images = getImageContent();
    if (images.length === 0) return;

    setSlideshowMode(true);
    setCurrentSlideIndex(startIndex);
    setZoomLevel(1);
  };

  const startSlideshowInNewWindow = (startIndex: number = 0) => {
    const images = getImageContent();
    if (images.length === 0) return;

    // Close existing slideshow window if open
    if (slideshowWindow && !slideshowWindow.closed) {
      slideshowWindow.close();
    }

    // Create slideshow HTML content
    const slideshowHTML = createSlideshowHTML(images, startIndex);
    
    // Open new window
    const newWindow = window.open('', '_blank', 'width=1200,height=800,resizable=yes,scrollbars=no,menubar=no,toolbar=no');
    
    if (newWindow) {
      newWindow.document.write(slideshowHTML);
      newWindow.document.close();
      setSlideshowWindow(newWindow);

      // Handle window close
      newWindow.addEventListener('beforeunload', () => {
        setSlideshowWindow(null);
      });
    }
  };

  const createSlideshowHTML = (images: ImageContent[], startIndex: number): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PF2e Content Slideshow</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: black;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          
          .slideshow-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .slide {
            display: none;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .slide.active {
            display: block;
          }
          
          .controls {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
            color: white;
            font-size: 16px;
          }
          
          .nav-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            padding: 15px 20px;
            cursor: pointer;
            border-radius: 5px;
            z-index: 100;
            transition: background 0.2s;
          }
          
          .nav-button:hover {
            background: rgba(255, 255, 255, 0.4);
          }
          
          .nav-button.prev {
            left: 20px;
          }
          
          .nav-button.next {
            right: 20px;
          }
          
          .zoom-controls {
            display: flex;
            gap: 10px;
            align-items: center;
          }
          
          .zoom-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
          }
          
          .zoom-btn:hover {
            background: rgba(255, 255, 255, 0.4);
          }
          
          .image-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div class="slideshow-container">
          <div class="controls">
            <div class="slide-counter">
              <span id="current-slide">1</span> / <span id="total-slides">${images.length}</span>
            </div>
            <div class="zoom-controls">
              <button class="zoom-btn" onclick="zoomOut()">-</button>
              <span id="zoom-level">100%</span>
              <button class="zoom-btn" onclick="zoomIn()">+</button>
              <button class="zoom-btn" onclick="resetZoom()">Reset</button>
            </div>
          </div>
          
          <div class="image-container">
            ${images.map((img, index) => `
              <img 
                class="slide ${index === startIndex ? 'active' : ''}" 
                src="${img.url}" 
                alt="${img.name}"
                id="slide-${index}"
              />
            `).join('')}
          </div>
          
          ${images.length > 1 ? `
            <button class="nav-button prev" onclick="prevSlide()">‹</button>
            <button class="nav-button next" onclick="nextSlide()">›</button>
          ` : ''}
        </div>
        
        <script>
          let currentIndex = ${startIndex};
          let zoomLevel = 1;
          const totalSlides = ${images.length};
          
          function showSlide(index) {
            document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
            const slide = document.getElementById('slide-' + index);
            if (slide) {
              slide.classList.add('active');
              slide.style.transform = 'scale(' + zoomLevel + ')';
            }
            document.getElementById('current-slide').textContent = index + 1;
          }
          
          function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            zoomLevel = 1;
            updateZoomDisplay();
            showSlide(currentIndex);
          }
          
          function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            zoomLevel = 1;
            updateZoomDisplay();
            showSlide(currentIndex);
          }
          
          function zoomIn() {
            zoomLevel = Math.min(zoomLevel + 0.25, 3);
            updateZoomDisplay();
            showSlide(currentIndex);
          }
          
          function zoomOut() {
            zoomLevel = Math.max(zoomLevel - 0.25, 0.25);
            updateZoomDisplay();
            showSlide(currentIndex);
          }
          
          function resetZoom() {
            zoomLevel = 1;
            updateZoomDisplay();
            showSlide(currentIndex);
          }
          
          function updateZoomDisplay() {
            document.getElementById('zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
          }
          
          // Keyboard navigation
          document.addEventListener('keydown', function(e) {
            switch(e.key) {
              case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
              case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
              case 'Escape':
                e.preventDefault();
                window.close();
                break;
              case '+':
              case '=':
                e.preventDefault();
                zoomIn();
                break;
              case '-':
                e.preventDefault();
                zoomOut();
                break;
              case '0':
                e.preventDefault();
                resetZoom();
                break;
            }
          });
          
          // Initialize
          updateZoomDisplay();
          showSlide(currentIndex);
        </script>
      </body>
      </html>
    `;
  };

  const nextSlide = () => {
    const images = getImageContent();
    setCurrentSlideIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const prevSlide = () => {
    const images = getImageContent();
    setCurrentSlideIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const images = getImageContent();
  const videos = getVideoContent();
  const currentImage = images[currentSlideIndex];

  // Keyboard navigation for slideshow
  useEffect(() => {
    if (!slideshowMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const images = getImageContent();
      
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
  }, [slideshowMode, getImageContent]);

  // Cleanup slideshow window on component unmount
  useEffect(() => {
    return () => {
      if (slideshowWindow && !slideshowWindow.closed) {
        slideshowWindow.close();
      }
    };
  }, [slideshowWindow]);

  return (
    <Paper p="xl" shadow="sm" className={styles.container}>
      <Stack gap="xl">
        <Group justify="center">
          <IconPhoto size={32} />
          <Text size="xl" fw={700}>Content Manager</Text>
        </Group>

        {/* Upload Controls */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
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

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text size="lg" fw={600}>Add Image from URL</Text>
                <Stack gap="sm">
                  <TextInput
                    label="Image URL"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    leftSection={<IconLink size={16} />}
                  />
                  <Group>
                    <Button size="sm" onClick={handleImageUrlAdd}>
                      Add Image
                    </Button>
                    <Button 
                      size="sm" 
                      variant="subtle" 
                      onClick={() => setImageUrl('')}
                    >
                      Clear
                    </Button>
                  </Group>
                </Stack>
                <Text size="xs" c="dimmed">
                  Direct links to JPG, PNG, GIF, WebP, SVG, or BMP images
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
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
          <Alert color="limegreen" title="Success" onClose={() => setSuccess(null)} withCloseButton>
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
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => startSlideshowInNewWindow(0)}
                  variant="outline"
                >
                  Open in New Window
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
                              onContextMenu={(e) => {
                                e.preventDefault();
                                startSlideshowInNewWindow(images.findIndex(img => img.id === item.id));
                              }}
                              title="Click to view in slideshow, right-click to open in new window"
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
            No content added yet. Upload images, add image URLs, or link YouTube videos to get started!
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
