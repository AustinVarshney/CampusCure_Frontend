/**
 * Two-factor authentication (CC-62) and email sign-in codes (CC-63).
 *
 * See campus_cure_backend/docs/specs/CC-62-totp-2fa.md and CC-63-email-otp.md.
 */

import axios from "axios";
import { api } from "./auth";
import type { User } from "@/types";

const errorMessage = (e: unknown, fallback: string): string =>
  axios.isAxiosError(e)
    ? ((e.response?.data as { error?: string } | undefined)?.error ?? fallback)
    : fallback;

const call = async <T>(request: Promise<{ data: T }>, fallback: string): Promise<T> => {
  try {
    return (await request).data;
  } catch (e) {
    throw new Error(errorMessage(e, fallback));
  }
};

/** A finished login. */
export interface SessionResponse {
  token: string;
  refreshToken: string;
  user: User;
  recoveryCodesRemaining?: number;
}

/** A challenge for the second factor; no token yet. */
export interface SecondFactorChallenge {
  challengeId: string;
  nonce: string;
  expiresInSeconds: number;
}

/**
 * What a verified first factor (password or email code) earns. Exactly one of
 * these shapes comes back - never a token alongside a challenge.
 */
export type FirstFactorResponse =
  | SessionResponse
  | (SecondFactorChallenge & { requiresTotp: true })
  | (SecondFactorChallenge & { requiresFace: true });

export interface TwoFactorStatus {
  available: boolean;
  enabled: boolean;
  enabledAt: string | null;
  recoveryCodesRemaining: number;
  emailLoginAvailable: boolean;
}

export const getTwoFactorStatus = () =>
  call(api.get<TwoFactorStatus>("/auth/2fa"), "Could not load security settings.");

export const startTwoFactorSetup = () =>
  call(
    api.post<{ secret: string; otpauthUrl: string }>("/auth/2fa/setup"),
    "Could not start setup.",
  );

export const enableTwoFactor = (code: string) =>
  call(
    api.post<{ enabled: true; recoveryCodes: string[] }>("/auth/2fa/enable", { code }),
    "Could not turn on two-factor authentication.",
  );

export const disableTwoFactor = (body: {
  password: string;
  code?: string;
  recoveryCode?: string;
}) =>
  call(api.post<{ enabled: false }>("/auth/2fa/disable", body), "Could not turn it off.");

export const regenerateRecoveryCodes = (code: string) =>
  call(
    api.post<{ recoveryCodes: string[] }>("/auth/2fa/recovery-codes", { code }),
    "Could not create new recovery codes.",
  );

/** Second step of login. */
export const verifyTwoFactorLogin = (
  challenge: SecondFactorChallenge,
  proof: { code: string } | { recoveryCode: string },
) =>
  call(
    api.post<SessionResponse>("/auth/2fa/verify", {
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      ...proof,
    }),
    "That code did not work. Try again.",
  );

export const requestEmailCode = (email: string) =>
  call(
    api.post<{ message: string }>("/auth/email-login/request", { email }),
    "Could not send a code.",
  );

export const verifyEmailCode = (email: string, code: string) =>
  call(
    api.post<FirstFactorResponse>("/auth/email-login/verify", { email, code }),
    "That code is incorrect or has expired.",
  );

/** Super admin only: for someone who lost both phone and recovery codes. */
export const resetUserTwoFactor = (userId: string) =>
  call(
    api.post<{ reset: true; sessionsRevoked: number }>(`/admin/users/${userId}/2fa/reset`),
    "Could not reset two-factor authentication.",
  );

/** Public: which sign-in options to offer on the login page. */
export const getLoginMethods = () =>
  call(api.get<{ emailCode: boolean }>("/auth/methods"), "Could not load sign-in options.");
