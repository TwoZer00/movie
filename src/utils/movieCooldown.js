const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'movieCooldowns';

export const addMovieCooldown = (movieId) => {
  const cooldowns = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  cooldowns[movieId] = Date.now();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cooldowns));
};

export const getRecentMovies = () => {
  const cooldowns = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  const now = Date.now();
  
  // Clean expired entries and return recent ones
  const recentMovies = [];
  const cleanedCooldowns = {};
  
  Object.entries(cooldowns).forEach(([movieId, timestamp]) => {
    if (now - timestamp < COOLDOWN_TIME) {
      recentMovies.push(parseInt(movieId));
      cleanedCooldowns[movieId] = timestamp;
    }
  });
  
  // Save cleaned data
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedCooldowns));
  return recentMovies;
};

export const clearCooldowns = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};