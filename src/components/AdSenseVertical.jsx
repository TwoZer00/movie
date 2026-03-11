import { useEffect, useRef } from 'react';

export default function AdSenseVertical() {
  const adRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (adRef.current && !adRef.current.hasChildNodes()) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
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
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
      />
    </div>
  );
}
