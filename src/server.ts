import { config } from 'dotenv';
import fastify from 'fastify';
import { webhookCallback } from 'grammy';
import * as Sentry from '@sentry/node';
import toString from 'lodash/toString';
import identity from 'lodash/identity';
import { match } from 'ts-pattern';
import { buildConfig, buildContainer } from './container';
import buildBot from './bot';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const appConfig = buildConfig();

const container = buildContainer(appConfig);

Sentry.init({
  dsn: appConfig.sentryDsn,
  enabled: process.env.NODE_ENV === 'production',
});

const bot = buildBot(container);

const server = fastify();

Sentry.setupFastifyErrorHandler(server);

server.get('/alive', async () => {
  const date = new Date().toISOString();

  return `It is alive 🔥🔥🔥 Now: ${date} UTC`;
});

server.get('/debug-sentry', function mainHandler() {
  throw new Error('My first Sentry error!');
});

server.post('/webhook', async (request, reply) => {
  try {
    const handleUpdate = webhookCallback(bot, 'fastify');

    await handleUpdate(request, reply);
  } catch (error) {
    console.error(error);

    reply.status(500).send(error.message);
  }
});

type GenerationCompletedRequestBody = {
  taskId: number;
  statusId: StatusId;
};

// 10 - Initial
// 20 - Processing
// 100 - Succeeded
// 200 - Failed
type StatusId = 10 | 20 | 100 | 200;

const GenerationCompletedRequestBodySchema = {
  type: 'object',
  required: ['taskId', 'statusId'],
  properties: {
    taskId: { type: 'number' },
    statusId: { type: 'number' },
  },
  additionalProperties: false,
};

server.post<{ Body: GenerationCompletedRequestBody; Reply: string }>(
  '/webhooks/generated-images/generation-completed',
  { schema: { body: GenerationCompletedRequestBodySchema } },
  async (request, reply) => {
    try {
      const { taskId: taskIdNumber, statusId } = request.body;

      const taskId = toString(taskIdNumber);

      const process = match(statusId)
        .with(10, () => identity)
        .with(20, () => identity)
        .with(100, () => container.generatedImageService.completeImageGeneration.bind(container.generatedImageService))
        .with(200, () => container.generatedImageService.failImageGeneration.bind(container.generatedImageService))
        .exhaustive();

      await process(taskId);

      reply.send('OK');
    } catch (error) {
      console.error(error);

      reply.status(500).send(error.message);
    }
  },
);

const envPort = process.env.PORT;

const port = Number(envPort) || 8080;

server.listen({ host: '0.0.0.0', port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
