import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import {
  IconMenu,
  IconX,
  IconUser,
  IconLogOut,
  IconSearch,
  IconBriefcase,
  IconMessage,
  IconCalendar,
  IconAward,
  IconShield,
  IconUserPlus,
} from './icons'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setIsAdmin(data?.is_admin || false)
    }
    checkAdmin()
  }, [user])

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
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/70">
        <div className="container mx-auto px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 -ml-1 p-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-xs">
                VA
              </div>
              <span className="text-lg sm:text-xl font-bold text-[hsl(var(--primary))]">
                Marketplace
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/search" 
                className={`text-sm font-medium transition-colors hover:text-[hsl(var(--primary))] ${
                  location.pathname === '/search' ? 'text-[hsl(var(--primary))]' : 'text-slate-600'
                }`}
              >
                Find VAs
              </Link>
              <Link 
                to="/va/signup" 
                className={`text-sm font-medium transition-colors hover:text-[hsl(var(--primary))] ${
                  location.pathname === '/va/signup' ? 'text-[hsl(var(--primary))]' : 'text-slate-600'
                }`}
              >
                Become a VA
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {loading ? (
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg p-1.5 sm:px-3 sm:py-2 hover:bg-slate-100 transition-colors active:scale-95"
                  >
                    <div className="h-9 w-9 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-sm font-medium">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm text-slate-700 max-w-[120px] truncate">
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
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-200 mb-2">
                          <div className="font-medium text-slate-900 truncate">
                            {profile?.full_name || 'User'}
                          </div>
                          <div className="text-sm text-slate-500 truncate">
                            {user.email}
                          </div>
                        </div>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <IconUser className="h-5 w-5" />
                          Dashboard
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <IconMessage className="h-5 w-5" />
                          Messages
                        </Link>
                        <Link
                          to="/my-interviews"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <IconCalendar className="h-5 w-5" />
                          My Interviews
                        </Link>
                        {profile?.user_type === 'client' && (
                          <Link
                            to="/my-jobs"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <IconBriefcase className="h-5 w-5" />
                            My Jobs
                          </Link>
                        )}
                        {profile?.user_type === 'va' && (
                          <>
                            <Link
                              to="/jobs"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconSearch className="h-5 w-5" />
                              Browse Jobs
                            </Link>
                            <Link
                              to="/my-applications"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconBriefcase className="h-5 w-5" />
                              My Applications
                            </Link>
                            <Link
                              to="/assessments"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <IconAward className="h-5 w-5" />
                              Skill Assessments
                            </Link>
                          </>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 active:bg-purple-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <IconShield className="h-5 w-5" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-white active:bg-slate-100 w-full"
                        >
                          <IconLogOut className="h-5 w-5" />
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
                    className="hidden md:inline-flex text-sm font-medium text-slate-600 hover:text-white transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/client/signup"
                    className="hidden md:inline-flex items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 -mr-1 rounded-lg hover:bg-white transition-colors active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <IconX className="h-6 w-6" />
                ) : (
                  <IconMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu - Full screen overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[hsl(var(--background))]">
          {/* Header spacer */}
          <div className="h-14" />
          
          {/* Menu content */}
          <div className="flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              <Link
                to="/search"
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                  location.pathname === '/search' 
                    ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                    : 'text-slate-700 hover:bg-white active:bg-slate-100'
                }`}
              >
                <IconSearch className="h-6 w-6" />
                Find VAs
              </Link>
              <Link
                to="/va/signup"
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                  location.pathname === '/va/signup' 
                    ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                    : 'text-slate-700 hover:bg-white active:bg-slate-100'
                }`}
              >
                <IconUserPlus className="h-6 w-6" />
                Become a VA
              </Link>
              
              {user && (
                <>
                  <div className="h-px bg-white my-4" />
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                      location.pathname === '/dashboard' 
                        ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                        : 'text-slate-700 hover:bg-white active:bg-slate-100'
                    }`}
                  >
                    <IconUser className="h-6 w-6" />
                    Dashboard
                  </Link>
                  <Link
                    to="/messages"
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                      location.pathname.startsWith('/messages')
                        ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                        : 'text-slate-700 hover:bg-white active:bg-slate-100'
                    }`}
                  >
                    <IconMessage className="h-6 w-6" />
                    Messages
                  </Link>
                  <Link
                    to="/my-interviews"
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                      location.pathname === '/my-interviews' || location.pathname.startsWith('/book')
                        ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                        : 'text-slate-700 hover:bg-white active:bg-slate-100'
                    }`}
                  >
                    <IconCalendar className="h-6 w-6" />
                    My Interviews
                  </Link>
                  {profile?.user_type === 'client' && (
                    <Link
                      to="/my-jobs"
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                        location.pathname === '/my-jobs' || location.pathname.startsWith('/jobs')
                          ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                          : 'text-slate-700 hover:bg-white active:bg-slate-100'
                      }`}
                    >
                      <IconBriefcase className="h-6 w-6" />
                      My Jobs
                    </Link>
                  )}
                  {profile?.user_type === 'va' && (
                    <>
                      <Link
                        to="/jobs"
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                          location.pathname === '/jobs'
                            ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                            : 'text-slate-700 hover:bg-white active:bg-slate-100'
                        }`}
                      >
                        <IconSearch className="h-6 w-6" />
                        Browse Jobs
                      </Link>
                      <Link
                        to="/my-applications"
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                          location.pathname === '/my-applications'
                            ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                            : 'text-slate-700 hover:bg-white active:bg-slate-100'
                        }`}
                      >
                        <IconBriefcase className="h-6 w-6" />
                        My Applications
                      </Link>
                      <Link
                        to="/assessments"
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                          location.pathname.startsWith('/assessments')
                            ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                            : 'text-slate-700 hover:bg-white active:bg-slate-100'
                        }`}
                      >
                        <IconAward className="h-6 w-6" />
                        Skill Assessments
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t border-slate-200 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 text-slate-600">
                    <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center font-medium text-white">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-white active:bg-slate-100 transition-colors"
                  >
                    <IconLogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/client/signup"
                    className="block w-full text-center rounded-xl bg-[hsl(var(--primary))] px-4 py-3.5 text-base font-medium text-white active:scale-[0.98] transition-transform"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center rounded-xl border border-slate-200 px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-white active:bg-slate-100 transition-colors"
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
      <footer className="border-t border-slate-200 mt-auto bg-white/50">
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-xs">
                  VA
                </div>
                <span className="text-base font-semibold text-slate-900">VA Marketplace</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                Pre-verified Filipino virtual assistants. Browse, review, and hire directly.
              </p>
              <p className="text-sm text-slate-500 mt-4">© 2026 VA Marketplace</p>
            </div>

            {/* Platform */}
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-3">Platform</div>
              <ul className="space-y-2">
                <li>
                  <Link to="/search" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">Find VAs</Link>
                </li>
                <li>
                  <Link to="/va/signup" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">Become a VA</Link>
                </li>
                <li>
                  <Link to="/jobs" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">Browse Jobs</Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">Sign In</Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-3">Company</div>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">About Us</Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">How It Works</Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-3">Legal</div>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]">Terms of Service</Link>
                </li>
                <li>
                  <a
                    href="mailto:support@verticestaffing.com"
                    className="text-sm text-slate-500 hover:text-[hsl(var(--primary))]"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
