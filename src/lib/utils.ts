import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a date into a clean date string e.g. "Oct 11, 2026"
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Formats date & time for messages e.g. "Oct 11, 2026, 01:30 PM"
export function formatTime(date: Date = new Date()): string {
  const dateStr = formatDate(date);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}

// Formats post timestamp with date e.g. "Oct 11, 2026 • 01:30 PM"
export function formatPostDate(createdAt?: string, timestampFallback?: string): string {
  if (createdAt) {
    const parsed = new Date(createdAt);
    if (!isNaN(parsed.getTime())) {
      const dateStr = formatDate(parsed);
      const timeStr = parsed.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${dateStr} • ${timeStr}`;
    }
  }

  if (timestampFallback) {
    if (/[a-zA-Z]{3}\s+\d{1,2}/.test(timestampFallback) || /\d{4}/.test(timestampFallback)) {
      return timestampFallback;
    }
    const now = new Date();
    const dateStr = formatDate(now);
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} • ${timeStr}`;
  }

  const now = new Date();
  return `${formatDate(now)} • ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
}

// Formats message timestamp with date e.g. "Oct 11, 2026, 01:30 PM"
export function formatMessageDate(timestampOrTime?: string): string {
  if (!timestampOrTime) return formatTime();

  if (/[a-zA-Z]{3}\s+\d{1,2}/.test(timestampOrTime) || /\d{4}/.test(timestampOrTime)) {
    return timestampOrTime;
  }

  const now = new Date();
  const dateStr = formatDate(now);
  if (timestampOrTime === 'Just now') {
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  }

  return `${dateStr}, ${timestampOrTime}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
