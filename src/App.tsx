import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import Home from './pages/Home'
import Search from './pages/Search'
import VAProfile from './pages/VAProfile'
import VASignup from './pages/VASignup'
import ClientSignup from './pages/ClientSignup'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/va/:id" element={<VAProfile />} />
          <Route path="/va/signup" element={<VASignup />} />
          <Route path="/client/signup" element={<ClientSignup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
