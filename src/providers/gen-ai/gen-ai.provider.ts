export interface GenAiProvider {
  generateImage(input: GenerateImageInput): Promise<GeneratedImage>;
  getGeneratedImage(taskId: string): Promise<GeneratedImage>;
}

export type GenerateImageInput = {
  prompt: string;
  isPromptEnhanced: boolean;
  style: Style;
  orientation: Orientation;
  completionCallbackUrl: string;
};

export type GeneratedImage = {
  images: Image[];
  taskId: string;
};

export type Style = 'photo' | 'illustration';

export type Orientation = 'vertical' | 'horizontal';

type Image = {
  id: string;
  url: string;
};
