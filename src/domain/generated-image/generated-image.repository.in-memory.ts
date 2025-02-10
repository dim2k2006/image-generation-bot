import { GeneratedImage } from './generated-image.model';
import { GeneratedImageRepository } from './generated-image.repository';

class GeneratedImageRepositoryInMemory implements GeneratedImageRepository {
  private images: GeneratedImage[] = [];

  async createImage(image: GeneratedImage): Promise<GeneratedImage> {
    this.images.push(image);

    return image;
  }

  async getImageById(imageId: string): Promise<GeneratedImage> {
    return this.images.find((image) => image.id === imageId);
  }

  async getImageByGenerationTaskId(taskId: string): Promise<GeneratedImage> {
    return this.images.find((image) => image.generationTaskId === taskId);
  }

  async updateImage(input: GeneratedImage): Promise<GeneratedImage> {
    const index = this.images.findIndex((image) => image.id === input.id);

    this.images[index] = input;

    return input;
  }
}

export default GeneratedImageRepositoryInMemory;
