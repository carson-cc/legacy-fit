'use client'
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <p className="text-navy/60 mb-3">Something went wrong loading this section.</p>
          <button onClick={() => this.setState({ hasError: false })} className="text-sm text-navy underline">
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
