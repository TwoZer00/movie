export const getDailyStreak = () => {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 30; i++) { // Check last 30 days
    const date = new Date(today - i * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const completed = localStorage.getItem(`daily_${date}`);
    if (completed) {
      streak++;
    } else {
      break; // Streak broken
    }
  }
  
  return streak;
};

export const showStreakNotification = (streak) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  if (streak === 3) {
    new Notification('🔥 3 Day Streak!', {
      body: 'You\'re on fire! Keep it going!',
      icon: '/android-chrome-192x192.png'
    });
  } else if (streak === 7) {
    new Notification('🏆 Week Streak!', {
      body: 'Amazing! 7 days in a row completed!',
      icon: '/android-chrome-192x192.png'
    });
  } else if (streak === 30) {
    new Notification('👑 Month Streak!', {
      body: 'Incredible! 30 days straight!',
      icon: '/android-chrome-192x192.png'
    });
  }
};