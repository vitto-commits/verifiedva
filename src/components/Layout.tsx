import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

export default function Layout({ children, darkMode, setDarkMode }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${darkMode ? 'border-gray-800 bg-gray-950/95' : 'border-gray-200 bg-white/95'} backdrop-blur`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold">
                V
              </div>
              <span className="text-xl font-bold">VerifiedVA</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/search" 
                className={`text-sm font-medium transition-colors hover:text-sky-500 ${
                  location.pathname === '/search' ? 'text-sky-500' : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Find VAs
              </Link>
              <Link 
                to="/va/signup" 
                className={`text-sm font-medium transition-colors hover:text-sky-500 ${
                  location.pathname === '/va/signup' ? 'text-sky-500' : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Become a VA
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              <Link
                to="/client/signup"
                className="hidden md:inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
              >
                Get Started
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/search"
                className={`block text-sm font-medium hover:text-sky-500 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find VAs
              </Link>
              <Link
                to="/va/signup"
                className={`block text-sm font-medium hover:text-sky-500 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a VA
              </Link>
              <Link
                to="/client/signup"
                className="block w-full text-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className={`border-t mt-auto ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-sky-500 text-white text-xs font-bold">
                V
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>© 2026 VerifiedVA. All rights reserved.</span>
            </div>
            <div className={`flex gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <a href="#" className="hover:text-sky-500">Privacy</a>
              <a href="#" className="hover:text-sky-500">Terms</a>
              <a href="#" className="hover:text-sky-500">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
