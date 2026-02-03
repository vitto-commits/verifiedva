import { Link } from 'react-router-dom'
import { Search, Shield } from 'lucide-react'

export default function ClientSignup() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Find Your Perfect VA</h1>
          <p className="text-muted-foreground">Create an account to start browsing verified virtual assistants</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors mb-4">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-foreground">Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Work Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                placeholder="Min 8 characters"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Every VA is verified</p>
              <p className="text-sm text-muted-foreground">ID, education, and references checked before they appear in search.</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms</a> and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
