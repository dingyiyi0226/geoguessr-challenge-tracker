/**
 * Application Types
 * 
 * These types represent our internal data structures and business logic.
 * They are processed versions of Geoguessr API data, optimized for our application needs.
 * 
 * Note: These types can be modified as our application requirements change.
 */

import { LatLng } from '../../api/types/geoguessr';

export type GameMode = 'NMPZ' | 'No move' | 'Moving';

/**
 * This type represents the data for a single challenge.
 * It is used to store the challenge data in the application.
 */
export type ChallengeData = {
  id: string;
  name: string;
  creator: string;
  mode: GameMode;
  timeLimit: number;
  mapName: string;
  mapId: string;
  roundCount: number;
  participants: Participant[];
};

export type Participant = {
  rank: number;
  userId: string;
  nick: string;
  totalScore: number;
  totalTime: number;
  playedAt: string | null;
  countryCode: string;
  isVerified: boolean;
  totalDistance: number;
  scorePercentage: number;
  rounds: Round[];
};

export type Round = LatLng & {
  roundNumber: number;
  guessLat: number;
  guessLng: number;
  distance: number;
  score: number;
  time: number;
  timedOut: boolean;
  skippedRound: boolean;
};

export type BatchResult = {
  success: boolean;
  data?: ChallengeData;
  url: string;
  index: number;
  challengeId?: string;
  error?: string;
};

export type ProgressUpdate = {
  addedCount: number;
  failedCount: number;
  totalCount: number;
  remainingCount: number;
};

export type BatchResponse = {
  results: ChallengeData[];
  errors: BatchResult[];
  addedCount: number;
  failedCount: number;
  totalCount: number;
  successRate: number;
};

export type HighscoresOptions = {
  friends?: boolean;
  limit?: number;
  minRounds?: number;
  extraParams?: Record<string, string>;
}; 