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
  type?: string;
  category?: string;
  status: ComplaintStatus;
  classroomNumber: string;
  block: string;
  priority?: number;
  raisedBy: {
    id: string;
    name: string;
    email: string;
    studentProfile?: {
      enrollmentNumber: string;
      department: string;
      branch: string;
    } | null;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    facultyProfile?: {
      department: string;
    } | null;
  } | null;
  resolutionNote?: string;
  feedbackRating?: number;
  createdAt: string;
  updatedAt: string;
}

export type DoubtStatus = "OPEN" | "ANSWERED" | "RESOLVED";
export type Subject = "DSA" | "DBMS" | "OS" | "NETWORKS";

export interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  semester: number;
  labels: string[];
  status: DoubtStatus;
  postedById: string;
  postedBy: {
    id: string;
    name: string;
    username: string;
    studentProfile?: {
      semester: number;
      branch: string;
    };
    facultyProfile?: {
      department: string;
    };
  };
  upVoteCount: number;
  answerCount: number;
  views: number;
  acceptedAnswerId?: string | null;
  edited: boolean;
  editHistory?: { title?: string; description?: string; editedAt: string }[];
  answers?: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  doubtId: string;
  content: string;
  answeredById: string;
  answeredBy: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
    facultyProfile?: {
      department: string;
      subjects: string[];
    };
    studentProfile?: {
      semester: number;
      branch: string;
    };
  };
  upvotes: number;
  isVerified: boolean;
  isAccepted: boolean;
  edited: boolean;
  editHistory?: { content: string; editedAt: string }[];
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
