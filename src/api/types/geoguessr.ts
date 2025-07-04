/**
 * Geoguessr API Response Types
 * 
 * These types represent the raw API responses from Geoguessr's API endpoints.
 * They match the exact structure returned by Geoguessr's servers.
 * 
 * Note: Some fields are not included in the types, since its not needed for the current use case.
 * 
 */

export type LatLng = {
  lat: number;
  lng: number;
};

export type GeoguessrUser = {
  id: string;
  nick: string;
  countryCode: string;
  isVerified: boolean;
};

export type GeoguessrGameRound = LatLng & {
  panoId: string;
  heading: number;
  pitch: number;
  zoom: number;
  startTime: string;
};

export type GeoguessrPlayerRoundResult = LatLng & {
  roundScoreInPoints: number;
  distanceInMeters: number;
  stepsCount: number;
  time: number;
  timedOut: boolean;
  skippedRound: boolean;
};

export type GeoguessrPlayerGameResult = GeoguessrUser & {
  totalScore: {
    amount: string;
    percentage: number;
  };
  totalTime: number;  // in seconds
  totalDistanceInMeters: number;
  totalStepsCount: number;
  guesses: Array<GeoguessrPlayerRoundResult>;
  isLeader: boolean;
};

export type GeoguessrGame = {
  token: string;
  type: string;  // "challenge", "standard"
  mode: string;  // "standard"
  forbidMoving: boolean;
  forbidZooming: boolean;
  forbidRotating: boolean;
  roundCount: number;
  timeLimit: number;
  map: string;  // map id
  mapName: string;
  rounds: Array<GeoguessrGameRound>;
  player: GeoguessrPlayerGameResult;
};

export type GeoguessrPlayerHighscore = {
  game: GeoguessrGame;
};

export type GeoguessrHighscoreResponse = {
  items: GeoguessrPlayerHighscore[];
  paginationToken: string | null;
};

export type GeoguessrMap = {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string;
  bounds: {
    min: LatLng;
    max: LatLng;
  };
  tags: string[];
};

export type GeoguessrChallenge = {
  token: string;
  mapSlug: string;
  roundCount: number;
  timeLimit: number;
  forbidMoving: boolean;
  forbidZooming: boolean;
  forbidRotating: boolean;
  numberOfParticipants: number;
  gameMode: string;
};

export type GeoguessrChallengeResponse = {
  challenge: GeoguessrChallenge;
  map: GeoguessrMap;
  creator: GeoguessrUser;
};
