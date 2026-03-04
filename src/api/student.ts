import { Complaint } from "@/types";
import { api } from "./auth";

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
  category: "PROJECTOR" | "FAN" | "LIGHT" | "SMART_BOARD" | "SEATING";
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
