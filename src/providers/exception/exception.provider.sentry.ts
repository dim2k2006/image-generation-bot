import * as Sentry from '@sentry/node';
import { ExceptionProvider, Primitive } from './exception.provider';

class ExceptionProviderSentry implements ExceptionProvider {
  captureException(exception: unknown, extraMessage?: string, tags?: Record<string, Primitive>) {
    Sentry.captureException(exception, { tags, extra: { message: extraMessage } });
  }
}

export default ExceptionProviderSentry;
