/**
 * AudioErrorBoundary Component
 * ErrorBoundary spécialisé pour les erreurs audio avec fallback UX
 */

import { ErrorBoundary } from './ErrorBoundary'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const AudioFallback = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 'var(--spacing-8)',
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-family-mono)',
    }}
  >
    <div
      style={{
        maxWidth: '600px',
        padding: 'var(--spacing-8)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-error)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--font-size-xl)',
          color: 'var(--color-error)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        🔇 Audio Error
      </h1>

      <p
        style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-6)',
          lineHeight: 'var(--line-height-relaxed)',
        }}
      >
        The audio engine encountered an error and needs to be restarted.
      </p>

      <div
        style={{
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-6)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-tertiary)',
          textAlign: 'left',
        }}
      >
        <strong style={{ color: 'var(--color-warning)' }}>Common causes:</strong>
        <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-6)' }}>
          <li>Browser doesn't support Web Audio API</li>
          <li>Audio context was interrupted</li>
          <li>Too many audio nodes active</li>
          <li>Insufficient system resources</li>
        </ul>
      </div>

      <button
        onClick={() => { window.location.reload(); }}
        style={{
          padding: 'var(--spacing-3) var(--spacing-6)',
          backgroundColor: 'transparent',
          color: 'var(--color-trace-primary)',
          border: '2px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-size-sm)',
          cursor: 'pointer',
          transition: 'var(--transition-all)',
          minHeight: 'var(--touch-target-min)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-hover)'
          e.currentTarget.style.boxShadow = '0 0 8px var(--color-trace-glow)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        Restart Audio Engine
      </button>
    </div>
  </div>
)

export function AudioErrorBoundary({ children }: Props) {
  return <ErrorBoundary fallback={<AudioFallback />}>{children}</ErrorBoundary>
}
