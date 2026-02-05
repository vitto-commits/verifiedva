import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize if DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    
    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Session replay for debugging
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
    ],
    
    // Don't send PII
    beforeSend(event) {
      // Remove sensitive data
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
      }
      return event;
    },
  });
}

// Export Sentry for manual error capture
export { Sentry };
