import { useEffect, useRef, useState } from 'react';

let adCount = 0;

export default function AdSenseSquare() {
  const adId = useRef(`adsense-square-${++adCount}-${Date.now()}`);
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
          console.error('AdSense Square error:', e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className='w-full flex justify-center items-center' style={{ minHeight: isMobile ? '250px' : '280px' }}>
      <ins 
        ref={adRef}
        key={adId.current}
        className="adsbygoogle"
        style={{ 
          display: 'inline-block',
          width: isMobile ? '300px' : '336px',
          height: isMobile ? '250px' : '280px',
          maxWidth: '100%'
        }}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
      />
    </div>
  );
}
