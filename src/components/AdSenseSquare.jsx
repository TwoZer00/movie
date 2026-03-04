import { useEffect, useRef } from 'react';

let adCount = 0;

export default function AdSenseSquare() {
  const adId = useRef(`adsense-square-${++adCount}-${Date.now()}`);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Silently ignore duplicate ad errors
    }
  }, []);

  return (
    <ins 
      key={adId.current}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-7731037445831235"
      data-ad-slot="5105136682"
      data-ad-format="square"
      data-full-width-responsive="false"
    />
  );
}
