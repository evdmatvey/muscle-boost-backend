import type { Request } from 'express';

type ExpressRoute = {
  path?: string | string[];
};

const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NUMERIC_SEGMENT_PATTERN = /^\d+$/;
const CUID_SEGMENT_PATTERN = /^c[a-z0-9]{20,}$/i;

const normalizePathSegment = (segment: string): string => {
  if (
    UUID_SEGMENT_PATTERN.test(segment) ||
    NUMERIC_SEGMENT_PATTERN.test(segment) ||
    CUID_SEGMENT_PATTERN.test(segment)
  ) {
    return ':id';
  }

  return segment;
};

const normalizeRawPath = (rawPath: string): string => {
  const withoutQuery = rawPath.split('?')[0] ?? rawPath;

  if (withoutQuery.length === 0 || withoutQuery === '/') {
    return '/';
  }

  const normalized = withoutQuery
    .split('/')
    .map((segment) =>
      segment.length > 0 ? normalizePathSegment(segment) : segment,
    )
    .join('/');

  return normalized.replace(/\/$/, '') || '/';
};

export const resolveHttpRoute = (request: Request): string => {
  const route = request.route as ExpressRoute | undefined;
  const routePath = route?.path;
  const normalizedPath = Array.isArray(routePath) ? routePath[0] : routePath;

  if (typeof normalizedPath === 'string' && normalizedPath.length > 0) {
    const baseUrl = request.baseUrl || '';
    const fullPath = `${baseUrl}${normalizedPath}`;

    return fullPath.replace(/\/$/, '') || '/';
  }

  const rawUrl = request.originalUrl || request.url || 'unknown';

  return normalizeRawPath(rawUrl);
};
