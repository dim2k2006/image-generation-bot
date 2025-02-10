import axios, { AxiosInstance } from 'axios';
import { match } from 'ts-pattern';
import { z } from 'zod';
import toString from 'lodash/toString';
import { GenAiProvider, GenerateImageInput, GeneratedImage, Style } from './gen-ai.provider';
import { handleAxiosError } from '../../utils/axios';

const GenerateImageResponseSchema = z.object({
  data: z.object({
    taskId: z.number(),
    images: z.array(
      z.object({
        id: z.number(),
        url: z.string(),
      }),
    ),
  }),
  statusCode: z.number(),
  succeeded: z.boolean(),
  statusCodeInt: z.number(),
});

const EnhancePromptResponseSchema = z.object({
  data: z.string(),
  statusCode: z.number(),
  succeeded: z.boolean(),
  statusCodeInt: z.number(),
});

type ConstructorInput = {
  apiKey: string;
};

class GenAiProviderFusara implements GenAiProvider {
  private readonly client: AxiosInstance;

  private readonly baseUrl: string;

  constructor({ apiKey }: ConstructorInput) {
    const baseURL = 'https://api.fusara.ai';

    this.baseUrl = baseURL;

    this.client = axios.create({
      baseURL,
      headers: {
        'X-API-Key': apiKey,
      },
    });
  }

  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const url = '/api/integration/imaging/generate';

    try {
      const aspectRatio = match(input.orientation)
        .with('vertical', () => '3:4')
        .with('horizontal', () => '4:3')
        .exhaustive();

      const styleDescription = match(input.style)
        .with('photo', () => 'realistic hd Photo very detailed high resolution')
        .with('illustration', () => 'illustration')
        .exhaustive();

      const newDescription = input.isPromptEnhanced
        ? await this.enhanceDescription(input.prompt, input.style)
        : `${styleDescription} ${input.prompt}`;

      const data = {
        __type: 1,
        prompt: newDescription,
        aspectRatio,
        completionCallbackUrl: input.completionCallbackUrl,
      };

      const response = await this.client.post(url, data);

      const responseData = GenerateImageResponseSchema.parse(response.data);

      if (!responseData.succeeded) {
        throw new Error(
          `Failed to generate image. Data: ${JSON.stringify(data)}. ResponseData: ${JSON.stringify(responseData)}`,
        );
      }

      return {
        images: responseData.data.images.map((image) => ({
          id: toString(image.id),
          url: image.url,
        })),
        taskId: toString(responseData.data.taskId),
      };
    } catch (error) {
      return handleAxiosError(error, `${this.baseUrl}${url}`);
    }
  }

  async getGeneratedImage(taskId: number | string): Promise<GeneratedImage> {
    const url = `/api/integration/imaging/tasks/${taskId}`;

    try {
      const response = await this.client.get(url);

      const responseData = GenerateImageResponseSchema.parse(response.data);

      if (!responseData.succeeded) {
        throw new Error(
          `Failed to get generated image. taskId: ${taskId}. ResponseData: ${JSON.stringify(responseData)}`,
        );
      }

      return {
        images: responseData.data.images.map((image) => ({
          id: toString(image.id),
          url: image.url,
        })),
        taskId: toString(responseData.data.taskId),
      };
    } catch (error) {
      return handleAxiosError(error, `${this.baseUrl}${url}`);
    }
  }

  private async enhanceDescription(description: string, style: Style): Promise<string> {
    const url = '/api/integration/assistants/enhance-prompt';

    try {
      // 1 - фотореалистичное изображение, 2 - иллюстрация, 0 - не учитывать стиль
      const targetStyleId = match(style)
        .with('photo', () => 1)
        .with('illustration', () => 2)
        .exhaustive();

      const data = {
        prompt: description,
        targetStyleId,
      };

      const response = await this.client.post(url, data);

      const responseData = EnhancePromptResponseSchema.parse(response.data);

      if (!responseData.succeeded) {
        throw new Error(
          `Failed to enhance prompt. Data: ${JSON.stringify(data)}. ResponseData: ${JSON.stringify(responseData)}`,
        );
      }

      return responseData.data;
    } catch (error) {
      return handleAxiosError(error, `${this.baseUrl}${url}`);
    }
  }
}

export default GenAiProviderFusara;
