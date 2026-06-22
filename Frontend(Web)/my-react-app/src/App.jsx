import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PitchReview from './pages/PitchReview'
import UserManagement from './pages/UserManagement'
import DealMonitoring from './pages/DealMonitoring'
import MFIWorkflow from './pages/MFIWorkflow'
import RepaymentTracking from './pages/RepaymentTracking'
import Notifications from './pages/Notifications'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pitches" element={<PitchReview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/deals" element={<DealMonitoring />} />
          <Route path="/mfi" element={<MFIWorkflow />} />
          <Route path="/repayments" element={<RepaymentTracking />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App