import { Answer, Complaint, Doubt } from "@/types";
import { api } from "./auth";

export interface StudentPostingSettings {
  allowedCategories: string[];
  doubtSubjects: string[];
}

export const getStudentProfile = async () => {
  try {
    const response = await api.get("/students/me");
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
        : "Failed to fetch student profile";
    throw new Error(message);
  }
};

export const updateStudentProfile = async (data: {
  department?: string;
  semester?: number;
  branch?: string;
  phoneNumber?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
}) => {
  try {
    const response = await api.put("/students/me", data);
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
        : "Failed to update student profile";
    throw new Error(message);
  }
};

export const getStudentPostingSettings = async (): Promise<StudentPostingSettings> => {
  try {
    const response = await api.get("/students/settings/posting");
    return response.data.settings;
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
        : "Failed to fetch posting settings";
    throw new Error(message);
  }
};

// ========== COMPLAINTS ==========

export const getComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await api.get("/students/complaints");
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

export const raiseComplaint = async (data: {
  title: string;
  description: string;
  category: string;
  priority: number;
  classroomNumber: string;
  block: string;
}) => {
  try {
    const response = await api.post("/students/complaints/new", data);
    console.log(response.data);
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
        : "Failed to raise complaint";
    throw new Error(message);
  }
};

export const getMyComplaints = async () => {
  try {
    const response = await api.get("/students/complaints");
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
        : "Failed to fetch complaints";
    throw new Error(message);
  }
};

// ========== DOUBTS ==========

export const postDoubt = async (data: {
  title: string;
  description: string;
  subject: string;
  semester: number;
  labels?: string[];
}) => {
  try {
    const response = await api.post("/students/doubts", data);
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
        : "Failed to post doubt";
    throw new Error(message);
  }
};

export const getDoubts = async (filters?: {
  status?: string;
  subject?: string;
  semester?: number;
  search?: string;
}): Promise<Doubt[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.semester) params.append("semester", String(filters.semester));
    if (filters?.search) params.append("search", filters.search);

    const response = await api.get(`/students/doubts?${params.toString()}`);
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
    const response = await api.get(`/students/doubts/${id}`);
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

export const editDoubt = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    subject?: string;
    labels?: string[];
  },
) => {
  try {
    const response = await api.put(`/students/doubts/${id}`, data);
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
        : "Failed to edit doubt";
    throw new Error(message);
  }
};

export const deleteDoubt = async (id: string) => {
  try {
    const response = await api.delete(`/students/doubts/${id}`);
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
        : "Failed to delete doubt";
    throw new Error(message);
  }
};

export const getMyDoubts = async (): Promise<Doubt[]> => {
  try {
    const response = await api.get("/students/doubts/my");
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
        : "Failed to fetch my doubts";
    throw new Error(message);
  }
};

// ========== ANSWERS ==========

export const postAnswer = async (doubtId: string, content: string) => {
  try {
    const response = await api.post(`/students/doubts/${doubtId}/answers`, {
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
    const response = await api.put(`/students/answers/${answerId}`, {
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
    const response = await api.delete(`/students/answers/${answerId}`);
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

export const upvoteAnswer = async (answerId: string) => {
  try {
    const response = await api.post(`/students/answers/${answerId}/upvote`);
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
        : "Failed to upvote answer";
    throw new Error(message);
  }
};

export const markAnswerAsAccepted = async (
  doubtId: string,
  answerId: string,
) => {
  try {
    const response = await api.post(
      `/students/doubts/${doubtId}/answers/${answerId}/accept`,
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
        : "Failed to mark answer as accepted";
    throw new Error(message);
  }
};

export const getMyAnswers = async (): Promise<Answer[]> => {
  try {
    const response = await api.get("/students/answers/my");
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

export const getMyAnswerForDoubt = async (
  doubtId: string,
): Promise<Answer | null> => {
  try {
    const response = await api.get(`/students/doubts/${doubtId}/my-answer`);
    return response.data.answer;
  } catch (e: unknown) {
    // Return null if no answer found (404)
    if (
      e &&
      typeof e === "object" &&
      "response" in e &&
      e.response &&
      typeof e.response === "object" &&
      "status" in e.response &&
      e.response.status === 404
    ) {
      return null;
    }
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
        : "Failed to fetch answer";
    throw new Error(message);
  }
};
