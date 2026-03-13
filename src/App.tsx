import PageLoader from "@/components/PageLoader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminComplaints = lazy(() => import("@/pages/admin/AdminComplaints"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const FaceLoginPage = lazy(() => import("@/pages/auth/FaceLoginPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const FacultyComplaints = lazy(() => import("@/pages/faculty/FacultyComplaints"));
const FacultyDashboard = lazy(() => import("@/pages/faculty/FacultyDashboard"));
const FacultyDoubtDetail = lazy(() => import("@/pages/faculty/FacultyDoubtDetail"));
const FacultyDoubts = lazy(() => import("@/pages/faculty/FacultyDoubts"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const DoubtCommunity = lazy(() => import("@/pages/student/DoubtCommunity"));
const DoubtDetail = lazy(() => import("@/pages/student/DoubtDetail"));
const MyComplaints = lazy(() => import("@/pages/student/MyComplaints"));
const RaiseComplaint = lazy(() => import("@/pages/student/RaiseComplaint"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const AdminManagement = lazy(() => import("@/pages/superadmin/AdminManagement"));
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/SuperAdminDashboard"));
const SystemSettings = lazy(() => import("@/pages/superadmin/SystemSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/shared/ProfilePage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/face-login" element={<FaceLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><AppLayout /></ProtectedRoute>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/complaints/new" element={<RaiseComplaint />} />
              <Route path="/student/complaints" element={<MyComplaints />} />
              <Route path="/student/doubts" element={<DoubtCommunity />} />
              <Route path="/student/doubts/:id" element={<DoubtDetail />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']}><AppLayout /></ProtectedRoute>}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/profile" element={<ProfilePage />} />
              <Route path="/faculty/complaints" element={<FacultyComplaints />} />
              <Route path="/faculty/doubts" element={<FacultyDoubts />} />
              <Route path="/faculty/doubts/:id" element={<FacultyDoubtDetail />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AppLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/admins" element={<AdminManagement />} />
              <Route path="/superadmin/settings" element={<SystemSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;