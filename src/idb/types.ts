import { ChallengeData } from '../services/types/application';

export interface StoredChallenge extends ChallengeData {
  cachedAt?: number;
  version?: string;
  lastModified?: number;
}
