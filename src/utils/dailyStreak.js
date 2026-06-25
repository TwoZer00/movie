export const getDailyStreak = () => {
  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayCompleted = localStorage.getItem(`daily_${todayStr}`);
  
  // Start checking from today if completed, otherwise from yesterday
  const startOffset = todayCompleted ? 0 : 1;
  
  for (let i = startOffset; i < 30 + startOffset; i++) {
    const date = new Date(today - i * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const completed = localStorage.getItem(`daily_${date}`);
    if (completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getWeekDays = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  
  const days = [];
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayStr = today.toISOString().split('T')[0];
  
  // Find the first day the user ever played
  const firstPlayed = localStorage.getItem('firstDailyPlayed');
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const completed = !!localStorage.getItem(`daily_${dateStr}`);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    // Only show as missed if user had already started playing before that day
    const wasActivePlayer = firstPlayed && dateStr >= firstPlayed;
    
    days.push({
      label: labels[i],
      date: dateStr,
      completed,
      isToday,
      isFuture,
      missed: !completed && !isToday && !isFuture && wasActivePlayer
    });
  }
  
  return days;
};

export const showStreakNotification = (streak) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  if (streak === 3) {
    new Notification('\ud83d\udd25 3 Day Streak!', {
      body: 'You\'re on fire! Keep it going!',
      icon: '/android-chrome-192x192.png'
    });
  } else if (streak === 7) {
    new Notification('\ud83c\udfc6 Week Streak!', {
      body: 'Amazing! 7 days in a row completed!',
      icon: '/android-chrome-192x192.png'
    });
  } else if (streak === 30) {
    new Notification('\ud83d\udc51 Month Streak!', {
      body: 'Incredible! 30 days straight!',
      icon: '/android-chrome-192x192.png'
    });
  }
};
