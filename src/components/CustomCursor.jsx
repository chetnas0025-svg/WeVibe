import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth fluid trailing position
  const trailPos = useRef({ x: -100, y: -100 });
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive elements
      const target = e.target;
      const isInteractive = target.closest('a, button, input, select, textarea, [role="button"], .card-hover-effect');
      setIsHovered(!!isInteractive);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Smooth linear interpolation animation loop for trailing ring
  useEffect(() => {
    let animFrameId;

    const animate = () => {
      trailPos.current.x += (pos.x - trailPos.current.x) * 0.18;
      trailPos.current.y += (pos.y - trailPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0px) translate(-50%, -50%) scale(${
          isClicked ? 0.75 : isHovered ? 1.6 : 1
        })`;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0px) translate(-50%, -50%) scale(${
          isClicked ? 1.4 : isHovered ? 0.5 : 1
        })`;
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [pos, isHovered, isClicked]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer Fluid Trailing Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-9 h-9 rounded-full border-2 border-gold/70 transition-colors duration-300 pointer-events-none ${
          isHovered
            ? 'border-gold bg-gold/15 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
            : 'border-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Inner Precision Core Dot */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-gold to-gold-dark shadow-md pointer-events-none transition-opacity duration-200 ${
          isHovered ? 'opacity-90' : 'opacity-100'
        }`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
