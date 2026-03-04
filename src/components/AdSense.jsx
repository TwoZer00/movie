import { useEffect, useRef } from 'react';

export default function AdSense() {
  const adRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (adRef.current && !adRef.current.hasChildNodes()) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ins 
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block', minHeight: '50px', maxHeight: '90px' }}
      data-ad-client="ca-pub-7731037445831235"
      data-ad-slot="5105136682"
      data-ad-format="horizontal"
      data-full-width-responsive="true"
    />
  );
}
