import { useEffect, useRef, useState } from 'react';

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

  return (
    <div className='w-full flex justify-center items-center overflow-hidden' style={{ minHeight: isMobile ? '50px' : '60px', maxHeight: isMobile ? '100px' : '120px' }}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '100%' }}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
