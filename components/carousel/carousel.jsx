'use client';

import EmblaCarousel from './embla-carousel';

export default function Carousel() {
  const SLIDES = Array.from({ length: 5 }, (_, i) => i);
  const OPTIONS = { loop: true };

  return <EmblaCarousel slides={SLIDES} options={OPTIONS} />;
}
