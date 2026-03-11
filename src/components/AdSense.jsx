import { useEffect, useRef, useState } from 'react';

/**
 * Mobile-optimized banner ad with fixed size (320x50)
 * Uses standard IAB mobile banner size for better fill rates
 */
export default function AdSense() {
  const adRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const timer = setTimeout(() => {
      if (adRef.current && !adRef.current.hasChildNodes()) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
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
