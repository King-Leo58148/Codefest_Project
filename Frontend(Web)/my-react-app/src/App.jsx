import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import PitchReview from './pages/PitchReview'
import UserManagement from './pages/UserManagement'
import DealMonitoring from './pages/DealMonitoring'
import MFIWorkflow from './pages/MFIWorkflow'
import RepaymentTracking from './pages/RepaymentTracking'
import Notifications from './pages/Notifications'

import CreatePitch from './pages/CreatePitch'
import MyPitches from './pages/MyPitches'
import PitchDetail from './pages/PitchDetail'
import ExplorePitches from './pages/ExplorePitches'
import MyBids from './pages/MyBids'
import MyDeals from './pages/MyDeals'
import DealDetail from './pages/DealDetail'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Shared Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/pitch/:id" element={<PitchDetail />} />
          <Route path="/my-deals" element={<MyDeals />} />
          <Route path="/deal/:id" element={<DealDetail />} />
          
          {/* Admin Routes */}
          <Route path="/pitches" element={<PitchReview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/deals" element={<DealMonitoring />} />
          <Route path="/mfi" element={<MFIWorkflow />} />
          <Route path="/repayments" element={<RepaymentTracking />} />

          {/* Business Owner Routes */}
          <Route path="/create-pitch" element={<CreatePitch />} />
          <Route path="/my-pitches" element={<MyPitches />} />

          {/* Investor Routes */}
          <Route path="/explore" element={<ExplorePitches />} />
          <Route path="/my-bids" element={<MyBids />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App