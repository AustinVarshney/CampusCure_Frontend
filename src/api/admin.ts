import { AdminLevel, Complaint, User } from "@/types";
import { api } from "./auth";

export interface AdminProfile {
  id: string;
  userId: string;
  adminLevel: AdminLevel;
  manageUsers: boolean;
  manageComplaints: boolean;
  manageDoubts: boolean;
  viewAnalytics: boolean;
  assignedDepartments: string[];
  allowedCategories: string[];
  complaintsAssigned: number;
  complaintsClosed: number;
  usersManaged: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  };
}

export const updateAdminProfile = async (payload: {
  name: string;
}): Promise<void> => {
  try {
    await api.put("/admin/me", payload);
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to update admin profile";
    throw new Error(message);
  }
};

export const getAdminProfile = async (): Promise<AdminProfile> => {
  try {
    const response = await api.get("/admin/me");
    return response.data.profile;
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to fetch admin profile";
    throw new Error(message);
  }
};

export interface DashboardStats {
  stats: {
    totalComplaints: number;
    resolvedComplaints: number;
    raisedComplaints: number;
    totalDoubts: number;
  };
  analytics: {
    complaintsByMonth: Array<{
      month: string;
      complaints: number;
      resolved: number;
    }>;
    complaintsByType: Array<{ name: string; value: number }>;
    complaintsByDept: Array<{ dept: string; count: number }>;
  };
  complaints: Array<{ id: string; status: string; createdAt: string }>;
}

export interface AnalyticsData {
  complaintsByMonth: Array<{
    month: string;
    complaints: number;
    resolved: number;
  }>;
  resolutionTime: Array<{ month: string; avgDays: number }>;
  complaintsByDept: Array<{ dept: string; count: number }>;
  complaintsByType: Array<{ name: string; value: number }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get("/admin/dashboard");
    return response.data;
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to fetch dashboard stats";
    throw new Error(message);
  }
};

export const getAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const response = await api.get("/admin/analytics");
    return response.data;
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to fetch analytics data";
    throw new Error(message);
  }
};

export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await api.get("/admin/complaints");
    return response.data.complaints;
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to fetch complaints";
    throw new Error(message);
  }
};

export const getApprovedFaculty = async (): Promise<User[]> => {
  try {
    const response = await api.get("/admin/faculty");
    console.log("Approved faculty response:", response.data);
    return response.data.faculty;
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to fetch faculty list";
    throw new Error(message);
  }
};

export const assignComplaint = async (
  complaintId: string,
  facultyId: string,
): Promise<void> => {
  try {
    await api.post("/admin/complaints/assign", { complaintId, facultyId });
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to assign complaint";
    throw new Error(message);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/admin/users");
    console.log("All users response:", response.data);
    return response.data.users;
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to fetch users";
    throw new Error(message);
  }
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: string,
  resolutionNote?: string,
): Promise<void> => {
  try {
    await api.put("/admin/complaints/status", {
      complaintId,
      status,
      resolutionNote,
    });
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to update complaint status";
    throw new Error(message);
  }
};

export const toggleUserActiveStatus = async (
  userId: string,
  isActive: boolean,
): Promise<void> => {
  try {
    await api.put(`/admin/users/${userId}/active`, { isActive });
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to toggle user active status";
    throw new Error(message);
  }
};

export const updateUserApprovalStatus = async (
  userId: string,
  approvalStatus: string,
): Promise<void> => {
  try {
    await api.put(`/admin/users/${userId}/approval`, { approvalStatus });
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "data" in e.response &&
      e.response.data &&
      typeof e.response.data === "object" &&
      "error" in e.response.data
        ? String((e.response.data as { error: string }).error)
        : "Failed to update user approval status";
    throw new Error(message);
  }
};

export interface SuperAdminStats {
  stats: {
    totalStudents: number;
    totalFaculty: number;
    totalAdmins: number;
    pendingStudents: number;
    pendingFaculty: number;
    pendingAdmins: number;
    totalComplaints: number;
    resolvedComplaints: number;
    totalDoubts: number;
    resolutionRate: number;
  };
  adminProfiles: Array<{
    id: string;
    adminLevel: AdminLevel;
    manageUsers: boolean;
    manageComplaints: boolean;
    manageDoubts: boolean;
    viewAnalytics: boolean;
    assignedDepartments: string[];
    allowedCategories: string[];
    complaintsAssigned: number;
    complaintsClosed: number;
    usersManaged: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      approvalStatus: string;
      isActive: boolean;
      createdAt: string;
    };
  }>;
}

export interface SuperAdminSettings {
  departments: string[];
  allowedCategories: string[];
  doubtSubjects: string[];
}

const apiError = (e: unknown, fallback: string): Error => {
  const msg =
    e &&
    typeof e === "object" &&
    "response" in e &&
    (e as { response?: { data?: { error?: string } } }).response?.data?.error;
  return new Error(msg ? String(msg) : fallback);
};

export const getSuperAdminStats = async (): Promise<SuperAdminStats> => {
  try {
    const response = await api.get("/admin/super/stats");
    return response.data;
  } catch (e) {
    throw apiError(e, "Failed to fetch super admin stats");
  }
};

export const getSuperAdminSettings = async (): Promise<SuperAdminSettings> => {
  try {
    const response = await api.get("/admin/super/settings");
    return response.data.settings;
  } catch (e) {
    throw apiError(e, "Failed to fetch system settings");
  }
};

export const updateSuperAdminSettings = async (
  payload: SuperAdminSettings,
): Promise<SuperAdminSettings> => {
  try {
    const response = await api.put("/admin/super/settings", payload);
    return response.data.settings;
  } catch (e) {
    throw apiError(e, "Failed to update system settings");
  }
};

export const getPendingAdmins = async (): Promise<User[]> => {
  try {
    const response = await api.get("/admin/pending/admins");
    return response.data.pendingAdmins;
  } catch (e) {
    throw apiError(e, "Failed to fetch pending admins");
  }
};

export const updateAdminPermissions = async (
  adminProfileId: string,
  permissions: {
    manageUsers?: boolean;
    manageComplaints?: boolean;
    manageDoubts?: boolean;
    viewAnalytics?: boolean;
    assignedDepartments?: string[];
    allowedCategories?: string[];
  },
): Promise<void> => {
  try {
    await api.put(`/admin/permissions/${adminProfileId}`, permissions);
  } catch (e) {
    throw apiError(e, "Failed to update admin permissions");
  }
};
