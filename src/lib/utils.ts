import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function calculateAccountAgeYears(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  return Math.round(diffYears * 10) / 10;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isLateNight(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 23 || hour < 5;
}

export function isAbandoned(updatedAt: string, months: number = 6): boolean {
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffMonths = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return diffMonths > months;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function extractCommitMessages(payload: { commits?: Array<{ message: string }> }): string[] {
  if (!payload.commits) return [];
  return payload.commits.map((c) => c.message);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}