import { v4 as uuidV4 } from 'uuid';
import { GeneratedImageRepository } from './generated-image.repository';
import { GeneratedImageService, CreateImageInput } from './generated-image.service';
import { GenAiProvider } from '../../providers/gen-ai';
import { ExceptionProvider } from '../../providers/exception';
import { GeneratedImage } from './generated-image.model';

type ConstructorInput = {
  generatedImageRepository: GeneratedImageRepository;
  genAiProvider: GenAiProvider;
  exceptionProvider: ExceptionProvider;
  generationCompleteCallbackUrl: string;
};

class GeneratedImageServiceImpl implements GeneratedImageService {
  private generatedImageRepository: GeneratedImageRepository;

  private genAiProvider: GenAiProvider;

  private exceptionProvider: ExceptionProvider;

  private readonly generationCompleteCallbackUrl: string;

  constructor({
    generatedImageRepository,
    genAiProvider,
    generationCompleteCallbackUrl,
    exceptionProvider,
  }: ConstructorInput) {
    this.generatedImageRepository = generatedImageRepository;

    this.genAiProvider = genAiProvider;

    this.exceptionProvider = exceptionProvider;

    this.generationCompleteCallbackUrl = generationCompleteCallbackUrl;
  }

  async createImage(input: CreateImageInput): Promise<GeneratedImage> {
    const generatedImage = await this.genAiProvider.generateImage({
      prompt: input.prompt,
      isPromptEnhanced: input.isPromptEnhanced,
      style: input.style,
      orientation: input.orientation,
      completionCallbackUrl: this.generationCompleteCallbackUrl,
    });

    const createPosterInput = {
      id: uuidV4(),
      prompt: input.prompt,
      style: input.style,
      orientation: input.orientation,
      images: generatedImage.images,
      userId: input.userId,
      generationTaskId: '',
      generationStatus: 'idle',
      createdAt: new Date().toISOString(),
    } as const;

    const createdImage = await this.generatedImageRepository.createImage(createPosterInput);

    await this.initializeImageGeneration(generatedImage.taskId, createdImage.id);

    return this.getImageById(createdImage.id);
  }

  async getImageById(imageId: string): Promise<GeneratedImage> {
    return this.generatedImageRepository.getImageById(imageId);
  }

  async getImageByGenerationTaskId(taskId: string): Promise<GeneratedImage> {
    return this.generatedImageRepository.getImageByGenerationTaskId(taskId);
  }

  async updateImage(input: GeneratedImage): Promise<GeneratedImage> {
    return this.generatedImageRepository.updateImage(input);
  }

  async initializeImageGeneration(taskId: string, imageId: string): Promise<void> {
    const poster = await this.generatedImageRepository.getImageById(imageId);

    if (poster.generationStatus !== 'idle') {
      return;
    }

    await this.generatedImageRepository.updateImage({
      ...poster,
      generationTaskId: taskId,
      generationStatus: 'processing',
    });
  }

  async completeImageGeneration(taskId: string): Promise<void> {
    const poster = await this.generatedImageRepository.getImageByGenerationTaskId(taskId);

    if (poster.generationStatus !== 'processing') {
      return;
    }

    const genAiResponse = await this.genAiProvider.getGeneratedImage(poster.generationTaskId);

    await this.generatedImageRepository.updateImage({
      ...poster,
      images: genAiResponse.images,
      generationStatus: 'completed',
    });
  }

  async failImageGeneration(taskId: string): Promise<void> {
    const poster = await this.generatedImageRepository.getImageByGenerationTaskId(taskId);

    if (poster.generationStatus !== 'processing') {
      return;
    }

    await this.generatedImageRepository.updateImage({
      ...poster,
      generationStatus: 'failed',
    });

    this.exceptionProvider.captureException(
      new Error(`Failed to generate ai poster with id ${poster.id} for task with id ${taskId}`),
      `Failed to generate ai poster with id ${poster.id} for task with id ${taskId}`,
      {
        posterId: poster.id,
        taskId,
      },
    );
  }
}

export default GeneratedImageServiceImpl;
