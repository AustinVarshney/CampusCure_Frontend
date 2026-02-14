import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import StudentDashboard from "@/pages/student/StudentDashboard";
import FacultyDashboard from "@/pages/faculty/FacultyDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import SuperAdminDashboard from "@/pages/superadmin/SuperAdminDashboard";
import { ConfigProvider } from 'antd';
import AppLayout from "./layouts/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <div className="h-full">
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipPrimitive.Provider delayDuration={0}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><AppLayout /></ProtectedRoute>}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                </Route>

                {/* Faculty Routes */}
                <Route element={<ProtectedRoute allowedRoles={['FACULTY']}><AppLayout /></ProtectedRoute>}>
                  <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AppLayout /></ProtectedRoute>}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                {/* Super Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AppLayout /></ProtectedRoute>}>
                  <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipPrimitive.Provider>
      </QueryClientProvider>
    </ConfigProvider>
  </div>
);

export default App;