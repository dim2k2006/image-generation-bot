import { GeneratedImage, Style, Orientation } from './generated-image.model';

export interface GeneratedImageService {
  createImage(input: CreateImageInput): Promise<GeneratedImage>;
  getImageById(imageId: string): Promise<GeneratedImage>;
  getImageByGenerationTaskId(taskId: string): Promise<GeneratedImage>;
  updateImage(input: GeneratedImage): Promise<GeneratedImage>;

  initializeImageGeneration(taskId: string, imageId: string): Promise<void>;
  completeImageGeneration(taskId: string): Promise<void>;
  failImageGeneration(taskId: string): Promise<void>;
}

export type CreateImageInput = {
  id?: string;
  prompt: string;
  isPromptEnhanced: boolean;
  style: Style;
  orientation: Orientation;
  userId: string;
  createdAt?: string;
};
