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

/**
 * Reads and parses a JSON file
 * @param {File} file - The file to read
 * @returns {Promise<Object>} Parsed JSON data
 */
export const readJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('Please select a JSON file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validates imported challenge data structure
 * @param {Object} data - The imported data to validate
 * @returns {Array} Array of challenges if valid
 */
export const validateChallengeData = (data) => {
  // Handle both old format (direct array) and new format (with metadata)
  let challenges;
  
  if (Array.isArray(data)) {
    // Old format: direct array of challenges
    challenges = data;
  } else if (data && Array.isArray(data.challenges)) {
    // New format: object with challenges array
    challenges = data.challenges;
  } else {
    throw new Error('Invalid file format. Expected challenge data not found.');
  }

  if (!challenges || challenges.length === 0) {
    throw new Error('No challenges found in the file');
  }

  // Basic validation of challenge structure
  for (const challenge of challenges) {
    if (!challenge.id || !challenge.name) {
      throw new Error('Invalid challenge data structure. Missing required fields (id, name).');
    }
  }

  return challenges;
};

/**
 * Triggers file picker for importing challenges
 * @returns {Promise<Array|null>} Array of challenges from the imported file, or null if cancelled
 */
export const importChallenges = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    
    let resolved = false;
    
    input.onchange = async (event) => {
      if (resolved) return;
      resolved = true;
      
      try {
        const file = event.target.files[0];
        if (!file) {
          // No file selected - this is cancellation
          resolve(null);
          return;
        }

        const data = await readJSONFile(file);
        const challenges = validateChallengeData(data);
        
        resolve(challenges);
      } catch (error) {
        reject(error);
      }
    };
    
    // Handle cancel case - when user clicks cancel or closes dialog
    input.oncancel = () => {
      if (resolved) return;
      resolved = true;
      resolve(null); // Return null instead of throwing error
    };
    
    // Fallback for browsers that don't support oncancel
    // Check if the dialog was cancelled after a short delay
    setTimeout(() => {
      if (!resolved && !input.files.length) {
        resolved = true;
        resolve(null); // Return null instead of throwing error
      }
    }, 100);
    
    input.click();
  });
}; 