const track = (event, data = {}) => {
  if (import.meta.env.PROD) window.umami?.track(event, data);
};

export const trackGameStart = (mode) => track('game_start', { mode });
export const trackGameEnd = (mode, result, tries = 0, chainLength = 0) => track('game_end', { mode, result, tries, chain_length: chainLength });
export const trackGameDuration = (mode, durationSeconds) => track('game_duration', { mode, duration_seconds: durationSeconds });
export const trackHintUsed = (mode, hintType, chainPosition = null) => track('hint_used', { mode, hint_type: hintType, ...(chainPosition !== null && { chain_position: chainPosition }) });
export const trackShare = (mode) => track('share', { mode });
export const trackUndo = () => track('undo');
export const trackSkip = () => track('skip');
export const trackDailyChallengeComplete = (mode, result, tries = 0, chainLength = 0) => track('daily_complete', { mode, result, tries, chain_length: chainLength });
export const trackCollectionStart = (collectionId, collectionName) => track('collection_start', { collection_id: collectionId, collection_name: collectionName });
export const trackCollectionComplete = (collectionId, collectionName) => track('collection_complete', { collection_id: collectionId, collection_name: collectionName });
export const trackCollectionCreate = (collectionName, movieCount) => track('collection_create', { collection_name: collectionName, movie_count: movieCount });
export const trackSearch = (mode, query, resultCount) => track('search', { mode, query, result_count: resultCount });
export const trackModeSelect = (mode) => track('mode_select', { mode });
export const trackFilterApplied = (filters) => track('filter_applied', filters);
export const trackStatsReset = () => track('stats_reset');
export const trackAdultFilterToggle = (enabled) => track('adult_filter_toggle', { enabled });
export const trackPlayAgain = (mode) => track('play_again', { mode });
export const trackAbandoned = (mode, tries) => track('game_abandoned', { mode, tries });
export const trackMovieFailed = (movieId, movieTitle, tries) => track('movie_failed', { movie_id: movieId, movie_title: movieTitle, tries });
export const trackSearchNoResults = (mode, query) => track('search_no_results', { mode, query });
