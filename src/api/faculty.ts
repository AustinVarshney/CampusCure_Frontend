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
) => {
  try {
    const response = await api.put(
      `/faculty/complaints/${complaintId}/status`,
      {
        status,
        resolutionNote,
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
}): Promise<Doubt[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.semester) params.append("semester", String(filters.semester));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.myAnswered) params.append("myAnswered", "true");

    const response = await api.get(`/faculty/doubts?${params.toString()}`);
    return response.data.doubts;
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
