import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import VAProfile from './pages/VAProfile'
import VASignup from './pages/VASignup'
import ClientSignup from './pages/ClientSignup'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="dark bg-gray-950 text-gray-100 min-h-screen">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/va/:id" element={<VAProfile />} />
          <Route path="/va/signup" element={<VASignup />} />
          <Route path="/client/signup" element={<ClientSignup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
