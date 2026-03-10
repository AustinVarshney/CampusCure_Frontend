import { AdminLevel, User, UserRole } from "@/types";

export const getAdminLevel = (user?: User | null): AdminLevel => {
  return user?.adminProfile?.adminLevel ?? "NORMAL";
};

export const getRoleRedirect = (role: UserRole, _user?: User | null): string => {
  if (role === "SUPER_ADMIN") return "/superadmin/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  const map: Record<string, string> = {
    STUDENT: "/student/dashboard",
    FACULTY: "/faculty/dashboard",
  };
  return map[role] ?? "/";
};
