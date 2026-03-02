export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ComplaintStatus =
  | "RAISED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type AdminLevel = "NORMAL" | "SUPER";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  department: string;
  year?: number;
  section?: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  designation?: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  adminLevel: AdminLevel;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  type: string;
  category?: string;
  status: ComplaintStatus;
  classroomNumber: string;
  block: string;
  priority?: number;
  raisedBy: string;
  assignedTo?: string;
  resolutionNote?: string;
  feedbackRating?: number;
  createdAt: string;
  updatedAt: string;
}

export type DoubtStatus = "OPEN" | "ANSWERED" | "RESOLVED";

export interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  labels?: string[];
  status: DoubtStatus;
  postedBy: string; // studentId
  upVoteCount: number;
  answerCount: number;
  views: number;
  answered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  doubtId: string;
  content: string;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// Department list
export const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
];
