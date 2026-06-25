import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Social Scheduler — Agenda Editorial',
  description: 'Plataforma de programación y publicación en redes sociales para agencias de marketing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-base text-ink-primary antialiased">{children}</body>
    </html>
  )
}
