import React, { useState, useEffect, useRef } from 'react';

/**
 * HomoX-style custom cursor: a soft glow that follows the mouse.
 * Only active on desktop (no touch); hidden on mobile/touch devices.
 */
const CursorFollower = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const isTouchDevice = () =>
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice()) return;

    const handleMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const animate = () => {
      const target = targetRef.current;
      setPosition((prev) => ({
        x: prev.x + (target.x - prev.x) * 0.12,
        y: prev.y + (target.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        className="cursor-glow"
        style={{
          left: position.x,
          top: position.y,
        }}
        aria-hidden="true"
      />
      <div
        className="cursor-glow-inner"
        style={{
          left: position.x,
          top: position.y,
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default CursorFollower;
