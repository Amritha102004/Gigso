import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './features/user/pages/LandingPage';
import RoleSelection from './features/auth/pages/RoleSelection';
import Signup from './features/auth/pages/Signup';
import Login from './features/auth/pages/Login';
import OtpVerification from './features/auth/pages/OtpVerification';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './features/admin/components/AdminLayout';
import OwnersPage from './features/admin/pages/OwnersPage';
import WorkersPage from './features/admin/pages/WorkersPage';
import HomePage from './features/user/pages/HomePage';
import SetupWorkerProfile from './features/worker/pages/SetupWorkerProfile';
import SetupOwnerProfile from './features/owner/pages/SetupOwnerProfile';
import WorkerLayout from './features/worker/components/WorkerLayout';
import WorkerProfilePage from './features/worker/pages/WorkerProfilePage';
import OwnerLayout from './features/owner/components/OwnerLayout';
import OwnerProfilePage from './features/owner/pages/OwnerProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Secure Admin Pathways */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="owners" element={<OwnersPage />} />
              <Route path="workers" element={<WorkersPage />} />
            </Route>
          </Route>

          <Route path="/setup-worker-profile" element={<ProtectedRoute />}>
            <Route index element={<SetupWorkerProfile />} />
          </Route>
          
          <Route path="/setup-owner-profile" element={<ProtectedRoute />}>
            <Route index element={<SetupOwnerProfile />} />
          </Route>

          <Route path="/home" element={<ProtectedRoute requireProfile={true} />}>
             <Route index element={<HomePage />} />
          </Route>

          {/* Worker Pathways */}
          <Route path="/worker" element={<ProtectedRoute requireProfile={true} />}>
            <Route element={<WorkerLayout />}>
              {/* Other worker routes will go here later */}
              <Route path="profile" element={<WorkerProfilePage />} />
            </Route>
          </Route>

          {/* Owner Pathways */}
          <Route path="/owner" element={<ProtectedRoute requireProfile={true} />}>
            <Route element={<OwnerLayout />}>
              {/* Other owner routes will go here later */}
              <Route path="profile" element={<OwnerProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
