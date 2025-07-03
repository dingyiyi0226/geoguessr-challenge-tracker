/**
 * Custom Error Types
 * 
 * These error classes provide specific error handling for different API scenarios.
 * They extend the base Error class with additional context and status codes.
 */

export class GeoguessrError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'GeoguessrError';
  }
}

export class AuthenticationError extends GeoguessrError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AccessDeniedError extends GeoguessrError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AccessDeniedError';
  }
}

export class NotFoundError extends GeoguessrError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
} 