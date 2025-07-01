(function() {
  function getChallengeIDFromUrl(url) {
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
    return null;
  }

  async function copyToClipboard(data) {
    try {
      await navigator.clipboard.writeText(data);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  function showMessage(message, type = 'info') {
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800'
    };

    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 350px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: opacity 0.3s ease;
      line-height: 1.4;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.opacity = '0';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 2000);
  }

  // Main bookmarklet function
  async function fetchAndCopyChallenge() {
    try {
      if (!window.location.hostname.includes('geoguessr.com')) {
        showMessage('Please run this bookmarklet on a GeoGuessr page!', 'warning');
        return;
      }

      const challengeId = getChallengeIDFromUrl(window.location.href);
      if (!challengeId) {
        showMessage('No challenge found on this page. Please navigate to a challenge page.', 'error');
        return;
      }

      showMessage(`Fetching challenge ${challengeId}...`, 'info');

      // Fetch both APIs in parallel
      const params = new URLSearchParams({
        friends: 'false',
        limit: '100',
        minRounds: '5'
      });

      const [challengeResponse, highscoresResponse] = await Promise.all([
        fetch(`https://www.geoguessr.com/api/v3/challenges/${challengeId}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include'
        }),
        fetch(`https://www.geoguessr.com/api/v3/results/highscores/${challengeId}?${params}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include'
        })
      ]);

      if (!challengeResponse.ok) {
        throw new Error(`Failed to fetch challenge: ${challengeResponse.status}`);
      }

      if (!highscoresResponse.ok) {
        throw new Error(`Failed to fetch highscores: ${highscoresResponse.status}`);
      }

      const [challengeData, highscores] = await Promise.all([
        challengeResponse.json(),
        highscoresResponse.json()
      ]);

      if (!highscores || !highscores.items || highscores.items.length === 0) {
        throw new Error('No results found for this challenge');
      }

      // Prepare raw API data for clipboard
      const rawApiData = {
        challengeId: challengeId,
        challengeResponse: challengeData,
        highscoresResponse: highscores,
        source: 'bookmarklet',
        timestamp: Date.now()
      };

      const jsonData = JSON.stringify(rawApiData, null, 2);
      const copied = await copyToClipboard(jsonData);

      if (copied) {
        const challengeName = challengeData.name || 'challenge';
        showMessage(`Challenge "${challengeName}" data copied to clipboard!`, 'success');
      } else {
        showMessage('Failed to copy to clipboard.', 'error');
      }

    } catch (error) {
      console.error('Bookmarklet error:', error);
      showMessage(`Error: ${error.message}`, 'error');
    }
  }

  // Run the main function
  fetchAndCopyChallenge();
})(); 