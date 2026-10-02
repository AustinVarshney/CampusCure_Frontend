import { Answer, Complaint, Doubt } from "@/types";
import { api } from "./auth";

export interface StudentPostingSettings {
  allowedCategories: string[];
  doubtSubjects: string[];
}

export interface SimilarDoubtSuggestion {
  id: string;
  title: string;
  subject: string;
  semester: number;
  views: number;
  answerCount: number;
  createdAt: string;
  matchedKeywords: string[];
}

export type CommonDoubtsWindow = "all" | "30d" | "90d";

export interface CommonDoubtItem {
  id: string;
  title: string;
  views: number;
  upVoteCount: number;
  answerCount: number;
}

export interface CommonDoubtTopic {
  key: string;
  label: string;
  count: number;
  engagementScore: number;
  topDoubts: CommonDoubtItem[];
}

export interface CommonDoubtsAnalyticsResponse {
  window: CommonDoubtsWindow;
  generatedAt: string;
  topics: CommonDoubtTopic[];
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

export const getStudentPostingSettings =
  async (): Promise<StudentPostingSettings> => {
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
  /** CC-02: ids of files already uploaded to storage, not the files themselves. */
  attachmentIds?: string[];
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

export const submitComplaintFeedback = async (
  complaintId: string,
  feedbackRating: number,
  feedbackComment?: string,
) => {
  try {
    const response = await api.post(
      `/students/complaints/${complaintId}/feedback`,
      {
        feedbackRating,
        feedbackComment,
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
        : "Failed to submit feedback";
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
  /** CC-24: ids of files already uploaded to storage, not the files. */
  attachmentIds?: string[];
  /** CC-23: HTML when written with the editor. Sanitised server-side. */
  descriptionFormat?: "TEXT" | "HTML";
  /** CC-50: set when the description came from readDoubtFromImage. */
  transcribedFromImage?: boolean;
  transcriptionModel?: string;
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
  /** CC-20: normalized tags. Repeated, and ANDed together by the backend. */
  tags?: string[];
}): Promise<Doubt[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.semester) params.append("semester", String(filters.semester));
    if (filters?.search) params.append("search", filters.search);
    // Repeated rather than comma-separated: adding a tag must narrow the list,
    // and the backend ANDs them with hasEvery.
    filters?.tags?.forEach((tag) => params.append("tag", tag));

    const response = await api.get(`/students/doubts?${params.toString()}`);
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

export const getCommonAcademicDoubts = async (
  window: CommonDoubtsWindow,
): Promise<CommonDoubtsAnalyticsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("window", window);

    const response = await api.get(
      `/students/doubts/analytics/subjectwise?${params.toString()}`,
    );
    return response.data as CommonDoubtsAnalyticsResponse;
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
        : "Failed to fetch SubjectWise doubts";
    throw new Error(message);
  }
};

export const getSimilarDoubtSuggestions = async (
  filters: {
    query: string;
    subject?: string;
    semester?: number;
    limit?: number;
  },
  // Lets the caller abort a request that is already in flight. Since CC-11 this
  // endpoint may embed the query through a rate-limited third party, so a
  // superseded request is real cost, not just a wasted response.
  signal?: AbortSignal,
): Promise<SimilarDoubtSuggestion[]> => {
  try {
    const params = new URLSearchParams();
    params.append("query", filters.query);
    if (filters.subject) params.append("subject", filters.subject);
    if (filters.semester) params.append("semester", String(filters.semester));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await api.get(
      `/students/doubts/suggestions?${params.toString()}`,
      signal ? { signal } : undefined,
    );
    return response.data.suggestions;
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
        : "Failed to fetch similar doubts";
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

export const postAnswer = async (
  doubtId: string,
  content: string,
  attachmentIds?: string[],
  contentFormat?: "TEXT" | "HTML",
) => {
  try {
    const response = await api.post(`/students/doubts/${doubtId}/answers`, {
      content,
      attachmentIds,
      contentFormat,
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

export const upvoteDoubt = async (doubtId: string) => {
  try {
    const response = await api.post(`/students/doubts/${doubtId}/upvote`);
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

/** CC-13: a possible duplicate of a complaint being drafted. */
export interface DuplicateComplaintSuggestion {
  id: string;
  title: string;
  status: string;
  similarity: number;
  createdAt: string;
}

/**
 * Advisory duplicate check for the complaint form.
 *
 * Deliberately swallows every error and returns []. This must never stop a
 * student filing a complaint: if detection is unavailable, the correct
 * behaviour is "no duplicates found", not an error.
 */
export const getSimilarComplaints = async (
  filters: {
    title: string;
    description: string;
    block: string;
    classroomNumber: string;
  },
  signal?: AbortSignal,
): Promise<DuplicateComplaintSuggestion[]> => {
  try {
    const params = new URLSearchParams();
    params.append("title", filters.title);
    params.append("description", filters.description);
    params.append("block", filters.block);
    params.append("classroomNumber", filters.classroomNumber);

    const response = await api.get(
      `/students/complaints/similar?${params.toString()}`,
      signal ? { signal } : undefined,
    );
    return response.data.duplicates ?? [];
  } catch {
    return [];
  }
};

/* ------------------------------------------------------------------ *
 * CC-14: free text -> structured complaint fields
 * ------------------------------------------------------------------ */

export interface ParsedComplaintFields {
  category: string | null;
  priority: 1 | 2 | 3 | null;
  block: string | null;
  classroomNumber: string | null;
  /** "rules" | "model" | "none" — which path answered. */
  source: string;
}

/**
 * Ask the backend to extract complaint fields from a description.
 *
 * Advisory: the result pre-fills the form for the student to check and correct.
 * Never throws — if extraction is unavailable the student simply fills the form
 * as before.
 */
export const parseComplaintText = async (
  text: string,
  signal?: AbortSignal,
): Promise<ParsedComplaintFields | null> => {
  try {
    const response = await api.post(
      "/students/complaints/parse",
      { text },
      signal ? { signal } : undefined,
    );
    return response.data;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ *
 * CC-20: tag vocabulary
 * ------------------------------------------------------------------ */

export interface TagVocabularyEntry {
  /** Canonical key — what you filter by. */
  tag: string;
  /** Most common original casing — what you render. */
  display: string;
  count: number;
}

/**
 * Every tag in use, uncapped.
 *
 * This is a display map as well as an autocomplete source: a chip resolves its
 * canonical casing through it, so a tag missing from the response would render
 * in whatever casing its author happened to type.
 */
export const getDoubtTags = async (): Promise<TagVocabularyEntry[]> => {
  const response = await api.get("/students/doubts/tags");
  const tags = response.data?.tags;
  return Array.isArray(tags) ? tags : [];
};

/* ------------------------------------------------------------------ *
 * CC-21: bookmarks
 * ------------------------------------------------------------------ */

/**
 * Save or unsave a doubt.
 *
 * Both directions are idempotent server-side, which is what lets the UI toggle
 * optimistically without worrying about a double-tap on bad wifi.
 */
export const setDoubtBookmark = async (
  doubtId: string,
  bookmarked: boolean,
): Promise<void> => {
  if (bookmarked) {
    await api.post(`/students/doubts/${doubtId}/bookmark`);
  } else {
    await api.delete(`/students/doubts/${doubtId}/bookmark`);
  }
};

export const getBookmarkedDoubts = async (): Promise<Doubt[]> => {
  const response = await api.get("/students/doubts/bookmarked");
  const list = response.data?.doubts;
  return Array.isArray(list) ? list : [];
};

/**
 * CC-50: read a question out of an image the student has already uploaded.
 *
 * Advisory. The response fills the form in; the student edits it and submits
 * through `postDoubt` as normal. Nothing is posted here.
 *
 * The status codes are distinct on purpose and the caller should surface them
 * as written rather than collapsing them into "something went wrong" — they
 * are the difference between "try a clearer photo" (422) and "this deployment
 * cannot read images at all" (503).
 */
export interface ImageDoubtFields {
  title: string;
  description: string;
  subject: string | null;
  labels: string[];
  legible: boolean;
  /** Provenance, recorded on the doubt so readers know it was transcribed. */
  model: string;
  provider: string;
}

export const readDoubtFromImage = async (
  attachmentId: string,
): Promise<ImageDoubtFields> => {
  try {
    const response = await api.post<ImageDoubtFields>(
      "/students/doubts/from-image",
      { attachmentId },
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
        : "Could not read the image. Please type your question instead.";
    throw new Error(message);
  }
};
