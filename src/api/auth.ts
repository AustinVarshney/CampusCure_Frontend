import axios from "axios";

const backendBase = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${backendBase}/api`,
  withCredentials: true,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      email,
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
      "error" in error.response.data
        ? String((error.response.data as { error: string }).error)
        : "login failed";
    throw new Error(message);
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string,
  userID: string,
  university: string,
) => {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
      userID,
      university,
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
      "error" in error.response.data
        ? String((error.response.data as { error: string }).error)
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

export const saveFaceDescriptor = async (descriptor: number[]) => {
  try {
    const response = await api.post("/auth/save-face-descriptor", {
      descriptor,
    });
    return response.data;
  } catch (error: unknown) {
    const message =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { data?: { error?: string } } }).response?.data
        ?.error
        ? String(
            (error as { response: { data: { error: string } } }).response.data
              .error,
          )
        : "Failed to save face descriptor";
    throw new Error(message);
  }
};

export const faceLogin = async (descriptor: number[]) => {
  try {
    const response = await api.post("/auth/face-login", { descriptor });
    return response.data;
  } catch (error: unknown) {
    const message =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { data?: { error?: string } } }).response?.data
        ?.error
        ? String(
            (error as { response: { data: { error: string } } }).response.data
              .error,
          )
        : "Face login failed";
    throw new Error(message);
  }
};
