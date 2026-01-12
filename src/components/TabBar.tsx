/**
 * Tab Bar Component
 * Navigation tabs for organizing the synth interface
 */

interface TabBarProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--spacing-2)',
        borderBottom: '2px solid var(--color-border-primary)',
        marginBottom: 'var(--spacing-4)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => {
            onTabChange(tab)
          }}
          style={{
            padding: 'var(--spacing-3) var(--spacing-6)',
            backgroundColor:
              activeTab === tab ? 'var(--color-bg-secondary)' : 'transparent',
            color:
              activeTab === tab
                ? 'var(--color-trace-primary)'
                : 'var(--color-text-secondary)',
            border: 'none',
            borderBottom:
              activeTab === tab
                ? '3px solid var(--color-trace-primary)'
                : '3px solid transparent',
            borderRadius: '0',
            fontSize: 'var(--font-size-md)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textShadow:
              activeTab === tab ? '0 0 8px var(--color-trace-glow)' : 'none',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
