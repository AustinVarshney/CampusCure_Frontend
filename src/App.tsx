import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import AdminAnalytics from "@/pages/admin/AdminAnalytics.tsx";
import AdminComplaints from "@/pages/admin/AdminComplaints.tsx";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers.tsx";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import FacultyComplaints from "@/pages/faculty/FacultyComplaints.tsx";
import FacultyDashboard from "@/pages/faculty/FacultyDashboard";
import FacultyDoubts from "@/pages/faculty/FacultyDoubts.tsx";
import LandingPage from "@/pages/LandingPage";
import DoubtCommunity from "@/pages/student/DoubtCommunity";
import DoubtDetail from "@/pages/student/DoubtDetail";
import MyComplaints from "@/pages/student/MyComplaints";
import RaiseComplaint from "@/pages/student/RaiseComplaint";
import StudentDashboard from "@/pages/student/StudentDashboard";
import AdminManagement from "@/pages/superadmin/AdminManagement.tsx";
import SuperAdminDashboard from "@/pages/superadmin/SuperAdminDashboard";
import SystemSettings from "@/pages/superadmin/SystemSettings.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/shared/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><AppLayout /></ProtectedRoute>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/complaints/new" element={<RaiseComplaint />} />
              <Route path="/student/complaints" element={<MyComplaints />} />
              <Route path="/student/doubts" element={<DoubtCommunity />} />
              <Route path="/student/doubts/:id" element={<DoubtDetail />} />
              <Route path="/student/profile" element={<ProfilePage />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']}><AppLayout /></ProtectedRoute>}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/complaints" element={<FacultyComplaints />} />
              <Route path="/faculty/doubts" element={<FacultyDoubts />} />
              <Route path="/faculty/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout /></ProtectedRoute>}>
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;