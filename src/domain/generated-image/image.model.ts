export type GeneratedImage = {
  id: string;
  prompt: string;
  style: Style;
  orientation: Orientation;
  images: Image[];
  userId: string;
  createdAt: string;
  generationTaskId: string;
  generationStatus: GenerationStatus;
}

export type Style = 'photo' | 'illustration';

export type Orientation = 'landscape' | 'portrait';

export type Image = {
  id: string;
  url: string;
};

export type GenerationStatus = 'idle' | 'processing' | 'completed' | 'failed';