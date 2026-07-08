import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './features/user/pages/LandingPage';
import RoleSelection from './features/auth/pages/RoleSelection';
import Signup from './features/auth/pages/Signup';
import Login from './features/auth/pages/Login';
import OtpVerification from './features/auth/pages/OtpVerification';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './features/admin/components/AdminLayout';
import OwnersPage from './features/admin/pages/OwnersPage';
import WorkersPage from './features/admin/pages/WorkersPage';
import CategoriesPage from './features/admin/pages/CategoriesPage';
import AddCategoryPage from './features/admin/pages/AddCategoryPage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminGigsPage from './features/admin/pages/AdminGigsPage';
import AdminGigDetailsPage from './features/admin/pages/AdminGigDetailsPage';
import HomePage from './features/user/pages/HomePage';
import SetupWorkerProfile from './features/worker/pages/SetupWorkerProfile';
import SetupOwnerProfile from './features/owner/pages/SetupOwnerProfile';
import WorkerLayout from './features/worker/components/WorkerLayout';
import WorkerProfilePage from './features/worker/pages/WorkerProfilePage';
import WorkerDashboard from './features/worker/pages/WorkerDashboard';
import BrowseGigsPage from './features/worker/pages/BrowseGigsPage';
import GigDetailPage from './features/worker/pages/GigDetailPage';
import MyGigsPage from './features/worker/pages/MyGigsPage';
import OwnerLayout from './features/owner/components/OwnerLayout';
import OwnerProfilePage from './features/owner/pages/OwnerProfilePage';
import OwnerDashboard from './features/owner/pages/OwnerDashboard';
import GigsPage from './features/owner/pages/GigsPage';
import CreateGigPage from './features/owner/pages/CreateGigPage';
import ViewGigPage from './features/owner/pages/ViewGigPage';
import EditGigPage from './features/owner/pages/EditGigPage';

function App() {
  return (
    <ToastProvider>
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
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="owners" element={<OwnersPage />} />
              <Route path="workers" element={<WorkersPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/add" element={<AddCategoryPage />} />
              <Route path="categories/:categoryId/edit" element={<AddCategoryPage />} />
              <Route path="gigs" element={<AdminGigsPage />} />
              <Route path="gigs/:gigId" element={<AdminGigDetailsPage />} />
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

          <Route path="/worker" element={<ProtectedRoute requireProfile={true} />}>
            <Route element={<WorkerLayout />}>
              <Route path="home" element={<WorkerDashboard />} />
              <Route path="profile" element={<WorkerProfilePage />} />
              <Route path="browse" element={<BrowseGigsPage />} />
              <Route path="my-gigs" element={<MyGigsPage />} />
              <Route path="gigs/:gigId" element={<GigDetailPage />} />
            </Route>
          </Route>

          {/* Owner Pathways */}
          <Route path="/owner" element={<ProtectedRoute requireProfile={true} />}>
            <Route element={<OwnerLayout />}>
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="profile" element={<OwnerProfilePage />} />
              <Route path="gigs" element={<GigsPage />} />
              <Route path="gigs/create" element={<CreateGigPage />} />
              <Route path="gigs/:gigId" element={<ViewGigPage />} />
              <Route path="gigs/:gigId/edit" element={<EditGigPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    <ToastContainer />
    </ToastProvider>
  );
}

export default App;
