/**
 * Staff directory (CC-27).
 *
 * Readable by every authenticated role: the point is that a student with a
 * flooded bathroom can find the plumber rather than filing a complaint and
 * waiting for it to be routed.
 *
 * Only staff who opted in appear. Someone who has not is ABSENT, not listed
 * with their contact hidden — listing them would still confirm they work here
 * and in which department, which is more than they agreed to.
 */
import { api } from "./auth";

export interface StaffDirectoryEntry {
  id: string;
  name: string;
  department: string;
  staffRole: string | null;
  isTeaching: boolean;
  handlesCategories: string[];
  subjects: string[];
  email: string;
  phoneNumber: string | null;
}

export const getStaffDirectory = async (filters: {
  category?: string;
  teaching?: boolean;
  q?: string;
} = {}): Promise<StaffDirectoryEntry[]> => {
  const params: Record<string, string> = {};
  if (filters.category) params.category = filters.category;
  if (typeof filters.teaching === "boolean") {
    params.teaching = String(filters.teaching);
  }
  if (filters.q) params.q = filters.q;

  const { data } = await api.get<{ staff: StaffDirectoryEntry[] }>(
    "/staff/directory",
    { params },
  );
  return data.staff;
};
