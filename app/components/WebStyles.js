import { Platform } from 'react-native';

export default function WebStyles() {
  if (Platform.OS !== 'web') return null;
  return (
    <style type="text/css">{`
      /* Aurora Background */
      @keyframes aurora {
        0% { background-position: 50% 50%, 50% 50%; }
        100% { background-position: 350% 50%, 350% 50%; }
      }
      .aurora-bg {
        background-image: repeating-linear-gradient(100deg, #1a1a2e 0%, #16213e 20%, #0f3460 40%, #1a1a2e 60%);
        background-size: 200vw 200vh;
        animation: aurora 15s linear infinite;
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

      /* Glow Hover */
      .glow-hover { transition: all 0.3s ease; }
      .glow-hover:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(233, 69, 96, 0.6);
      }

      /* Rainbow Rotating Border */
      @keyframes rotateGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .rainbow-border-card {
        position: relative;
        background: #1a1a2e;
        border-radius: 20px;
        z-index: 1;
        border: none !important;
      }
      .rainbow-border-card::before {
        content: '';
        position: absolute;
        top: -4px; left: -4px; right: -4px; bottom: -4px;
        background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
        background-size: 400%;
        border-radius: 24px;
        z-index: -1;
        animation: rotateGradient 20s linear infinite;
        opacity: 0.8;
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
        border-color: rgba(233, 69, 96, 0.4) transparent transparent transparent;
        display: block;
        width: 0;
      }

      /* Shimmer Text */
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .shimmer-text {
        background: linear-gradient(90deg, #fff 0%, #e94560 50%, #fff 100%);
        background-size: 200% auto;
        color: transparent !important;
        -webkit-background-clip: text;
        background-clip: text;
        animation: shimmer 3s linear infinite;
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
        opacity: 0.3;
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
        box-shadow: 0 10px 20px rgba(0,0,0,0.3), 0 0 15px rgba(233, 69, 96, 0.4);
      }

      /* Species Glow */
      .species-card-hover { transition: all 0.2s ease; }
      .species-card-hover:hover {
        transform: scale(1.05);
        background: rgba(255,255,255,0.15);
      }
      .species-selected-glow {
        box-shadow: 0 0 20px rgba(233, 69, 96, 0.6) !important;
        border-color: #e94560 !important;
      }

      /* Ripple Send */
      .ripple-btn {
        position: relative;
        overflow: hidden;
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
    `}</style>
  );
}
