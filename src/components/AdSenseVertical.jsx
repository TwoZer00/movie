import { useEffect, useRef, useState } from 'react';

let adCounter = 0;

/**
 * Vertical sidebar ad component (160x600)
 * Desktop only - hidden on mobile/tablet
 * Properly handles navigation and remounting
 */
export default function AdSenseVertical() {
  const adRef = useRef(null);
  const [adKey] = useState(() => `adsense-vertical-${++adCounter}-${Date.now()}`);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (adRef.current && !isLoadedRef.current) {
        try {
          if (!adRef.current.hasChildNodes() || adRef.current.innerHTML === '') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isLoadedRef.current = true;
          }
        } catch (e) {
          console.error('AdSense Vertical error:', e);
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='flex justify-center items-center'>
      <ins 
        key={adKey}
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
      />
    </div>
  );
}
