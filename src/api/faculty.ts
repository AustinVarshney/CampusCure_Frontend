import { Answer, Complaint, Doubt } from "@/types";
import { api } from "./auth";

export const getFacultyProfile = async () => {
  try {
    const response = await api.get("/faculty/me");
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
        : "Failed to fetch faculty profile";
    throw new Error(message);
  }
};

export const updateFacultyProfile = async (data: {
  department?: string;
  branch?: string;
  phoneNumber?: string;
  address?: string;
  subjects?: string[];
  isTeaching?: boolean;
}) => {
  try {
    const response = await api.put("/faculty/me", data);
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
        : "Failed to update faculty profile";
    throw new Error(message);
  }
};

// ========== COMPLAINTS ==========

export const assignedComplaints = async () => {
  try {
    const response = await api.get("/faculty/complaints");
    return response.data.complaints as Complaint[];
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
        : "Failed to fetch assigned complaints";
    throw new Error(message);
  }
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: "IN_PROGRESS" | "PENDING_CONFIRMATION",
  resolutionNote?: string,
  /**
   * CC-30: ids of "after" photos, already uploaded with entityType
   * COMPLAINT_RESOLUTION. Accepted only when moving to
   * PENDING_CONFIRMATION - the server rejects them otherwise.
   */
  resolutionAttachmentIds?: string[],
) => {
  try {
    const response = await api.put(
      `/faculty/complaints/${complaintId}/status`,
      {
        status,
        resolutionNote,
        resolutionAttachmentIds,
      },
    );
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
        : "Failed to update complaint status";
    throw new Error(message);
  }
};

// ========== DOUBTS ==========

export const getDoubts = async (filters?: {
  status?: string;
  subject?: string;
  semester?: number;
  search?: string;
  myAnswered?: boolean;
  limit?: number;
}): Promise<Doubt[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.semester) params.append("semester", String(filters.semester));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.myAnswered) params.append("myAnswered", "true");
    if (filters?.limit) params.append("limit", String(filters.limit));

    const response = await api.get(`/faculty/doubts?${params.toString()}`);
    const list = response.data?.doubts;
    return Array.isArray(list) ? list : [];
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
        : "Failed to fetch doubts";
    throw new Error(message);
  }
};

export const getDoubtById = async (id: string): Promise<Doubt> => {
  try {
    const response = await api.get(`/faculty/doubts/${id}`);
    return response.data.doubt;
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
        : "Failed to fetch doubt";
    throw new Error(message);
  }
};

export const upvoteDoubt = async (doubtId: string) => {
  try {
    const response = await api.post(`/faculty/doubts/${doubtId}/upvote`);
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
        : "Failed to upvote doubt";
    throw new Error(message);
  }
};

export const moderateAnswer = async (
  answerId: string,
  data: {
    approvalStatus: "APPROVED" | "REJECTED";
    moderationNote?: string;
  },
) => {
  try {
    const response = await api.put(`/faculty/answers/${answerId}/moderate`, data);
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
        : "Failed to moderate answer";
    throw new Error(message);
  }
};

// ========== ANSWERS ==========

export const postAnswer = async (doubtId: string, content: string) => {
  try {
    const response = await api.post(`/faculty/doubts/${doubtId}/answers`, {
      content,
    });
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
        : "Failed to post answer";
    throw new Error(message);
  }
};

export const editAnswer = async (answerId: string, content: string) => {
  try {
    const response = await api.put(`/faculty/answers/${answerId}`, {
      content,
    });
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
        : "Failed to edit answer";
    throw new Error(message);
  }
};

export const deleteAnswer = async (answerId: string) => {
  try {
    const response = await api.delete(`/faculty/answers/${answerId}`);
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
        : "Failed to delete answer";
    throw new Error(message);
  }
};

export const verifyAnswer = async (answerId: string) => {
  try {
    const response = await api.post(`/faculty/answers/${answerId}/verify`);
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
        : "Failed to verify answer";
    throw new Error(message);
  }
};

export const getMyAnswers = async (): Promise<Answer[]> => {
  try {
    const response = await api.get("/faculty/answers/my");
    return response.data.answers;
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
        : "Failed to fetch my answers";
    throw new Error(message);
  }
};

/* ------------------------------------------------------------------ *
 * CC-12: AI answer drafts (faculty only)
 * ------------------------------------------------------------------ */

export interface AnswerDraftSource {
  answerId: string;
  doubtId: string;
  doubtTitle: string;
  excerpt: string;
}

export interface AnswerDraft {
  id: string;
  content: string;
  model: string;
  createdAt: string;
  sources: AnswerDraftSource[];
}

/**
 * Fetch the pending draft for a doubt, if any.
 *
 * Returns null on any failure: a draft is an assist, and the doubt page must
 * still work when AI is unavailable.
 */
export const getAnswerDraft = async (
  doubtId: string,
): Promise<AnswerDraft | null> => {
  try {
    const response = await api.get(`/faculty/doubts/${doubtId}/draft`);
    return response.data.draft ?? null;
  } catch {
    return null;
  }
};

/** Generate a draft on demand. Returns whether one was created. */
export const generateAnswerDraft = async (
  doubtId: string,
): Promise<{ created: boolean; reason?: string }> => {
  try {
    const response = await api.post(`/faculty/doubts/${doubtId}/draft/generate`);
    return response.data;
  } catch {
    return { created: false, reason: "Draft generation is unavailable" };
  }
};

/**
 * Approve a draft, publishing it as an answer authored by this faculty member.
 * `content` is whatever is on screen, so edits are preserved and the backend
 * can record whether the text was changed.
 */
export const approveAnswerDraft = async (doubtId: string, content: string) => {
  const response = await api.post(`/faculty/doubts/${doubtId}/draft/approve`, {
    content,
  });
  return response.data;
};

export const rejectAnswerDraft = async (doubtId: string, note?: string) => {
  const response = await api.post(`/faculty/doubts/${doubtId}/draft/reject`, {
    note,
  });
  return response.data;
};
