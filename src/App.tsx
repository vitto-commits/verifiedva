import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import Home from './pages/Home'
import Search from './pages/Search'
import VAProfile from './pages/VAProfile'
import VASignup from './pages/VASignup'
import ClientSignup from './pages/ClientSignup'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MyJobs from './pages/MyJobs'
import CreateJob from './pages/CreateJob'
import JobDetail from './pages/JobDetail'

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
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/jobs/new" element={<CreateJob />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
