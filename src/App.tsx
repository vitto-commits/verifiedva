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
import Messages from './pages/Messages'
import Conversation from './pages/Conversation'
import BrowseJobs from './pages/BrowseJobs'
import JobApply from './pages/JobApply'
import MyApplications from './pages/MyApplications'
import Availability from './pages/Availability'
import BookInterview from './pages/BookInterview'
import MyInterviews from './pages/MyInterviews'
import VideoIntroUpload from './pages/VideoIntroUpload'
import Assessments from './pages/Assessments'
import TakeAssessment from './pages/TakeAssessment'

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
          <Route path="/jobs/:id/apply" element={<JobApply />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Conversation />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/book/:vaId" element={<BookInterview />} />
          <Route path="/my-interviews" element={<MyInterviews />} />
          <Route path="/video-intro" element={<VideoIntroUpload />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/:skillId" element={<TakeAssessment />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
