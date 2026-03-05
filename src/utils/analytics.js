export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackPageView = (pagePath) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-H3NWK6Y1BH', {
      page_path: pagePath,
    });
  }
};

// Game events
export const trackGameStart = (mode) => {
  trackEvent('game_start', { game_mode: mode });
};

export const trackGameEnd = (mode, result, tries = 0, chainLength = 0) => {
  trackEvent('game_end', {
    game_mode: mode,
    result: result, // 'win' or 'loss'
    tries: tries,
    chain_length: chainLength,
  });
};

export const trackHintUsed = (mode, hintType) => {
  trackEvent('hint_used', {
    game_mode: mode,
    hint_type: hintType,
  });
};

export const trackShare = (mode) => {
  trackEvent('share', { game_mode: mode });
};

export const trackUndo = () => {
  trackEvent('undo_action');
};

export const trackSkip = () => {
  trackEvent('skip_game');
};

export const trackCollectionStart = (collectionId, collectionName) => {
  trackEvent('collection_start', {
    collection_id: collectionId,
    collection_name: collectionName,
  });
};

export const trackCollectionComplete = (collectionId, collectionName) => {
  trackEvent('collection_complete', {
    collection_id: collectionId,
    collection_name: collectionName,
  });
};

export const trackCollectionCreate = (collectionName, movieCount) => {
  trackEvent('collection_create', {
    collection_name: collectionName,
    movie_count: movieCount,
  });
};

export const trackDailyChallengeComplete = (mode, result, tries = 0, chainLength = 0) => {
  trackEvent('daily_challenge_complete', {
    game_mode: mode,
    result: result,
    tries: tries,
    chain_length: chainLength,
  });
};

export const trackGameDuration = (mode, durationSeconds) => {
  trackEvent('game_duration', {
    game_mode: mode,
    duration_seconds: durationSeconds,
  });
};

export const trackSearch = (mode, query, resultCount) => {
  trackEvent('search_query', {
    game_mode: mode,
    query: query,
    result_count: resultCount,
  });
};
