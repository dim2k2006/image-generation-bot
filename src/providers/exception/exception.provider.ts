export interface ExceptionProvider {
  captureException(exception: unknown, extraMessage?: string, tags?: Record<string, Primitive>): void;
}

type Primitive = number | string | boolean | bigint | symbol | null | undefined;
