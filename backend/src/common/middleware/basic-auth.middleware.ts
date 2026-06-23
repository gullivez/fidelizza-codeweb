import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

function safeEqual(received: string, expected: string): boolean {
  const receivedBuf = Buffer.from(received);
  const expectedBuf = Buffer.from(expected);
  if (receivedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(receivedBuf, expectedBuf);
}

/**
 * HTTP Basic Auth simples para rotas administrativas internas (ex.: Bull Board).
 * Comparação com timingSafeEqual para evitar timing attack na checagem de senha.
 */
export function createBasicAuthMiddleware(username: string, password: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (header?.startsWith('Basic ')) {
      const decoded = Buffer.from(
        header.slice('Basic '.length),
        'base64',
      ).toString('utf-8');
      const separatorIndex = decoded.indexOf(':');
      const receivedUser =
        separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : decoded;
      const receivedPassword =
        separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';

      if (
        safeEqual(receivedUser, username) &&
        safeEqual(receivedPassword, password)
      ) {
        next();
        return;
      }
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Fidelizza Admin"');
    res.status(401).send('Authentication required');
  };
}
