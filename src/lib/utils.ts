import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: fmt.includes('yyyy') ? 'numeric' : undefined,
  })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function calcBackoff(attempts: number, baseSeconds: number): Date {
  const delay = baseSeconds * Math.pow(2, attempts - 1)
  const capped = Math.min(delay, 3600)
  return new Date(Date.now() + capped * 1000)
}
