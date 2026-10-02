import PageLoader from "@/components/PageLoader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import ErrorBoundary from "@/components/app/ErrorBoundary";
import { buildAntdTheme } from "@/theme/antdTheme";
import { StyleProvider } from "@ant-design/cssinjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { ThemeProvider, useTheme } from "next-themes";
import { lazy, Suspense, useMemo, type ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
const SavedDoubts = lazy(() => import("@/pages/student/SavedDoubts"));
const ReputationPage = lazy(() => import("@/pages/student/ReputationPage"));
const MyComplaints = lazy(() => import("@/pages/student/MyComplaints"));
const RaiseComplaint = lazy(() => import("@/pages/student/RaiseComplaint"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const AdminManagement = lazy(() => import("@/pages/superadmin/AdminManagement"));
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/SuperAdminDashboard"));
const SuperAdminComplaints = lazy(() => import("@/pages/superadmin/SuperAdminComplaints"));
const SystemSettings = lazy(() => import("@/pages/superadmin/SystemSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/shared/ProfilePage"));
// CC-27: one page, mounted under every role - the directory is for everyone.
const StaffDirectory = lazy(() => import("./pages/shared/StaffDirectory"));

const queryClient = new QueryClient();

/**
 * Keeps AntD in step with the `.dark` class next-themes puts on <html>.
 *
 * AntD is themed through JS tokens rather than CSS variables, so it cannot
 * follow the class on its own — without this the chrome would stay light while
 * everything around it went dark.
 */
const ThemedAntdProvider = ({ children }: { children: ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const theme = useMemo(() => buildAntdTheme(isDark), [isDark]);

  return (
    // `layer` emits AntD's styles into @layer antd; see the layer statement
    // at the top of index.css for why that matters.
    <StyleProvider layer>
      <ConfigProvider theme={theme}>
        {/* AntD's App gives message/notification/modal a context-aware host,
            so they inherit the theme above instead of rendering unstyled. */}
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
};

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    // Without this, switching themes animates every colour on the page at
    // once, which reads as a slow smear rather than a switch.
    disableTransitionOnChange
  >
    <ThemedAntdProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* CC-05: inside the router and the providers, so the fallback can
              still use the theme and the user can navigate away. Mounted
              OUTSIDE Suspense so a failed lazy chunk is caught here rather
              than hanging on the loader forever. */}
          <ErrorBoundary label="route">
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
              <Route path="/student/directory" element={<StaffDirectory />} />
              <Route path="/student/complaints/new" element={<RaiseComplaint />} />
              <Route path="/student/complaints" element={<MyComplaints />} />
              <Route path="/student/doubts" element={<DoubtCommunity />} />
              {/* CC-21: the static segment must be matched before /doubts/:id,
                  the same hazard the backend route ordering guards against. */}
              <Route path="/student/doubts/saved" element={<SavedDoubts />} />
              {/* CC-25: the backend authorizes STUDENT and FACULTY, so both
                  roles get the page rather than only students. */}
              <Route path="/student/reputation" element={<ReputationPage />} />
              <Route path="/student/doubts/:id" element={<DoubtDetail />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']}><AppLayout /></ProtectedRoute>}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/profile" element={<ProfilePage />} />
              <Route path="/faculty/directory" element={<StaffDirectory />} />
              <Route path="/faculty/complaints" element={<FacultyComplaints />} />
              <Route path="/faculty/doubts" element={<FacultyDoubts />} />
              <Route path="/faculty/doubts/:id" element={<FacultyDoubtDetail />} />
              <Route path="/faculty/reputation" element={<ReputationPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AppLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              {/* Analytics page removed: dashboard contains required graphs */}
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
              <Route path="/admin/directory" element={<StaffDirectory />} />
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/complaints" element={<SuperAdminComplaints />} />
              <Route path="/superadmin/admins" element={<AdminManagement />} />
              <Route path="/superadmin/settings" element={<SystemSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemedAntdProvider>
  </ThemeProvider>
);

export default App;