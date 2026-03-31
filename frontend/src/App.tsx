import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/auth/RoleSelection';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import OwnersPage from './pages/admin/OwnersPage';
import WorkersPage from './pages/admin/WorkersPage';

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

          {/* General Platform Authenticated Shell placeholder */}
          <Route path="/home" element={<ProtectedRoute />}>
             <Route index element={<div className="flex bg-[#eeefe9] h-screen items-center justify-center p-8 text-primary font-bold">Standard Authenticated User Portal - To Be Implemented.</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
