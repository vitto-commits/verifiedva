import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Search, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
        <div className="container mx-auto px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 -ml-1 p-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-white font-bold text-xs">
                VA
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Marketplace
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/search" 
                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                  location.pathname === '/search' ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                Find VAs
              </Link>
              <Link 
                to="/va/signup" 
                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                  location.pathname === '/va/signup' ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                Become a VA
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {loading ? (
                <div className="h-9 w-9 rounded-full bg-gray-800 animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg p-1.5 sm:px-3 sm:py-2 hover:bg-gray-800 transition-colors active:scale-95"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-medium">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-300 max-w-[120px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>
                  
                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)} 
                      />
                      {/* Menu */}
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900 border border-gray-800 shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-800 mb-2">
                          <div className="font-medium text-white truncate">
                            {profile?.full_name || 'User'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 active:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 active:bg-gray-700 w-full"
                        >
                          <LogOut className="h-5 w-5" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden md:inline-flex text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/client/signup"
                    className="hidden md:inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:from-emerald-600 hover:to-cyan-600 transition-all active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 -mr-1 rounded-lg hover:bg-gray-800 transition-colors active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu - Full screen overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-950">
          {/* Header spacer */}
          <div className="h-14" />
          
          {/* Menu content */}
          <div className="flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              <Link
                to="/search"
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                  location.pathname === '/search' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-gray-300 hover:bg-gray-800 active:bg-gray-700'
                }`}
              >
                <Search className="h-6 w-6" />
                Find VAs
              </Link>
              <Link
                to="/va/signup"
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                  location.pathname === '/va/signup' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-gray-300 hover:bg-gray-800 active:bg-gray-700'
                }`}
              >
                <UserPlus className="h-6 w-6" />
                Become a VA
              </Link>
              
              {user && (
                <>
                  <div className="h-px bg-gray-800 my-4" />
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                      location.pathname === '/dashboard' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-gray-300 hover:bg-gray-800 active:bg-gray-700'
                    }`}
                  >
                    <User className="h-6 w-6" />
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t border-gray-800 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 text-gray-400">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-medium">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/client/signup"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3.5 text-base font-medium text-white active:scale-[0.98] transition-transform"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center rounded-xl border border-gray-700 px-4 py-3.5 text-base font-medium text-gray-300 hover:bg-gray-800 active:bg-gray-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-xs font-bold">
                VA
              </div>
              <span className="text-sm text-gray-400">© 2026 VA Marketplace</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-emerald-400 active:text-emerald-500">Privacy</a>
              <a href="#" className="hover:text-emerald-400 active:text-emerald-500">Terms</a>
              <a href="#" className="hover:text-emerald-400 active:text-emerald-500">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
