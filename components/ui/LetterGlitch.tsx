"use client";

import { useEffect, useRef } from "react";

interface Props {
  glitchColors?: string[]; className?: string; glitchSpeed?: number;
  centerVignette?: boolean; outerVignette?: boolean; smooth?: boolean; characters?: string;
}
interface Letter { char: string; color: string; targetColor: string; progress: number }

export function LetterGlitch({
  glitchColors = ["#0f259b", "#ffffff", "#ffffff"], className = "", glitchSpeed = 50,
  centerVignette = true, outerVignette = false, smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const lettersRef = useRef<Letter[]>([]);
  const gridRef = useRef({ columns: 0, rows: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const symbols = Array.from(characters);
    const randomChar = () => symbols[Math.floor(Math.random() * symbols.length)];
    const randomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];
    let lastUpdate = Date.now();

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.font = "16px monospace";
      context.textBaseline = "top";
      lettersRef.current.forEach((letter, index) => {
        context.fillStyle = letter.color;
        context.fillText(letter.char, (index % gridRef.current.columns) * 10, Math.floor(index / gridRef.current.columns) * 20);
      });
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      gridRef.current = { columns: Math.ceil(rect.width / 10), rows: Math.ceil(rect.height / 20) };
      lettersRef.current = Array.from({ length: gridRef.current.columns * gridRef.current.rows }, () => ({
        char: randomChar(), color: randomColor(), targetColor: randomColor(), progress: 1,
      }));
      draw();
    };

    const animate = () => {
      if (Date.now() - lastUpdate >= glitchSpeed) {
        const count = Math.max(1, Math.floor(lettersRef.current.length * 0.05));
        for (let i = 0; i < count; i += 1) {
          const letter = lettersRef.current[Math.floor(Math.random() * lettersRef.current.length)];
          if (!letter) continue;
          letter.char = randomChar(); letter.targetColor = randomColor(); letter.progress = smooth ? 0 : 1;
          if (!smooth) letter.color = letter.targetColor;
        }
        lastUpdate = Date.now(); draw();
      }
      if (smooth) {
        lettersRef.current.forEach((letter) => {
          if (letter.progress < 1) {
            letter.progress = Math.min(1, letter.progress + 0.08);
            if (letter.progress >= 1) letter.color = letter.targetColor;
          }
        });
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    resize();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animate();
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(resize, 100); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(timer); if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", onResize); };
  }, [characters, glitchColors, glitchSpeed, smooth]);

  return <div className={`letter-glitch ${className}`} aria-hidden="true">
    <canvas ref={canvasRef} />
    {outerVignette ? <div className="letter-glitch-outer" /> : null}
    {centerVignette ? <div className="letter-glitch-center" /> : null}
  </div>;
}
