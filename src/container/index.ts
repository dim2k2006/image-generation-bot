import { ExceptionProvider, ExceptionProviderSentry } from '../providers/exception';
import { GenAiProvider, GenAiProviderFusara } from '../providers/gen-ai';
import { UserRepositoryInMemory, UserService, UserServiceImpl } from '../domain/user';
import {
  GeneratedImageRepositoryInMemory,
  GeneratedImageService,
  GeneratedImageServiceImpl,
} from '../domain/generated-image';

export function buildConfig(): Config {
  const fusaraApiKey = process.env.FUSARA_API_KEY;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const sentryDsn = process.env.SENTRY_DSN;
  const generationCompleteCallbackUrl = process.env.GENERATION_COMPLETE_CALLBACK_URL;

  return {
    fusaraApiKey,
    telegramBotToken,
    allowedTelegramUserIds: [284307817, 263786736],
    sentryDsn,
    generationCompleteCallbackUrl,
  };
}

export type Config = {
  fusaraApiKey: string;
  telegramBotToken: string;
  allowedTelegramUserIds: number[];
  sentryDsn: string;
  generationCompleteCallbackUrl: string;
};

export function buildContainer(config: Config): Container {
  const exceptionProvider = new ExceptionProviderSentry();
  const genAiProvider = new GenAiProviderFusara({ apiKey: config.fusaraApiKey });

  const userRepository = new UserRepositoryInMemory();
  const userService = new UserServiceImpl({ userRepository });

  const generatedImageRepository = new GeneratedImageRepositoryInMemory();
  const generatedImageService = new GeneratedImageServiceImpl({
    generatedImageRepository,
    genAiProvider,
    generationCompleteCallbackUrl: config.generationCompleteCallbackUrl,
    exceptionProvider,
  });

  return {
    config,
    userService,
    generatedImageService,
    exceptionProvider,
    genAiProvider,
  };
}

export type Container = {
  config: Config;
  userService: UserService;
  generatedImageService: GeneratedImageService;
  exceptionProvider: ExceptionProvider;
  genAiProvider: GenAiProvider;
};
