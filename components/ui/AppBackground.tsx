"use client";
import { LetterGlitch } from "@/components/ui/LetterGlitch";
const COLORS = ["#0f259b", "#ffffff", "#ffffff"];
export function AppBackground() {
  return <div className="app-background"><LetterGlitch glitchColors={COLORS} glitchSpeed={50} centerVignette outerVignette={false} smooth /><div className="app-background-overlay" /></div>;
}
