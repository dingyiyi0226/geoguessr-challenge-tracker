import { AuthenticationError } from './types';

const AUTH_TOKEN_KEY = 'geoguessr_ncfa_token';

/**
 * Get authentication token from localStorage
 * @throws {AuthenticationError} When no token is found
 */
export const getAuthToken = (): string => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    throw new AuthenticationError('Please set your _ncfa token in the settings.');
  }
  return token;
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Clear authentication token from localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user has authentication token
 */
export const hasAuthToken = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get authentication headers for API requests
 * @throws {AuthenticationError} When no token is found
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Auth-Token': token,
  };
}; 