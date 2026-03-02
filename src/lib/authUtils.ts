import { AdminLevel, UserRole } from "@/types";

export const getAdminLevel = (_userId: string): AdminLevel => {
  // This will be fetched from the backend in the future
  // For now, return NORMAL as default
  return "NORMAL";
};

export const getRoleRedirect = (role: UserRole, userId?: string): string => {
  if (role === "ADMIN") {
    const level = userId ? getAdminLevel(userId) : "NORMAL";
    return level === "SUPER" ? "/superadmin/dashboard" : "/admin/dashboard";
  }
  const map: Record<UserRole, string> = {
    STUDENT: "/student/dashboard",
    FACULTY: "/faculty/dashboard",
    ADMIN: "/admin/dashboard",
  };
  return map[role];
};
