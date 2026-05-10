import React, { useEffect, useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export default function PixelTrail() {
  if (Platform.OS !== 'web') return null;
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const pixel = document.createElement('div');
      pixel.className = 'pixel-trail-dot';
      // Center the 10x10 pixel exactly on cursor
      pixel.style.left = \`\${e.clientX - 5}px\`;
      pixel.style.top = \`\${e.clientY - 5}px\`;
      containerRef.current.appendChild(pixel);

      setTimeout(() => {
        if (containerRef.current && containerRef.current.contains(pixel)) {
          pixel.remove();
        }
      }, 600);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents="none">
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'absolute' }} />
    </View>
  );
}
