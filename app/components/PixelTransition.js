import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export default function PixelTransition() {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents="none">
      <div className="pixel-grid">
        {[...Array(100)].map((_, i) => {
          const delay = Math.random() * 0.4;
          return (
            <div 
              key={i} 
              className="pixel-cell" 
              style={{ animationDelay: `${delay}s` }} 
            />
          );
        })}
      </div>
    </View>
  );
}
