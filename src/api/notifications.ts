import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Notification {
  id: string;
  type:
    | "COMPLAINT_STATUS_UPDATE"
    | "COMPLAINT_ASSIGNED"
    | "DOUBT_ANSWER"
    | "DOUBT_ACCEPTED"
    | "ANSWER_UPVOTED"
    | "GENERAL";
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

// Get user notifications
export const getNotifications = async (
  limit?: number,
): Promise<NotificationsResponse> => {
  const url = limit
    ? `/api/notifications?limit=${limit}`
    : "/api/notifications";
  const response = await api.get<NotificationsResponse>(url);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get<UnreadCountResponse>(
    "/api/notifications/unread-count",
  );
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/api/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await api.patch("/api/notifications/mark-all-read");
};

// Test endpoint to create a sample notification
export const createTestNotification = async (): Promise<void> => {
  console.log("Frontend: Creating test notification...");
  const response = await api.post("/api/notifications/test");
  console.log("Frontend: Test notification response:", response.data);
};

// Utility function to determine where a notification should navigate to
export const getNotificationRoute = (
  notification: Notification,
  userRole: string,
): string | null => {
  const { type, data } = notification;

  switch (type) {
    case "COMPLAINT_STATUS_UPDATE":
    case "COMPLAINT_ASSIGNED":
      // Redirect to complaint management based on user role
      if (userRole === "STUDENT") return "/student/complaints";
      if (userRole === "FACULTY") return "/faculty/complaints";
      if (userRole === "SUPER_ADMIN") return "/superadmin/complaints";
      if (userRole === "ADMIN") return "/admin/complaints";
      break;

    case "DOUBT_ANSWER":
    case "DOUBT_ACCEPTED":
    case "ANSWER_UPVOTED": {
      // Redirect to specific doubt if we have the ID
      const doubtId = data?.doubtId as string;
      if (doubtId) {
        if (userRole === "STUDENT") return `/student/doubts/${doubtId}`;
        if (userRole === "FACULTY") return `/faculty/doubts/${doubtId}`;
      }
      // Fallback to doubts list
      if (userRole === "STUDENT") return "/student/doubts";
      if (userRole === "FACULTY") return "/faculty/doubts";
      break;
    }

    case "GENERAL":
      // For general notifications, redirect to dashboard
      if (userRole === "STUDENT") return "/student/dashboard";
      if (userRole === "FACULTY") return "/faculty/dashboard";
      if (userRole === "ADMIN") return "/admin/dashboard";
      if (userRole === "SUPER_ADMIN") return "/superadmin/dashboard";
      break;
  }

  return null;
};
