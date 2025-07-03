import { getChallengeIDFromUrl } from '../api/utils';
import { convertRespToChallengeData } from './utils';
import { getChallengeInfo } from '../api/challenges';
import { getChallengeHighscores } from '../api/highscores';
import { 
  ChallengeData, 
  BatchResult,
  ProgressUpdate,
  BatchResponse,
} from './types/application';
import { 
  saveChallenge, 
  loadChallenge as loadChallengeFromDB, 
  hasChallenge,
  appendChallengeList
} from '../utils/indexedDbStorage';

/**
 * Fetch challenge results using the API and process them
 */
const fetchChallengeFromAPI = async (challengeId: string): Promise<ChallengeData> => {
  const [challengeResp, highscoreResp] = await Promise.all([
    getChallengeInfo(challengeId),
    getChallengeHighscores(challengeId)
  ]);
  
  return convertRespToChallengeData(challengeId, challengeResp, highscoreResp);
};

/**
 * Main function to load challenge data with IndexedDB caching
 */
export const loadChallenge = async (challengeUrl: string, forceRefresh: boolean = false): Promise<ChallengeData> => {
  try {
    const challengeId = getChallengeIDFromUrl(challengeUrl);
    if (!challengeId) {
      console.error('Invalid Geoguessr challenge URL format', challengeUrl);
      throw new Error('Invalid Geoguessr challenge URL format');
    }
    
    // Check IndexedDB first (unless force refresh)
    if (!forceRefresh && await hasChallenge(challengeId)) {
      const cachedData = await loadChallengeFromDB(challengeId);
      if (cachedData) {
        console.log(`Using cached data for challenge ${challengeId}`);
        return cachedData;
      }
    }

    console.log(`Fetching fresh data for challenge ${challengeId}`);
    const challengeData = await fetchChallengeFromAPI(challengeId);
    
    // Save to IndexedDB after successful fetch
    await saveChallenge(challengeData);
    await appendChallengeList(challengeId);
    
    return challengeData;
  } catch (error) {
    console.error('Error fetching challenge data:', error);
    throw error;
  }
};

/**
 * Helper function to process challenges in batches with rate limiting
 */
const processBatch = async (
  batch: Array<{ url: string; index: number }>, 
  startIndex: number, 
  updateProgress: (progress: ProgressUpdate) => void, 
  forceRefresh: boolean = false, 
  names: string[] | null = null
): Promise<PromiseSettledResult<BatchResult>[]> => {
  const batchPromises = batch.map(async ({ url, index }, batchIndex) => {
    try {
      const challengeId = getChallengeIDFromUrl(url);
      
      if (!challengeId) {
        throw new Error('Invalid Geoguessr challenge URL format');
      }
      
      // Check IndexedDB first (unless force refresh)
      if (!forceRefresh && await hasChallenge(challengeId)) {
        const cachedData = await loadChallengeFromDB(challengeId);
        if (cachedData) {
          // Apply custom name if provided, even for cached data
          if (names && names[index]) {
            cachedData.name = names[index];
            await saveChallenge(cachedData); // Re-save with updated name
          }
          return { success: true, data: cachedData, url, index, challengeId };
        }
      }
      
      // Add small delay between requests in the same batch to avoid overwhelming the server
      if (batchIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, 200 * batchIndex));
      }
      
      const challengeData = await fetchChallengeFromAPI(challengeId);
      
      // Apply custom name if provided
      if (names && names[index]) {
        challengeData.name = names[index];
      }
      
      // Save to IndexedDB but DON'T append to challenge list yet
      await saveChallenge(challengeData);
      
      return { success: true, data: challengeData, url, index, challengeId };
    } catch (error: any) {
      console.error(`Failed to fetch challenge for ${url}:`, error);
      const errorInfo: BatchResult = { success: false, error: error.message, url, index };
      return errorInfo;
    }
  });

  return await Promise.allSettled(batchPromises);
};

/**
 * Parallel import multiple challenges from URLs with progress tracking and rate limiting
 */
export const importChallengesFromUrls = async (
  challengeUrls: string[], 
  onProgress: ((progress: ProgressUpdate) => void) | null = null, 
  forceRefresh: boolean = false, 
  names: string[] | null = null
): Promise<BatchResponse> => {
  if (!Array.isArray(challengeUrls) || challengeUrls.length === 0) {
    throw new Error('challengeUrls must be a non-empty array');
  }

  // Validate names array if provided
  if (names && (!Array.isArray(names) || names.length !== challengeUrls.length)) {
    throw new Error('names array must have the same length as challengeUrls array');
  }

  let addedCount = 0;
  let failedCount = 0;
  const results: ChallengeData[] = [];
  const errors: BatchResult[] = [];
  
  const updateProgress = () => {
    if (onProgress) {
      onProgress({
        addedCount,
        failedCount,
        totalCount: challengeUrls.length,
        remainingCount: challengeUrls.length - addedCount - failedCount
      });
    }
  };

  const BATCH_SIZE = 8;
  const batches: Array<Array<{ url: string; index: number }>> = [];
  
  for (let i = 0; i < challengeUrls.length; i += BATCH_SIZE) {
    const batch = challengeUrls.slice(i, i + BATCH_SIZE).map((url, batchIndex) => ({
      url,
      index: i + batchIndex
    }));
    batches.push(batch);
  }

  // Process batches sequentially, but items within each batch in parallel
  const allResults: PromiseSettledResult<BatchResult>[] = [];
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    // Add delay between batches to be respectful to the API
    if (batchIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    const batchResults = await processBatch(batch, batchIndex * BATCH_SIZE, updateProgress, forceRefresh, names);
    
    // Process batch results and update counters
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const resultValue = result.value;
        if (resultValue.success) {
          addedCount++;
        } else {
          failedCount++;
          errors.push(resultValue);
        }
        updateProgress();
      } else {
        failedCount++;
        updateProgress();
      }
    });
    
    allResults.push(...batchResults);
  }

  // Create ordered results array to maintain original order
  const orderedResults: (ChallengeData | undefined)[] = new Array(challengeUrls.length);
  const orderedChallengeIds: (string | undefined)[] = new Array(challengeUrls.length);
  
  // Process results and place them in correct order
  allResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      const resultValue = result.value;
      if (resultValue.success && resultValue.data) {
        orderedResults[resultValue.index] = resultValue.data;
        orderedChallengeIds[resultValue.index] = resultValue.challengeId;
        results.push(resultValue.data);
      }
    }
  });

  // Now append challenge IDs to the list in the correct order
  for (const challengeId of orderedChallengeIds) {
    if (challengeId) {
      await appendChallengeList(challengeId);
    }
  }

  // Filter out undefined entries to get only successful results in order
  const finalOrderedResults = orderedResults.filter((result): result is ChallengeData => result !== undefined);

  return {
    results: finalOrderedResults,
    errors,
    addedCount,
    failedCount,
    totalCount: challengeUrls.length,
    successRate: challengeUrls.length > 0 ? (addedCount / challengeUrls.length) * 100 : 0
  };
}; 