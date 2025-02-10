import { GeneratedImage } from './generated-image.model';

export interface GeneratedImageRepository {
  createImage(image: GeneratedImage): Promise<GeneratedImage>;
  getImageById(imageId: string): Promise<GeneratedImage>;
  getImageByGenerationTaskId(taskId: string): Promise<GeneratedImage>;
  updateImage(input: GeneratedImage): Promise<GeneratedImage>;
}
