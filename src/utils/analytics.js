export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Add variant info to all events
    const variant = getVariant();
    window.gtag('event', eventName, {
      ...eventParams,
      variant: variant, // 'with_ads' or 'no_ads'
    });
  }
};

export const trackPageView = (pagePath) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const variant = getVariant();
    window.gtag('config', 'G-H3NWK6Y1BH', {
      page_path: pagePath,
      variant: variant,
    });
  }
};

// Get current variant (with_ads or no_ads)
export const getVariant = () => {
  // Check if ads are enabled by looking for AdSense components
  // You can also use a feature flag or environment variable
  return 'with_ads'; // Change to 'no_ads' for the no-ads branch
};

// Track variant assignment (call once on app load)
export const trackVariantAssignment = () => {
  const variant = getVariant();
  trackEvent('variant_assigned', {
    variant: variant,
    timestamp: Date.now(),
  });
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


// Ad-specific tracking
export const trackAdImpression = (adFormat, adLocation) => {
  trackEvent('ad_impression', {
    ad_format: adFormat, // 'banner', 'square', 'vertical'
    ad_location: adLocation, // 'home', 'link_game', 'odd_one_out', 'modal'
  });
};

export const trackAdClick = (adFormat, adLocation) => {
  trackEvent('ad_click', {
    ad_format: adFormat,
    ad_location: adLocation,
  });
};

export const trackAdError = (adFormat, adLocation, errorMessage) => {
  trackEvent('ad_error', {
    ad_format: adFormat,
    ad_location: adLocation,
    error_message: errorMessage,
  });
};

// Revenue tracking (for ads branch)
export const trackAdRevenue = (revenue, adFormat) => {
  trackEvent('ad_revenue', {
    value: revenue,
    currency: 'USD',
    ad_format: adFormat,
  });
};

// User engagement comparison
export const trackSessionDuration = (durationSeconds) => {
  trackEvent('session_duration', {
    duration_seconds: durationSeconds,
  });
};

export const trackBounceRate = (bounced) => {
  trackEvent('bounce', {
    bounced: bounced, // true or false
  });
};
