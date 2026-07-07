import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/eventAPI';

const FALLBACK_IMAGES = [
  { src: '/images/blood1.jpg', alt: 'Blood donation saves lives' },
  { src: '/images/blood4.avif', alt: 'LifeLink' },
  { src: '/images/blood5.avif', alt: 'Every drop counts' },
];

const AUTOPLAY_MS = 4500;

/**
 * Sliding image carousel - uses campaign/event images when available.
 */
const ImageSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState(FALLBACK_IMAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // fetch upcoming campaigns/events - use eventAPI which has proper baseURL
    eventAPI.getAllEvents('upcoming')
      .then(resp => {
        if (!mounted) return;
        const events = resp.data || [];
        const baseRaw = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const baseUrl = baseRaw.replace(/\/api\/?$/, '');
        const imgs = events
          .map(ev => {
            if (!ev.imageUrl) return null;
            const src = ev.imageUrl.startsWith('http') ? ev.imageUrl : `${baseUrl}${ev.imageUrl}`;
            return { src, alt: ev.title || ev.description || 'Campaign' };
          })
          .filter(Boolean);
        if (imgs.length > 0) {
          setSlides(imgs);
        }
      })
      .catch(err => {
        // fail silently and keep FALLBACK_IMAGES
        console.warn('Failed to load campaign images for slider', err?.message || err);
      })
      .finally(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!slides || slides.length === 0) return undefined;
    const t = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides]);

  return (
    <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
      <div className="relative aspect-[21/9] min-h-[220px] md:min-h-[320px] bg-gray-900">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${activeIndex * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((img, idx) => (
            <div
              key={`${img.src}-${idx}`}
              className="flex-shrink-0 h-full relative"
              style={{ width: `${100 / slides.length}%` }}
            >
              <div className="relative w-full h-full bg-gray-200">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Loading overlay (small) */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/80"></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageSlider;
