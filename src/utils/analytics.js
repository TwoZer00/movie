const track = (event, data = {}) => {
  if (import.meta.env.PROD) window.umami?.track(event, data);
};

export const trackGameStart = (mode) => track('game_start', { mode });
export const trackGameEnd = (mode, result, tries = 0, chainLength = 0) => track('game_end', { mode, result, tries, chain_length: chainLength });
export const trackGameDuration = (mode, durationSeconds) => track('game_duration', { mode, duration_seconds: durationSeconds });
export const trackHintUsed = (mode, hintType) => track('hint_used', { mode, hint_type: hintType });
export const trackShare = (mode) => track('share', { mode });
export const trackUndo = () => track('undo');
export const trackSkip = () => track('skip');
export const trackDailyChallengeComplete = (mode, result, tries = 0, chainLength = 0) => track('daily_complete', { mode, result, tries, chain_length: chainLength });
export const trackCollectionStart = (collectionId, collectionName) => track('collection_start', { collection_id: collectionId, collection_name: collectionName });
export const trackCollectionComplete = (collectionId, collectionName) => track('collection_complete', { collection_id: collectionId, collection_name: collectionName });
export const trackCollectionCreate = (collectionName, movieCount) => track('collection_create', { collection_name: collectionName, movie_count: movieCount });
export const trackSearch = (mode, query, resultCount) => track('search', { mode, query, result_count: resultCount });
