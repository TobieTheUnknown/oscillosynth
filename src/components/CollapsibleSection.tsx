/**
 * Collapsible Section Component
 * Reusable section with expand/collapse functionality
 */

import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
        style={{
          width: '100%',
          padding: 'var(--spacing-3)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: 'var(--font-size-lg)',
            transition: 'transform 0.2s ease',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div
          style={{
            padding: 'var(--spacing-4)',
            borderTop: '1px solid var(--color-border-primary)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
