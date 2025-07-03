/**
 * Extract challenge ID from various Geoguessr URL formats
 */
export const getChallengeIDFromUrl = (url: string): string | null => {
  // Handle null, undefined, or empty input
  if (!url || typeof url !== 'string' || !url.trim()) {
    return null;
  }

  const trimmedUrl = url.trim();
  const patterns = [
    /\/challenge\/([a-zA-Z0-9-_]+)/,
    /\/results\/([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If it's just an ID
  if (/^[a-zA-Z0-9-_]+$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Return null for invalid format instead of throwing
  return null;
}; 