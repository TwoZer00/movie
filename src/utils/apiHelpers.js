
export async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - wait longer
          await new Promise(resolve => setTimeout(resolve, delay * 2));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export function handleApiError(error) {
  if (error.message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection.';
  }
  if (error.message.includes('429')) {
    return 'Too many requests. Please wait a moment.';
  }
  if (error.message.includes('404')) {
    return 'Resource not found.';
  }
  return 'An error occurred. Please try again.';
}
