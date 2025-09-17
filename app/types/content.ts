export interface ContentItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  createdAt: Date;
  tags?: string[];
}

export interface ImageContent extends ContentItem {
  type: 'image';
  file?: File;
  width?: number;
  height?: number;
}

export interface VideoContent extends ContentItem {
  type: 'video';
  videoId: string;
  title: string;
  duration?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export type ContentCollection = (ImageContent | VideoContent)[];

// Helper function to extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to get YouTube thumbnail
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Helper function to validate image file
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// Helper function to create object URL for image preview
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
