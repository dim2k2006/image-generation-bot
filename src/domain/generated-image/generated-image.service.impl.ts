import { v4 as uuidV4 } from 'uuid';
import { GeneratedImageRepository } from './generated-image.repository';
import { GeneratedImageService, CreateImageInput } from './generated-image.service';
import { GenAiProvider } from '../../providers/gen-ai';
import { ExceptionProvider } from '../../providers/exception';
import { ChatProvider } from '../../providers/chat';
import { GeneratedImage } from './generated-image.model';

type ConstructorInput = {
  generatedImageRepository: GeneratedImageRepository;
  genAiProvider: GenAiProvider;
  exceptionProvider: ExceptionProvider;
  chatProvider: ChatProvider;
  generationCompleteCallbackUrl: string;
};

class GeneratedImageServiceImpl implements GeneratedImageService {
  private generatedImageRepository: GeneratedImageRepository;

  private genAiProvider: GenAiProvider;

  private exceptionProvider: ExceptionProvider;

  private chatProvider: ChatProvider;

  private readonly generationCompleteCallbackUrl: string;

  constructor({
    generatedImageRepository,
    genAiProvider,
    generationCompleteCallbackUrl,
    exceptionProvider,
    chatProvider,
  }: ConstructorInput) {
    this.generatedImageRepository = generatedImageRepository;

    this.genAiProvider = genAiProvider;

    this.exceptionProvider = exceptionProvider;

    this.chatProvider = chatProvider;

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
      chatId: input.chatId,
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
    const generatedImage = await this.generatedImageRepository.getImageByGenerationTaskId(taskId);

    if (generatedImage.generationStatus !== 'processing') {
      return;
    }

    const genAiResponse = await this.genAiProvider.getGeneratedImage(generatedImage.generationTaskId);

    await this.generatedImageRepository.updateImage({
      ...generatedImage,
      images: genAiResponse.images,
      generationStatus: 'completed',
    });

    const message = `
Here is the generated image for the prompt: "${generatedImage.prompt}"

${genAiResponse.images.map((image) => image.url).join('\n')}
    `;

    await this.chatProvider.sendMessages(generatedImage.chatId, [message]);
  }

  async failImageGeneration(taskId: string): Promise<void> {
    const image = await this.generatedImageRepository.getImageByGenerationTaskId(taskId);

    if (image.generationStatus !== 'processing') {
      return;
    }

    await this.generatedImageRepository.updateImage({
      ...image,
      generationStatus: 'failed',
    });

    const message = `
Failed to generate image for the prompt: "${image.prompt}"
    `;

    await this.chatProvider.sendMessages(image.chatId, [message]);

    this.exceptionProvider.captureException(
      new Error(`Failed to generate ai poster with id ${image.id} for task with id ${taskId}`),
      `Failed to generate ai poster with id ${image.id} for task with id ${taskId}`,
      {
        posterId: image.id,
        taskId,
      },
    );
  }
}

export default GeneratedImageServiceImpl;
