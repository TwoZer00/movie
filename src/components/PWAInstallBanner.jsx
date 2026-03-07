import { useState, useEffect } from 'react';
import { isPWA, canInstallPWA, showInstallPrompt } from '../utils/pwa';

export default function PWAInstallBanner({ streak, onInstall }) {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Show banner conditions
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    const shouldShow = canInstallPWA() && 
                      deferredPrompt && 
                      !dismissed && 
                      (streak >= 3 || localStorage.getItem('gameStats'));
    
    setShowBanner(shouldShow);
  }, [streak, deferredPrompt]);

  const handleInstall = async () => {
    const installed = await showInstallPrompt(deferredPrompt);
    if (installed) {
      setShowBanner(false);
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className='fixed bottom-4 left-4 right-4 bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto'>
      <div className='flex items-start gap-3'>
        <span className='text-2xl'>📱</span>
        <div className='flex-1'>
          <h3 className='font-bold text-sm mb-1'>Install Filmdle App</h3>
          <p className='text-xs opacity-90 mb-3'>
            {streak >= 3 
              ? `Keep your ${streak}-day streak going! Get notifications for daily challenges.`
              : 'Get notifications and faster access to daily challenges!'
            }
          </p>
          <div className='flex gap-2'>
            <button 
              onClick={handleInstall}
              className='bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-semibold'
            >
              Install
            </button>
            <button 
              onClick={handleDismiss}
              className='bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs'
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}