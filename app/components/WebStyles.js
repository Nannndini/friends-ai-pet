import { Platform } from 'react-native';

export default function WebStyles() {
  if (Platform.OS !== 'web') return null;
  return (
    <>
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <filter id="decay-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <style type="text/css">{`
      /* Aurora Background (Baby Pink Waves) */
      @keyframes aurora {
        0% { background-position: 50% 50%, 50% 50%; }
        100% { background-position: 350% 50%, 350% 50%; }
      }
      .aurora-bg {
        background-image: repeating-linear-gradient(100deg, #fff0f3 0%, #ffe4e8 20%, #ffffff 40%, #fff0f3 60%);
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
        background: linear-gradient(90deg, #ff6b8a, #ffb3c1);
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
        background: #ffffff;
        z-index: 1;
        border: none !important;
      }
      .star-border::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        background: conic-gradient(transparent, transparent, transparent, #ffb3c1, #ff6b8a, transparent);
        animation: starBorderRotate 4s linear infinite;
        z-index: -1;
      }
      .star-border::after {
        content: '';
        position: absolute;
        top: 2px; left: 2px; right: 2px; bottom: 2px;
        background: #ffffff;
        border-radius: 28px;
        z-index: -1;
      }

      /* Electric Border Animation */
      .electric-border {
        position: relative;
        border-radius: 20px;
        background: #ffffff;
        z-index: 1;
      }
      .electric-border::before {
        content: '';
        position: absolute;
        top: -3px; left: -3px; right: -3px; bottom: -3px;
        background: linear-gradient(45deg, #ff6b8a, #ffb3c1, #ff6b8a, #ffb3c1);
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
        box-shadow: 0 0 15px rgba(255, 107, 138, 0.6);
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
        color: #ffb3c1;
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
        border-color: rgba(255, 107, 138, 0.3) transparent transparent transparent;
        display: block;
        width: 0;
      }

      /* Shimmer Text */
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .shimmer-text {
        background: linear-gradient(90deg, #2d1b2e 0%, #ff6b8a 50%, #2d1b2e 100%);
        background-size: 200% auto;
        color: transparent !important;
        -webkit-background-clip: text;
        background-clip: text;
        animation: shimmer 3s linear infinite;
      }

      /* Glass Morphism */
      .glass-morphism {
        background: rgba(255, 255, 255, 0.8) !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid #ffb3c1 !important;
      }

      /* Gradient Bubble */
      .gradient-bubble {
        background: linear-gradient(135deg, #ff6b8a, #ffb3c1) !important;
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
        background: linear-gradient(45deg, transparent 40%, rgba(255, 107, 138, 0.1) 45%, rgba(255, 107, 138, 0.3) 50%, rgba(255, 107, 138, 0.1) 55%, transparent 60%);
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
        opacity: 0.4;
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
        box-shadow: 0 10px 20px rgba(255, 107, 138, 0.2);
      }

      /* Species Glow */
      .species-card-hover { transition: all 0.2s ease; }
      .species-card-hover:hover {
        transform: scale(1.05);
        background: #fff0f3;
      }
      .species-selected-glow {
        box-shadow: 0 0 20px rgba(255, 107, 138, 0.3) !important;
        border-color: #ff6b8a !important;
        background: #ffe4e8 !important;
      }

      /* Ripple Send */
      .ripple-btn {
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(255, 107, 138, 0.4);
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
        background: linear-gradient(to bottom, #ff6b8a, #ffb3c1);
        opacity: 0.5;
      }
      .timeline-dot {
        position: absolute;
        left: -25px;
        top: 15px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid #ffb3c1;
        z-index: 2;
        transition: transform 0.3s;
      }
      .tilt-hover:hover .timeline-dot {
        transform: scale(1.5);
        background: #ff6b8a;
        border-color: #ff6b8a;
      }

      /* =========================================
         NEW REACTBITS EFFECTS
         ========================================= */

      /* 1. Cubes Background */
      .cubes-container {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        perspective: 1000px;
        overflow: hidden;
        z-index: 0;
      }
      .cube {
        position: absolute;
        width: 60px; height: 60px;
        transform-style: preserve-3d;
        animation: cubeRotate 10s infinite linear;
      }
      .cube div {
        position: absolute; width: 100%; height: 100%;
        background: rgba(255, 107, 138, 0.1);
        border: 1px solid rgba(255, 179, 193, 0.5);
      }
      .cube .front  { transform: translateZ(30px); }
      .cube .back   { transform: rotateY(180deg) translateZ(30px); }
      .cube .right  { transform: rotateY(90deg) translateZ(30px); }
      .cube .left   { transform: rotateY(-90deg) translateZ(30px); }
      .cube .top    { transform: rotateX(90deg) translateZ(30px); }
      .cube .bottom { transform: rotateX(-90deg) translateZ(30px); }
      
      @keyframes cubeRotate {
        0% { transform: translateZ(-100px) rotateX(0deg) rotateY(0deg) translateY(100vh); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateZ(-100px) rotateX(360deg) rotateY(360deg) translateY(-20vh); opacity: 0; }
      }

      /* 2. Letter Glitch */
      @keyframes glitchAnim {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }
      .letter-glitch {
        display: inline-block;
        position: relative;
      }
      .letter-glitch:hover {
        animation: glitchAnim 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        color: #ffb3c1;
        text-shadow: 2px 0 #ff6b8a, -2px 0 #ffffff;
      }

      /* 3. Magic Rings */
      .magic-ring-container {
        position: absolute;
        top: 50%; left: 50%;
        width: 150px; height: 150px;
        transform: translate(-50%, -50%);
        transform-style: preserve-3d;
        pointer-events: none;
      }
      .magic-ring {
        position: absolute;
        width: 100%; height: 100%;
        border-radius: 50%;
        border: 2px solid rgba(255, 179, 193, 0.5);
        border-top: 2px solid #ff6b8a;
      }
      .ring-1 { animation: spinRingX 4s linear infinite; }
      .ring-2 { animation: spinRingY 5s linear infinite; border-top-color: #ffb3c1; }
      .ring-3 { animation: spinRingZ 6s linear infinite; width: 120%; height: 120%; top: -10%; left: -10%; }
      
      @keyframes spinRingX { 100% { transform: rotateX(360deg) rotateY(180deg); } }
      @keyframes spinRingY { 100% { transform: rotateY(360deg) rotateZ(180deg); } }
      @keyframes spinRingZ { 100% { transform: rotateZ(360deg) rotateX(180deg); } }

      /* 4. Decay Card */
      .decay-card {
        transition: all 0.3s ease;
      }
      .decay-card:hover {
        filter: url(#decay-filter);
        transform: scale(0.98);
      }

      /* 5. Pixel Transition Overlay */
      .pixel-grid {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        grid-template-rows: repeat(10, 1fr);
        pointer-events: none;
        z-index: 9999;
      }
      .pixel-cell {
        background: #fff0f3;
        transform-origin: center;
        animation: pixelShrink 0.8s cubic-bezier(0.87, 0, 0.13, 1) forwards;
      }
      @keyframes pixelShrink {
        0% { transform: scale(1.05); border-radius: 0; opacity: 1; }
        50% { border-radius: 50%; opacity: 1; }
        100% { transform: scale(0); opacity: 0; border-radius: 50%; }
      }

      /* 6. Pixel Trail */
      .pixel-trail-dot {
        position: absolute;
        width: 10px; height: 10px;
        background-color: #ffb3c1;
        pointer-events: none;
        animation: trailFade 0.6s cubic-bezier(0.1, 0.9, 0.1, 1) forwards;
        z-index: 9999;
        border-radius: 2px;
      }
      @keyframes trailFade {
        0% { transform: scale(1) translateY(0); opacity: 0.8; }
        100% { transform: scale(0) translateY(15px) rotate(45deg); opacity: 0; }
      }
    `}</style>
    </>
  );
}
