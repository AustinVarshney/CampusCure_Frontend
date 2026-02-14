import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.BACKEND_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      username,
      password,
    });
    console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    const message =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
        ? String((error.response.data as { message: string }).message)
        : "login failed";
    throw new Error(message);
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string,
  username: string,
) => {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
      username,
    });
    console.log("Registration Successful : ", response.data);
    return response.data;
  } catch (error: unknown) {
    const message =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
        ? String((error.response.data as { message: string }).message)
        : "registration failed";
    throw new Error(message);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    console.log("User Logged Out : ", response.data);
    return response.data;
  } catch {
    throw new Error("Logout failed");
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    console.log("Current User : ", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch current user");
  }
};
