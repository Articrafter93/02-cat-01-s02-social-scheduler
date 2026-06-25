import { redirect } from 'next/navigation'
import { BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NetworkBadge } from '@/components/ui/NetworkBadge'
import type { SocialAccount, Metrics } from '@/types'

interface Props { params: Promise<{ org: string }> }

export default async function MetricasPage({ params }: Props) {
  const { org: orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()
  if (!org) redirect('/app')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', org.id)
    .single()
  if (!membership) redirect('/app')

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('organization_id', org.id)
    .order('network')

  const { data: metrics } = await supabase
    .from('metrics')
    .select('*')
    .eq('organization_id', org.id)
    .order('date', { ascending: false })
    .limit(90)

  const metricsMap = new Map<string, Metrics[]>()
  for (const m of metrics ?? []) {
    if (!metricsMap.has(m.account_id)) metricsMap.set(m.account_id, [])
    metricsMap.get(m.account_id)!.push(m)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 py-3 border-b border-edge bg-base flex-shrink-0 h-topbar">
        <h1 className="text-base font-semibold text-ink-primary">Métricas</h1>
      </div>
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {(accounts ?? []).length === 0 ? (
          <EmptyState message="No hay cuentas conectadas en esta marca." />
        ) : (
          (accounts as SocialAccount[]).map((acc) => {
            const accMetrics = metricsMap.get(acc.id) ?? []
            return (
              <AccountMetricsPanel key={acc.id} account={acc} metrics={accMetrics} />
            )
          })
        )}
      </div>
    </div>
  )
}

function AccountMetricsPanel({ account, metrics }: { account: SocialAccount; metrics: Metrics[] }) {
  const hasData = metrics.length > 0
  const totals = metrics.reduce(
    (acc, m) => ({
      reach: acc.reach + m.reach,
      impressions: acc.impressions + m.impressions,
      engagement: acc.engagement + m.engagement,
    }),
    { reach: 0, impressions: 0, engagement: 0 }
  )

  return (
    <div className="rounded-lg border border-edge bg-base-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-edge">
        <NetworkBadge network={account.network} />
        <div>
          <p className="text-sm font-medium text-ink-primary">{account.display_name}</p>
          <p className="text-xs text-ink-disabled">{account.handle}</p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <BarChart2 className="w-8 h-8 text-ink-disabled" aria-hidden="true" />
          <p className="text-sm text-ink-secondary">Sin datos todavía</p>
          <p className="text-xs text-ink-disabled">
            Las métricas aparecen cuando se publican posts desde esta cuenta.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Alcance total" value={totals.reach} />
            <MetricCard label="Impresiones" value={totals.impressions} />
            <MetricCard label="Interacciones" value={totals.engagement} />
          </div>
          {/* Last 7 rows */}
          <div>
            <p className="text-xs font-semibold text-ink-disabled mb-2">Últimas 7 entradas</p>
            <div className="space-y-1">
              {metrics.slice(0, 7).map((m) => (
                <div key={m.id} className="flex items-center gap-4 text-xs tabular">
                  <span className="text-ink-disabled w-20 flex-shrink-0">{m.date}</span>
                  <span className="text-ink-secondary flex-1">Alcance: <span className="text-ink-primary">{m.reach.toLocaleString()}</span></span>
                  <span className="text-ink-secondary flex-1">Imp.: <span className="text-ink-primary">{m.impressions.toLocaleString()}</span></span>
                  <span className="text-ink-secondary flex-1">Int.: <span className="text-ink-primary">{m.engagement.toLocaleString()}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-base rounded-lg p-3 border border-edge">
      <p className="text-2xl font-bold text-ink-primary tabular">{value.toLocaleString('es-CO')}</p>
      <p className="text-xs text-ink-secondary mt-0.5">{label}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <BarChart2 className="w-10 h-10 text-ink-disabled" />
      <p className="text-sm text-ink-secondary">{message}</p>
    </div>
  )
}
