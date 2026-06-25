import type { SocialNetwork } from '@/types'

const NET: Record<SocialNetwork, { label: string; color: string; bg: string }> = {
  instagram: { label: 'IG', color: '#e1306c', bg: 'rgba(225,48,108,0.15)' },
  linkedin:  { label: 'LI', color: '#0077b5', bg: 'rgba(0,119,181,0.15)'  },
  facebook:  { label: 'FB', color: '#1877f2', bg: 'rgba(24,119,242,0.15)' },
}

export function NetworkBadge({ network }: { network: SocialNetwork }) {
  const n = NET[network]
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold flex-shrink-0 select-none"
      style={{ background: n.bg, color: n.color }}
      aria-label={network}
      title={network.charAt(0).toUpperCase() + network.slice(1)}
    >
      {n.label}
    </span>
  )
}
