'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, Edit3, List, BarChart2, Share2, Settings, LogOut } from 'lucide-react'
import { BrandSelector } from './BrandSelector'
import { createClient } from '@/lib/supabase/client'
import type { Organization, MemberRole } from '@/types'

interface Props {
  currentOrg: Organization
  allOrgs: Organization[]
  currentOrgSlug: string
  userRole: MemberRole
  userEmail: string
}

const NAV_ITEMS = [
  { label: 'Calendario', path: 'calendario', icon: Calendar, writeOnly: false, adminOnly: false },
  { label: 'Componer', path: 'componer', icon: Edit3, writeOnly: true, adminOnly: false },
  { label: 'Cola / DLQ', path: 'cola', icon: List, writeOnly: false, adminOnly: false },
  { label: 'Métricas', path: 'metricas', icon: BarChart2, writeOnly: false, adminOnly: false },
  { label: 'Cuentas', path: 'cuentas', icon: Share2, writeOnly: false, adminOnly: false },
  { label: 'Ajustes', path: 'ajustes', icon: Settings, writeOnly: false, adminOnly: true },
] as const

const ROLE_LABEL: Record<MemberRole, string> = {
  admin: 'Administrador',
  member: 'Miembro',
  client_readonly: 'Solo lectura',
}

export function Sidebar({ currentOrg, allOrgs, currentOrgSlug, userRole, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isReadOnly = userRole === 'client_readonly'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav
      className="w-sidebar flex-shrink-0 bg-base border-r border-edge flex flex-col h-full"
      aria-label="Navegación principal"
    >
      {/* Brand selector */}
      <BrandSelector currentOrg={currentOrg} allOrgs={allOrgs} />

      {/* Nav items */}
      <div className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.writeOnly && isReadOnly) return null
          if (item.adminOnly && userRole !== 'admin') return null

          const href = `/app/${currentOrgSlug}/${item.path}`
          const isActive = pathname.startsWith(href)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={href}
              className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand-hover border-l-2 border-brand -ml-px rounded-l-none pl-[calc(0.75rem+1px)]'
                  : 'text-ink-secondary hover:bg-base-elevated hover:text-ink-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}

        {isReadOnly && (
          <div className="mx-3 mt-4">
            <span className="inline-flex items-center text-xs text-ink-disabled bg-base-panel border border-edge rounded px-2 py-1">
              Vista de solo lectura
            </span>
          </div>
        )}
      </div>

      {/* User + logout */}
      <div className="border-t border-edge p-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-xs font-medium text-brand-hover">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-primary truncate">{userEmail}</p>
            <p className="text-xs text-ink-disabled">{ROLE_LABEL[userRole]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-ink-secondary hover:text-status-failed hover:bg-status-failed/10 rounded-md transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
