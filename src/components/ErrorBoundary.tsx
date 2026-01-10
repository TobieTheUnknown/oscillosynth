/**
 * ErrorBoundary Component
 * Capture les erreurs React et affiche un fallback UI
 */

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              color: 'var(--color-error)',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            ⚠️ Error
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-8)',
              maxWidth: '600px',
              textAlign: 'center',
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
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
            }}
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
