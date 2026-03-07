export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && !isPWA();
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  
  const permission = await Notification.requestPermission();
  localStorage.setItem('notificationPermission', permission);
  return permission === 'granted';
};

export const hasNotificationPermission = () => {
  return Notification.permission === 'granted';
};

export const showInstallPrompt = (deferredPrompt) => {
  if (!deferredPrompt) return false;
  
  deferredPrompt.prompt();
  return deferredPrompt.userChoice.then((choiceResult) => {
    return choiceResult.outcome === 'accepted';
  });
};