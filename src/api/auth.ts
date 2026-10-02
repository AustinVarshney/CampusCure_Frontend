import axios from "axios";
import { noteRequestId } from "@/lib/observability";

const backendBase = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${backendBase}/api`,
  withCredentials: true,
});

/* ------------------------------------------------------------------ *
 * CC-01b: short-lived access tokens with a revocable refresh token.
 * See docs/specs/CC-01b-refresh-tokens.md
 * ------------------------------------------------------------------ */

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const storeTokens = (token: string, refreshToken?: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Single-flight refresh.
 *
 * This shared promise is the crux of the whole feature. A page issuing six
 * parallel requests on a stale token would otherwise fire six refreshes; five
 * would present an already-rotated token, the backend would read that as a
 * stolen-token replay, and it would revoke the entire session — logging the
 * user out for doing nothing wrong.
 */
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Deliberately a bare axios call, not `api`: routing it through the
    // instance would re-enter this interceptor on failure and recurse.
    const response = await axios.post(`${backendBase}/api/auth/refresh`, {
      refreshToken,
    });
    storeTokens(response.data.token, response.data.refreshToken);
    return response.data.token as string;
  } catch {
    return null;
  }
};

const runRefresh = (): Promise<string | null> => {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

/** Endpoints where a 401 is the answer, not a stale-token signal. */
const NO_REFRESH_PATHS = ["/auth/login", "/auth/refresh", "/auth/face/verify"];

api.interceptors.response.use(
  (response) => {
    // CC-05: the backend stamps every response with an id that appears on its
    // own log lines and Sentry events. Holding the latest one means a frontend
    // error report names the exact backend request behind it.
    noteRequestId(response.headers?.["x-request-id"]);
    return response;
  },
  async (error) => {
    noteRequestId(error.response?.headers?.["x-request-id"]);
    const original = error.config;
    const url: string = original?.url ?? "";

    const shouldTryRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_PATHS.some((path) => url.includes(path));

    if (shouldTryRefresh) {
      // Marked before awaiting, so a second 401 on the retry gives up rather
      // than looping.
      original._retry = true;

      const token = await runRefresh();
      if (token) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }

      clearTokens();
      // Guard against several failed requests each triggering a navigation.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
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
) => {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
      userID,
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
    // CC-01b: the refresh token is what actually ends the session server-side.
    // Without it the backend can only mark the user inactive, and the session
    // would survive a re-login.
    const response = await api.post("/auth/logout", {
      refreshToken: getRefreshToken(),
    });
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

/**
 * CC-60: the second step of login.
 *
 * `POST /auth/face-login` is gone. It was unauthenticated, matched against
 * every enrolled user, and issued a full session to the nearest match - which
 * meant a descriptor alone was a credential. This runs only after a password
 * has verified, against the one account the challenge names.
 */
export interface FaceChallenge {
  challengeId: string;
  nonce: string;
  expiresInSeconds: number;
}

export const verifyFace = async (
  challenge: FaceChallenge,
  descriptors: number[][],
) => {
  try {
    const response = await api.post("/auth/face/verify", {
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      descriptors,
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
        : "Face verification failed";
    throw new Error(message);
  }
};

/** CC-60: un-enrol, the way out for someone who can no longer present it. */
export const deleteFaceDescriptor = async () => {
  const response = await api.delete("/auth/face-descriptor");
  return response.data;
};
