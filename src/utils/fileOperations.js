// File operations utilities for exporting and importing data

/**
 * Downloads data as a JSON file
 * @param {Object} data - The data to export
 * @param {string} filename - The filename for the download
 * @param {Object} options - Additional options for the export
 */
export const downloadAsJSON = (data, filename, options = {}) => {
  try {
    // Create export data with metadata if not already structured
    const exportData = options.includeMetadata ? {
      exportedAt: new Date().toISOString(),
      version: options.version || '1.0',
      dataCount: Array.isArray(data) ? data.length : Object.keys(data).length,
      data: data,
      ...options.additionalMetadata
    } : data;

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Generates a filename with timestamp
 * @param {string} baseName - Base name for the file
 * @param {string} extension - File extension (default: 'json')
 * @param {boolean} includeTime - Whether to include time in filename
 * @returns {string} Generated filename
 */
export const generateTimestampedFilename = (baseName, extension = 'json', includeTime = false) => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = includeTime ? now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-') : '';
  
  const timestamp = includeTime ? `${dateStr}_${timeStr}` : dateStr;
  return `${baseName}-${timestamp}.${extension}`;
};

/**
 * Exports challenge data with proper formatting and metadata
 * @param {Array} challenges - Array of challenge data
 * @returns {boolean} Success status
 */
export const exportChallenges = (challenges) => {
  if (!challenges || challenges.length === 0) {
    throw new Error('No challenges to export');
  }

  const filename = generateTimestampedFilename('geoguessr-challenges');
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    challengeCount: challenges.length,
    challenges: challenges
  };

  return downloadAsJSON(exportData, filename);
}; 