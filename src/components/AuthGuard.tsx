import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import Layout from './Layout'

interface AuthGuardProps {
  children: React.ReactNode
  /** Require specific user type (va, client, or any authenticated user if not specified) */
  requireType?: 'va' | 'client'
}

/**
 * Wraps pages that require authentication.
 * Redirects to login if not authenticated.
 * Optionally enforces user type (va/client).
 */
export default function AuthGuard({ children, requireType }: AuthGuardProps) {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login
        navigate('/login', { replace: true })
        return
      }

      if (requireType && profile?.user_type !== requireType) {
        // Wrong user type - redirect to dashboard
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, profile, loading, navigate, requireType])

  // Show loading while checking auth
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  // Not authenticated - return null while redirect happens
  if (!user) {
    return null
  }

  // Wrong user type - return null while redirect happens
  if (requireType && profile?.user_type !== requireType) {
    return null
  }

  // Authenticated and authorized - render children
  return <>{children}</>
}
