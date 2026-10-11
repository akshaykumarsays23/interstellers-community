'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Shield, RotateCcw, ArrowLeft, Trophy, Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AsteroidDodgeGameProps {
  onBack: () => void;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

interface StarOrb {
  x: number;
  y: number;
  radius: number;
}

export const AsteroidDodgeGame: React.FC<AsteroidDodgeGameProps> = ({ onBack }) => {
  const { recordGameScore } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [timeSurvived, setTimeSurvived] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [earnedCredits, setEarnedCredits] = useState<number>(0);

  const animationFrameRef = useRef<number | null>(null);
  const playerRef = useRef({ x: 200, y: 350, width: 34, height: 34, speed: 6 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const asteroidsRef = useRef<Asteroid[]>([]);
  const starOrbsRef = useRef<StarOrb[]>([]);
  const startTimeRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // Initialize controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeSurvived(0);
    setDifficulty('Easy');
    setGameState('playing');

    const canvas = canvasRef.current;
    if (canvas) {
      playerRef.current.x = canvas.width / 2 - 17;
      playerRef.current.y = canvas.height - 60;
    }

    asteroidsRef.current = [];
    starOrbsRef.current = [];
    startTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();

    loop();
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
    setTimeSurvived(elapsedSeconds);

    // Update Difficulty level
    let currentSpeedMult = 1;
    let diffName = 'Easy';
    if (elapsedSeconds >= 35) {
      diffName = 'Cosmic 🚀';
      currentSpeedMult = 2.4;
    } else if (elapsedSeconds >= 20) {
      diffName = 'Hard ⚡';
      currentSpeedMult = 1.8;
    } else if (elapsedSeconds >= 10) {
      diffName = 'Medium ☄️';
      currentSpeedMult = 1.3;
    }
    setDifficulty(diffName);

    // Increment score continuously
    const currentScore = elapsedSeconds * 100 + starOrbsRef.current.length * 50;
    setScore(currentScore);

    // Move player ship
    const player = playerRef.current;
    if ((keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) && player.x > 0) {
      player.x -= player.speed;
    }
    if ((keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) && player.x < canvas.width - player.width) {
      player.x += player.speed;
    }
    if ((keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) && player.y > 0) {
      player.y -= player.speed;
    }
    if ((keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['S']) && player.y < canvas.height - player.height) {
      player.y += player.speed;
    }

    // Spawn asteroids
    if (now - lastSpawnRef.current > Math.max(300, 1200 / currentSpeedMult)) {
      lastSpawnRef.current = now;
      const size = Math.floor(Math.random() * 26) + 16;
      asteroidsRef.current.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size,
        speed: (Math.random() * 3 + 2.5) * currentSpeedMult,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      });

      // Spawn star energy orb occasionally
      if (Math.random() < 0.3) {
        starOrbsRef.current.push({
          x: Math.random() * (canvas.width - 20) + 10,
          y: -20,
          radius: 8,
        });
      }
    }

    // Clear Canvas
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Background Starfield
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 25; i++) {
      const starX = (i * 37 + elapsedSeconds * 10) % canvas.width;
      const starY = (i * 61 + elapsedSeconds * 25) % canvas.height;
      ctx.fillRect(starX, starY, (i % 3) + 1, (i % 3) + 1);
    }

    // Draw Player Spaceship
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(14, 14);
    ctx.lineTo(0, 8);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill();

    // Thruster glow
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 12, Math.random() * 4 + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Update & Draw Star Orbs
    for (let i = starOrbsRef.current.length - 1; i >= 0; i--) {
      const orb = starOrbsRef.current[i];
      orb.y += 2.5;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();

      // Check collision with player
      const dist = Math.hypot(orb.x - (player.x + 17), orb.y - (player.y + 17));
      if (dist < orb.radius + 17) {
        starOrbsRef.current.splice(i, 1);
        setScore((prev) => prev + 150);
      }
    }

    // Update & Draw Asteroids
    let gameOverTriggered = false;
    for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
      const ast = asteroidsRef.current[i];
      ast.y += ast.speed;
      ast.rotation += ast.rotationSpeed;

      ctx.save();
      ctx.translate(ast.x + ast.size / 2, ast.y + ast.size / 2);
      ctx.rotate(ast.rotation);
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ast.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Collision detection with spaceship
      const dist = Math.hypot(ast.x + ast.size / 2 - (player.x + 17), ast.y + ast.size / 2 - (player.y + 17));
      if (dist < ast.size / 2 + 13) {
        gameOverTriggered = true;
        break;
      }

      // Remove out of bounds asteroids
      if (ast.y > canvas.height + 50) {
        asteroidsRef.current.splice(i, 1);
      }
    }

    if (gameOverTriggered) {
      handleGameOver(currentScore, elapsedSeconds);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const handleGameOver = async (finalScore: number, seconds: number) => {
    setGameState('gameover');
    setScore(finalScore);
    if (finalScore > highScore) setHighScore(finalScore);

    const { xpEarned, starCreditsEarned } = await recordGameScore(
      'asteroid_dodge',
      finalScore,
      `Survived ${seconds}s in ${difficulty} tier`
    );
    setEarnedXP(xpEarned);
    setEarnedCredits(starCreditsEarned);
  };

  // Touch control handlers for mobile responsiveness
  const handleMoveLeft = () => {
    if (playerRef.current.x > 10) playerRef.current.x -= 24;
  };
  const handleMoveRight = () => {
    const canvas = canvasRef.current;
    if (canvas && playerRef.current.x < canvas.width - 40) playerRef.current.x += 24;
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-outline-variant/60 shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arcade</span>
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">☄️ ASTEROID DODGE</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-cyan-400 font-bold">Mode: {difficulty}</span>
          {highScore > 0 && (
            <span className="text-xs text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
              High: {highScore}
            </span>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        {/* Top HUD stats during play */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 px-4 py-2 rounded-2xl bg-surface-container/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
            <div>Score: <span className="text-amber-400 font-mono text-sm">{score}</span></div>
            <div>Time Survived: <span className="text-cyan-400 font-mono text-sm">{timeSurvived}s</span></div>
            <div className="hidden sm:block text-slate-400">Controls: WASD / Arrow Keys</div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={420}
          height={480}
          className="rounded-2xl border-2 border-cyan-500/30 shadow-2xl max-w-full"
        />

        {/* Start Game Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl mb-4 animate-bounce">
              <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Pilot Your Starship!</h3>
            <p className="text-xs text-slate-300 max-w-xs mt-2 leading-relaxed">
              Dodge oncoming asteroid hazards, collect golden star energy orbs, and survive as long as possible across cosmic difficulty tiers.
            </p>
            <button
              onClick={startGame}
              className="mt-6 px-8 py-3 rounded-2xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-all shadow-xl hover:scale-105"
            >
              LAUNCH STARSHIP 🚀
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-rose-500 mb-1">💥 STARSHIP DESTROYED</h3>
            <p className="text-xs text-slate-400">Impact detected in asteroid field!</p>

            <div className="my-6 p-4 rounded-2xl bg-surface-container border border-white/10 w-full max-w-xs flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Final Score</span>
                <span className="text-amber-400 font-extrabold text-base font-mono">{score}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Time Survived</span>
                <span className="text-cyan-400 font-bold">{timeSurvived} seconds</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-around items-center pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-4 h-4" /> +{earnedXP} XP
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Award className="w-4 h-4" /> +{earnedCredits} ⭐
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> RE-LAUNCH
              </button>
              <button
                onClick={onBack}
                className="py-3 px-5 rounded-2xl bg-surface-container-high text-on-surface font-semibold text-xs border border-white/10"
              >
                EXIT
              </button>
            </div>
          </div>
        )}

        {/* Mobile On-Screen Touch Controls */}
        {gameState === 'playing' && (
          <div className="sm:hidden flex items-center gap-6 mt-4 z-10">
            <button
              onClick={handleMoveLeft}
              className="px-6 py-3 rounded-2xl bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 font-bold text-sm"
            >
              ◀ LEFT
            </button>
            <button
              onClick={handleMoveRight}
              className="px-6 py-3 rounded-2xl bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 font-bold text-sm"
            >
              RIGHT ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
