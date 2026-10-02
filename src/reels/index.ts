/**
 * Реестр роликов. Каждый смонтированный ролик — папка src/reels/rNN/ с Reel.tsx,
 * и одна строка здесь. Агент добавляет строку сам после «черновик ок».
 *
 *   import * as r01 from "./r01/Reel";
 *   export const REELS: ReelEntry[] = [r01.entry];
 */
import type React from "react";

export type ReelEntry = { id: string; component: React.FC; seconds: number };

export const REELS: ReelEntry[] = [];
