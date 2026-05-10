import { Platform } from 'react-native';

export default function WebStyles() {
  if (Platform.OS !== 'web') return null;
  return (
    <style type="text/css">{`
      /* Aurora Background (Purple/Pink Waves) */
      @keyframes aurora {
        0% { background-position: 50% 50%, 50% 50%; }
        100% { background-position: 350% 50%, 350% 50%; }
      }
      .aurora-bg {
        background-image: repeating-linear-gradient(100deg, #0a0a0f 0%, #1a0b2e 20%, #2e0854 40%, #0a0a0f 60%);
        background-size: 200vw 200vh;
        animation: aurora 20s linear infinite;
      }

      /* Blur Text Animation */
      @keyframes blurToClear {
        0% { filter: blur(10px); opacity: 0; transform: scale(1.1); }
        100% { filter: blur(0px); opacity: 1; transform: scale(1); }
      }
      .blur-text-letter {
        display: inline-block;
        animation: blurToClear 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        opacity: 0;
      }

      /* Gradient Text */
      .gradient-text {
        background: linear-gradient(90deg, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
      }

      /* Star Border Animation */
      @keyframes starBorderRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .star-border {
        position: relative;
        overflow: hidden;
        border-radius: 30px;
        background: #13131a;
        z-index: 1;
        border: none !important;
      }
      .star-border::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        background: conic-gradient(transparent, transparent, transparent, #ec4899, #7c3aed, transparent);
        animation: starBorderRotate 4s linear infinite;
        z-index: -1;
      }
      .star-border::after {
        content: '';
        position: absolute;
        top: 2px; left: 2px; right: 2px; bottom: 2px;
        background: #0a0a0f;
        border-radius: 28px;
        z-index: -1;
      }

      /* Electric Border Animation */
      .electric-border {
        position: relative;
        border-radius: 20px;
        background: #13131a;
        z-index: 1;
      }
      .electric-border::before {
        content: '';
        position: absolute;
        top: -3px; left: -3px; right: -3px; bottom: -3px;
        background: linear-gradient(45deg, #7c3aed, #a855f7, #ec4899, #7c3aed);
        background-size: 300%;
        border-radius: 23px;
        z-index: -1;
        animation: rotateGradient 3s linear infinite;
        opacity: 0.8;
      }
      @keyframes rotateGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Glow Hover */
      .glow-hover { transition: all 0.3s ease; }
      .glow-hover:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(124, 58, 237, 0.6);
      }

      /* Sparkles */
      @keyframes floatUpFade {
        0% { transform: translateY(0) scale(0.8); opacity: 0; }
        20% { opacity: 1; transform: translateY(-10px) scale(1.2); }
        100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
      }
      .sparkle {
        position: absolute;
        animation: floatUpFade 2s ease-in infinite;
        pointer-events: none;
        color: #a855f7;
      }

      /* Stats Smooth */
      .stat-smooth {
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Chat Tail */
      .chat-tail {
        position: relative;
        overflow: visible !important;
      }
      .chat-tail::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: rgba(124, 58, 237, 0.3) transparent transparent transparent;
        display: block;
        width: 0;
      }

      /* Shimmer Text */
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .shimmer-text {
        background: linear-gradient(90deg, #fff 0%, #a855f7 50%, #fff 100%);
        background-size: 200% auto;
        color: transparent !important;
        -webkit-background-clip: text;
        background-clip: text;
        animation: shimmer 3s linear infinite;
      }

      /* Glass Morphism */
      .glass-morphism {
        background: rgba(124, 58, 237, 0.1) !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(124, 58, 237, 0.2) !important;
      }

      /* Gradient Bubble */
      .gradient-bubble {
        background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
      }

      /* Holographic Shimmer */
      @keyframes holoShimmer {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 200%; }
      }
      .holographic-shimmer {
        position: relative;
        overflow: hidden;
      }
      .holographic-shimmer::after {
        content: '';
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        background: linear-gradient(45deg, transparent 40%, rgba(236, 72, 153, 0.2) 45%, rgba(124, 58, 237, 0.4) 50%, rgba(236, 72, 153, 0.2) 55%, transparent 60%);
        background-size: 200% 200%;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1;
        pointer-events: none;
      }
      .holographic-shimmer:hover::after {
        opacity: 1;
        animation: holoShimmer 2s linear infinite;
      }

      /* Floating Background Particles */
      @keyframes drift {
        0% { transform: translate(0px, 0px) rotate(0deg); }
        33% { transform: translate(30px, -50px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
        100% { transform: translate(0px, 0px) rotate(360deg); }
      }
      .bg-particle {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.2;
        animation: drift 20s infinite ease-in-out;
        z-index: 0;
      }

      /* Staggered Fade */
      @keyframes slideFadeUp {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .stagger-fade-card {
        animation: slideFadeUp 0.6s ease-out forwards;
        opacity: 0;
      }
      
      /* 3D Tilt Hover */
      .tilt-hover {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .tilt-hover:hover {
        transform: translateY(-5px) scale(1.02) rotateX(5deg) rotateY(-5deg);
      }

      /* Species Glow */
      .species-card-hover { transition: all 0.2s ease; }
      .species-card-hover:hover {
        transform: scale(1.05);
        background: rgba(124, 58, 237, 0.15);
      }
      .species-selected-glow {
        box-shadow: 0 0 20px rgba(124, 58, 237, 0.6) !important;
        border-color: #7c3aed !important;
        background: rgba(124, 58, 237, 0.2) !important;
      }

      /* Ripple Send */
      .ripple-btn {
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
      }
      .ripple-btn::after {
        content: "";
        position: absolute;
        top: 50%; left: 50%;
        width: 5px; height: 5px;
        background: rgba(255,255,255,0.5);
        opacity: 0;
        border-radius: 100%;
        transform: scale(1) translate(-50%, -50%);
        transform-origin: 50% 50%;
      }
      .ripple-btn:active::after {
        animation: ripple 0.6s ease-out;
      }
      @keyframes ripple {
        0% { transform: scale(0) translate(-50%, -50%); opacity: 0.5; }
        100% { transform: scale(20) translate(-50%, -50%); opacity: 0; }
      }
      
      /* Timeline Line */
      .timeline-container {
        position: relative;
        padding-left: 25px;
      }
      .timeline-container::before {
        content: '';
        position: absolute;
        left: 5px;
        top: 20px;
        bottom: 20px;
        width: 2px;
        background: linear-gradient(to bottom, #7c3aed, #ec4899);
        opacity: 0.5;
      }
      .timeline-dot {
        position: absolute;
        left: -25px;
        top: 15px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #0a0a0f;
        border: 2px solid #7c3aed;
        z-index: 2;
        transition: transform 0.3s;
      }
      .tilt-hover:hover .timeline-dot {
        transform: scale(1.5);
        background: #ec4899;
        border-color: #ec4899;
      }
    `}</style>
  );
}
