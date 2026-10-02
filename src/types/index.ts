export type UserRole = "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ComplaintStatus =
  | "RAISED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_CONFIRMATION"
  | "ESCALATED_TO_SUPERADMIN"
  | "RESOLVED";

export type AdminLevel = "NORMAL" | "SUPER";

export interface User {
  id: string;
  name: string;
  email: string;
  userID: string;
  university?: string;
  role: UserRole;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  adminProfile?: {
    id: string;
    adminLevel: AdminLevel;
    manageUsers: boolean;
    manageComplaints: boolean;
    manageDoubts: boolean;
    viewAnalytics: boolean;
    assignedDepartments: string[];
    allowedCategories: string[];
  } | null;
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

/** CC-02. Mirrors what the backend returns alongside an entity. */
export interface AttachmentSummary {
  id: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  /** CC-02: evidence photos/PDFs. No URLs — those are signed per view. */
  attachments?: AttachmentSummary[];
  /**
   * CC-30: the "after" half. Uploaded by whoever resolved the complaint, and
   * shown to the student on the screen where they confirm or reject the fix.
   */
  resolutionAttachments?: AttachmentSummary[];
  type?: string;
  category?: string;
  status: ComplaintStatus;
  classroomNumber: string;
  block: string;
  priority?: number;
  escalationCount?: number;
  handledBySuperAdmin?: boolean;
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
  studentRejectionMessage?: string;
  resolutionDate?: string;
  studentConfirmed?: boolean;
  studentConfirmationDate?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  assignedAt?: string;
  pendingConfirmationAt?: string;
  assignmentHistory?: ComplaintAssignmentHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintAssignmentHistoryEntry {
  timestamp: string;
  fromAssigneeId: string | null;
  fromAssigneeName: string | null;
  toAssigneeId: string;
  toAssigneeName: string;
  performedById: string | null;
  performedByRole: string;
  mode: "AUTO" | "ADMIN" | "SUPER_ADMIN";
  note?: string | null;
}

export type DoubtStatus = "OPEN" | "ANSWERED" | "RESOLVED";
export type Subject = string;

export interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  semester: number;
  labels: string[];
  /// CC-20: lookup key for canonical display and filtering. Never rendered.
  labelsNormalized?: string[];
  status: DoubtStatus;
  postedById: string;
  postedBy: {
    id: string;
    name: string;
    userID: string;
    role?: UserRole;
    /** CC-25: shown beside the author so a reader can weigh the source. */
    reputation?: number;
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
  isUpvotedByUser?: boolean;
  /** CC-21. Private to the caller; no count is ever exposed. */
  isBookmarkedByUser?: boolean;
  /** CC-24: files on the doubt itself. Empty while CC-02 is dormant. */
  attachments?: AttachmentSummary[];
  /** CC-23. TEXT rows predate the editor. */
  descriptionFormat?: "TEXT" | "HTML";
  savedAt?: string;
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
  /** CC-24: files on this answer. */
  attachments?: AttachmentSummary[];
  /** CC-23. See Doubt.descriptionFormat. */
  contentFormat?: "TEXT" | "HTML";
  answeredById: string;
  answeredBy: {
    id: string;
    name: string;
    userID: string;
    role: UserRole;
    /** CC-25. */
    reputation?: number;
    facultyProfile?: {
      department: string;
      subjects: string[];
    };
    studentProfile?: {
      semester: number;
      branch: string;
    };
  };
  approvalStatus: ApprovalStatus;
  moderatedBy?: {
    id: string;
    name: string;
    userID: string;
    role: UserRole;
    facultyProfile?: {
      department: string;
      subjects: string[];
    };
  } | null;
  moderatedAt?: string | null;
  moderationNote?: string | null;
  upvotes: number;
  isVerified: boolean;
  isAccepted: boolean;
  isUpvotedByUser?: boolean;
  /** CC-21. Private to the caller; no count is ever exposed. */
  isBookmarkedByUser?: boolean;
  savedAt?: string;
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
  "Computer Engineering",
  "Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Food Engineering",
  "Chemical Engineering",
  "PetroChemical Engineering",
];
