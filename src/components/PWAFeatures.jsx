import { useState, useEffect } from 'react';
import { isPWA, hasNotificationPermission, requestNotificationPermission } from '../utils/pwa';

export default function PWAFeatures() {
  const [showFeatures, setShowFeatures] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setShowFeatures(isPWA());
    setNotificationsEnabled(hasNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      new Notification('🎬 Filmdle Notifications Enabled!', {
        body: 'You\'ll get reminders for daily challenges to keep your streak alive!',
        icon: '/android-chrome-192x192.png'
      });
    }
  };

  if (!showFeatures) return null;

  return (
    <div className='bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg mb-6'>
      <div className='flex items-center gap-3 mb-3'>
        <span className='text-2xl'>🚀</span>
        <div>
          <h3 className='font-bold'>PWA Features Unlocked!</h3>
          <p className='text-sm opacity-90'>Exclusive features for app users</p>
        </div>
      </div>
      
      <div className='space-y-3'>
        <div className='flex items-center justify-between bg-white/10 rounded-lg p-3'>
          <div className='flex items-center gap-2'>
            <span>🔔</span>
            <span className='text-sm font-medium'>Daily Streak Notifications</span>
          </div>
          {notificationsEnabled ? (
            <span className='text-xs bg-white/20 px-2 py-1 rounded'>✓ Enabled</span>
          ) : (
            <button 
              onClick={handleEnableNotifications}
              className='text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-semibold'
            >
              Enable
            </button>
          )}
        </div>
        
        <div className='flex items-center justify-between bg-white/10 rounded-lg p-3'>
          <div className='flex items-center gap-2'>
            <span>⚡</span>
            <span className='text-sm font-medium'>Instant Loading</span>
          </div>
          <span className='text-xs bg-white/20 px-2 py-1 rounded'>✓ Active</span>
        </div>
        
        <div className='flex items-center justify-between bg-white/10 rounded-lg p-3'>
          <div className='flex items-center gap-2'>
            <span>📱</span>
            <span className='text-sm font-medium'>Full Screen Experience</span>
          </div>
          <span className='text-xs bg-white/20 px-2 py-1 rounded'>✓ Active</span>
        </div>
      </div>
    </div>
  );
}