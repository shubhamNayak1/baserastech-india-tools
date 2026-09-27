import { useEffect } from 'react';
import { applyHead, type SeoData } from './head';

export function Seo(props: SeoData) {
  const key = JSON.stringify(props);
  useEffect(() => {
    applyHead(JSON.parse(key) as SeoData);
  }, [key]);
  return null;
}
