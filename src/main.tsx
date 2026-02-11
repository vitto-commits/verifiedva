import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'
import { initSentry } from './lib/sentry'
import './index.css'
import App from './App.tsx'

// Initialize Sentry before rendering
initSentry()

// Error Fallback UI
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-600 mb-6">
          We've been notified and are working on a fix. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Refresh Page
        </button>
        {import.meta.env.DEV && (
          <pre className="mt-6 p-4 bg-red-50 text-red-700 text-left text-xs rounded-lg overflow-auto">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={({ error }) => <ErrorFallback error={error as Error} />}>
        <App />
      </Sentry.ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
