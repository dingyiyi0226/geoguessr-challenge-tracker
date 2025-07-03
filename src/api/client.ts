import axios, { AxiosInstance } from 'axios';

// Geoguessr API configuration
const GEOGUESSR_BASE_URL = '/api'; // Using proxy, so relative URL
const GEOGUESSR_GAME_SERVER = 'https://game-server.geoguessr.com/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export { GEOGUESSR_BASE_URL, GEOGUESSR_GAME_SERVER }; 