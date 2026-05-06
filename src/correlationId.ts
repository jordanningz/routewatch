import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const CORRELATION_ID_HEADER = 'x-correlation-id';

export interface CorrelationIdConfig {
  header?: string;
  generateId?: () => string;
  propagate?: boolean;
}

let config: Required<CorrelationIdConfig> = {
  header: CORRELATION_ID_HEADER,
  generateId: () => randomUUID(),
  propagate: true,
};

export function configureCorrelationId(options: CorrelationIdConfig): void {
  config = {
    header: options.header ?? CORRELATION_ID_HEADER,
    generateId: options.generateId ?? (() => randomUUID()),
    propagate: options.propagate ?? true,
  };
}

export function getCorrelationIdConfig(): Required<CorrelationIdConfig> {
  return { ...config };
}

export function resetCorrelationIdConfig(): void {
  config = {
    header: CORRELATION_ID_HEADER,
    generateId: () => randomUUID(),
    propagate: true,
  };
}

export function getCorrelationId(req: Request): string | undefined {
  return (req as any).__correlationId as string | undefined;
}

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const existing = req.headers[config.header] as string | undefined;
  const id = existing ?? config.generateId();

  (req as any).__correlationId = id;

  if (config.propagate) {
    res.setHeader(config.header, id);
  }

  next();
}
