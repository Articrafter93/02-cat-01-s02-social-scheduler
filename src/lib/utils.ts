import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A fixed timeZone is pinned so server (UTC on Vercel) and client (browser tz) render
// identical strings — otherwise the SSR/CSR text mismatch triggers React hydration
// error #418. Default matches the app's canonical timezone; callers pass the post's own.
export function formatDate(date: string | Date, fmt = 'dd MMM yyyy', timeZone = 'America/Bogota'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: fmt.includes('yyyy') ? 'numeric' : undefined,
    timeZone,
  })
}

export function formatTime(date: string | Date, timeZone = 'America/Bogota'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
}

export function calcBackoff(attempts: number, baseSeconds: number): Date {
  const delay = baseSeconds * Math.pow(2, attempts - 1)
  const capped = Math.min(delay, 3600)
  return new Date(Date.now() + capped * 1000)
}
