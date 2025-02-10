import { GeneratedImage, Style, Orientation } from './generated-image.model';

export interface GeneratedImageService {
  createImage(input: CreateImageInput): Promise<GeneratedImage>;
  getImageById(imageId: string): Promise<GeneratedImage>;
  getImageByGenerationTaskId(taskId: string): Promise<GeneratedImage>;
  getPostersCount(userId: string): Promise<number>;
  updateImage(input: GeneratedImage): Promise<GeneratedImage>;

  initializeImageGeneration(taskId: string, imageId: string): Promise<void>;
  completeImageGeneration(taskId: string): Promise<void>;
  failImageGeneration(taskId: string): Promise<void>;
}

export type CreateImageInput = {
  id?: string;
  description: string;
  isDescriptionEnhanced: boolean;
  style: Style;
  orientation: Orientation;
  userId: string;
  createdAt?: string;
};
