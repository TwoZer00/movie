import { useEffect, useRef, useState } from 'react';

let adCount = 0;

/**
 * Square ad component with fixed standard IAB sizes
 * Mobile: 300x250 (Medium Rectangle)
 * Desktop: 336x280 (Large Rectangle)
 * Properly handles navigation and remounting
 */
export default function AdSenseSquare() {
  const [adId] = useState(() => `adsense-square-${++adCount}-${Date.now()}`);
  const adRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
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
          console.error('AdSense Square error:', e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fixed standard sizes
  const adSize = isMobile
    ? { width: '300px', height: '250px' }  // Medium Rectangle
    : { width: '336px', height: '280px' }; // Large Rectangle

  return (
    <div className='w-full flex justify-center items-center' style={{ minHeight: adSize.height, maxHeight: adSize.height }}>
      <ins 
        key={adId}
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
