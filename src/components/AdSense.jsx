import { useEffect, useRef, useState } from 'react';

let adCounter = 0;

/**
 * Mobile-optimized banner ad with fixed size (320x50)
 * Uses standard IAB mobile banner size for better fill rates
 * Properly handles navigation and remounting
 */
export default function AdSense() {
  const adRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [adKey] = useState(() => `adsense-banner-${++adCounter}-${Date.now()}`);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const timer = setTimeout(() => {
      if (adRef.current && !isLoadedRef.current) {
        try {
          if (!adRef.current.hasChildNodes() || adRef.current.innerHTML === '') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isLoadedRef.current = true;
          }
        } catch (e) {
          console.error('AdSense error:', e);
        }
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Use fixed standard sizes
  const adSize = isMobile 
    ? { width: '320px', height: '50px' }  // Standard mobile banner
    : { width: '728px', height: '90px' }; // Standard leaderboard

  return (
    <div className='w-full flex justify-center items-center overflow-hidden' style={{ minHeight: adSize.height, maxHeight: adSize.height }}>
      <ins 
        key={adKey}
        ref={adRef}
        className="adsbygoogle"
        style={{ 
          display: 'inline-block',
          width: adSize.width,
          height: adSize.height
        }}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
      />
    </div>
  );
}
