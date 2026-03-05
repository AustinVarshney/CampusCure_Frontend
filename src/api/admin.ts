import { Complaint, User } from "@/types";
import { api } from "./auth";

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
