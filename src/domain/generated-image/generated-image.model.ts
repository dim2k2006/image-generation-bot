export type GeneratedImage = {
  id: string;
  prompt: string;
  style: Style;
  orientation: Orientation;
  images: Image[];
  userId: string;
  chatId: string;
  createdAt: string;
  generationTaskId: string;
  generationStatus: GenerationStatus;
};

export type Style = 'photo' | 'illustration';

export type Orientation = 'vertical' | 'horizontal';

export type Image = {
  id: string;
  url: string;
};

export type GenerationStatus = 'idle' | 'processing' | 'completed' | 'failed';
