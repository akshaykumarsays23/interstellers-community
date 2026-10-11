'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Eye, EyeOff, Zap, ShieldAlert } from 'lucide-react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  decay: number;
  width: number;
  color: string;
}

interface NebulaPoint {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
}

export const SpaceCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [warpActive, setWarpActive] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [showControls, setShowControls] = useState<boolean>(false);

  // Mouse & Target Interactivity States
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    vx: 0,
    vy: 0,
  });

  useEffect(() => {
    // Check local storage preference
    const saved = localStorage.getItem('interstellers_canvas_enabled');
    if (saved !== null) {
      setIsEnabled(saved === 'true');
    }
  }, []);

  const toggleCanvas = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    localStorage.setItem('interstellers_canvas_enabled', String(next));
  };

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    window.addEventListener('resize', handleResize);

    // Track Mouse
    const handleMouseMove = (e: MouseEvent) => {
      const prevX = mouseRef.current.targetX;
      const prevY = mouseRef.current.targetY;

      mouseRef.current.targetX = (e.clientX - width / 2) * 0.4;
      mouseRef.current.targetY = (e.clientY - height / 2) * 0.4;

      mouseRef.current.vx = mouseRef.current.targetX - prevX;
      mouseRef.current.vy = mouseRef.current.targetY - prevY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particle Collections
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let nebulae: NebulaPoint[] = [];

    const STAR_COLORS = ['#ffffff', '#a78bfa', '#38bdf8', '#c084fc', '#fef08a', '#60a5fa', '#e0e7ff'];
    const NEBULA_COLORS = [
      'rgba(124, 58, 237, 0.28)',
      'rgba(14, 165, 233, 0.25)',
      'rgba(236, 72, 153, 0.20)',
      'rgba(99, 102, 241, 0.24)',
    ];

    const initElements = () => {
      // Create Stars with 3D Depth
      const starCount = Math.min(Math.floor((width * height) / 1600), 550);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = Math.random() * 0.75 + 0.25;
        stars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * 1000 + 1,
          size: Math.random() * 2.4 + 0.6,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: Math.random() * 0.04 + 0.008,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }

      // Create Nebula Glow Points
      nebulae = [
        {
          x: width * 0.2,
          y: height * 0.3,
          baseX: width * 0.2,
          baseY: height * 0.3,
          radius: Math.min(width, height) * 0.55,
          color: NEBULA_COLORS[0],
          vx: 0.25,
          vy: 0.15,
        },
        {
          x: width * 0.8,
          y: height * 0.7,
          baseX: width * 0.8,
          baseY: height * 0.7,
          radius: Math.min(width, height) * 0.6,
          color: NEBULA_COLORS[1],
          vx: -0.2,
          vy: -0.25,
        },
        {
          x: width * 0.5,
          y: height * 0.4,
          baseX: width * 0.5,
          baseY: height * 0.4,
          radius: Math.min(width, height) * 0.48,
          color: NEBULA_COLORS[2],
          vx: 0.15,
          vy: -0.18,
        },
      ];
    };

    initElements();

    // Spawn Random Comets / Shooting Stars
    const maybeSpawnShootingStar = () => {
      if (Math.random() < 0.045 && shootingStars.length < 6) {
        shootingStars.push({
          x: Math.random() * width * 1.2 - width * 0.1,
          y: Math.random() * height * 0.4,
          length: Math.random() * 120 + 80,
          speed: Math.random() * 12 + 10,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
          width: Math.random() * 2 + 1,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
    };

    let lastTime = performance.now();
    let frameCount = 0;

    // Main Render Loop
    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      frameCount++;

      if (dt >= 1) {
        setFps(Math.round((frameCount * 1000) / (time - lastTime)));
        frameCount = 0;
        lastTime = time;
      }

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const isDarkMode = document.documentElement.classList.contains('dark');
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Organic Glowing Nebulae
      if (isDarkMode) {
        nebulae.forEach((neb) => {
          neb.x += neb.vx;
          neb.y += neb.vy;

          if (Math.abs(neb.x - neb.baseX) > 80) neb.vx *= -1;
          if (Math.abs(neb.y - neb.baseY) > 80) neb.vy *= -1;

          const gradX = neb.x - mouseRef.current.x * 0.15;
          const gradY = neb.y - mouseRef.current.y * 0.15;

          const gradient = ctx.createRadialGradient(
            gradX,
            gradY,
            0,
            gradX,
            gradY,
            neb.radius
          );
          gradient.addColorStop(0, neb.color);
          gradient.addColorStop(0.7, neb.color.replace(/0\.\d+\)/, '0.03)'));
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(gradX, gradY, neb.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Draw Stars & Apply 3D Parallax Shift
      maybeSpawnShootingStar();
      const speedMultiplier = warpActive ? 6 : 1;

      stars.forEach((star) => {
        // Twinkle effect
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // 3D Perspective Projection
        const k = 400 / star.z;
        const px = (star.x - mouseRef.current.x * (1000 / star.z) * 0.1) * k + width / 2;
        const py = (star.y - mouseRef.current.y * (1000 / star.z) * 0.1) * k + height / 2;

        // Move star forward slowly
        star.z -= 0.3 * speedMultiplier;
        if (star.z <= 1) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        // Only draw if within screen bounds
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.4, (1 - star.z / 1000) * star.size * 2.2);

          ctx.save();
          ctx.globalAlpha = Math.min(1, Math.max(0.1, star.alpha * (isDarkMode ? 1 : 0.6)));

          // Warp Streak Effect
          if (warpActive) {
            const tailLength = (1000 - star.z) * 0.08;
            ctx.strokeStyle = star.color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(
              px - (mouseRef.current.x * 0.02 + 1) * tailLength,
              py - (mouseRef.current.y * 0.02 + 1) * tailLength
            );
            ctx.stroke();
          } else {
            // Star Glow Dot
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();

            // Bright star halo
            if (star.size > 1.4 && isDarkMode) {
              ctx.fillStyle = star.color;
              ctx.globalAlpha = star.alpha * 0.25;
              ctx.beginPath();
              ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.restore();
        }
      });

      // 3. Draw Shooting Stars / Comets
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.x > width + 200 || s.y > height + 200) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, s.color);
        grad.addColorStop(0.3, 'rgba(167, 139, 250, 0.8)');
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing Comet Head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isEnabled, warpActive]);

  return (
    <>
      {/* Background Interactive Space Canvas */}
      {isEnabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-[-10] transition-opacity duration-700 ease-in-out"
          style={{ opacity: 0.98 }}
        />
      )}

      {/* Floating HUD Controller Widget (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2.5 rounded-full bg-surface-container-high/80 border border-outline-variant/60 backdrop-blur-md text-on-surface shadow-card hover:bg-primary hover:text-white transition-all group"
          title="Galactic Environment Controls"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform text-primary group-hover:text-white" />
        </button>

        {showControls && (
          <div className="flex items-center gap-2 bg-surface-container-high/90 border border-outline-variant/70 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-xl animate-in fade-in slide-in-from-left-4 duration-200">
            <button
              onClick={toggleCanvas}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                isEnabled
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isEnabled ? 'Cosmic View ON' : 'Disabled'}</span>
            </button>

            {isEnabled && (
              <button
                onMouseDown={() => setWarpActive(true)}
                onMouseUp={() => setWarpActive(false)}
                onMouseLeave={() => setWarpActive(false)}
                onTouchStart={() => setWarpActive(true)}
                onTouchEnd={() => setWarpActive(false)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                  warpActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-surface-container hover:bg-amber-500/20 text-on-surface'
                }`}
                title="Hold to engage Hyperdrive Warp Speed"
              >
                <Zap className={`w-3.5 h-3.5 ${warpActive ? 'animate-bounce text-black' : 'text-amber-400'}`} />
                <span>{warpActive ? 'WARP SPEED!' : 'Hold Warp'}</span>
              </button>
            )}

            <span className="text-[10px] font-mono text-on-surface-variant/70 pl-1 border-l border-outline-variant/40">
              {fps} FPS
            </span>
          </div>
        )}
      </div>
    </>
  );
};
