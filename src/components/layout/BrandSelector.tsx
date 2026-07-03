'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Check } from 'lucide-react'
import type { Organization } from '@/types'

interface Props {
  currentOrg: Organization
  allOrgs: Organization[]
}

export function BrandSelector({ currentOrg, allOrgs }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSelect = (org: Organization) => {
    setOpen(false)
    if (org.slug !== currentOrg.slug) {
      router.push(`/app/${org.slug}/calendario`)
      router.refresh()
    }
  }

  return (
    <div className="relative border-b border-edge">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-base-elevated transition-colors text-left"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Active brand: ${currentOrg.name}. Click to switch.`}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: currentOrg.color }}
          aria-hidden="true"
        />
        <span className="flex-1 text-sm font-semibold text-ink-primary truncate">
          {currentOrg.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-secondary transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            aria-label="Select brand"
            className="absolute top-full left-0 right-0 z-20 bg-base-panel border-x border-b border-edge rounded-b-lg shadow-2xl overflow-hidden"
          >
            {allOrgs.map((org) => {
              const isActive = org.id === currentOrg.id
              return (
                <button
                  key={org.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(org)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-base-elevated transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: org.color }}
                    aria-hidden="true"
                  />
                  <span className={`flex-1 ${isActive ? 'text-ink-primary font-medium' : 'text-ink-secondary'}`}>
                    {org.name}
                  </span>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-brand flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
