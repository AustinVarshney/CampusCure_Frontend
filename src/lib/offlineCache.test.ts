/**
 * CC-70: which reads the service worker may answer from cache when offline.
 *
 * The list is a privacy boundary as much as a feature: anything matched here
 * is stored on the device and shown with no network, so the negatives matter
 * more than the positives.
 */
import { describe, expect, it } from "vitest";
import { isOfflineReadable } from "./offlineCache";

const at = (path: string) => new URL(`https://api.example.test${path}`);

describe("isOfflineReadable", () => {
  it("caches the doubt community and the user's own complaints", () => {
    for (const path of [
      "/api/students/doubts",
      "/api/students/doubts/3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      "/api/students/doubts/tags",
      "/api/students/doubts/bookmarked",
      "/api/students/complaints",
      "/api/faculty/doubts",
      "/api/faculty/doubts/abc",
    ]) {
      expect(isOfflineReadable(at(path)), path).toBe(true);
    }
  });

  it("never caches credentials, personal data exports, admin views or computed endpoints", () => {
    for (const path of [
      "/api/auth/me",
      "/api/auth/2fa",
      "/api/me/data-export",
      "/api/admin/users",
      "/api/admin/faculty/stats",
      "/api/faculty/me/stats",
      "/api/attachments/abc",
      "/api/notifications/",
      "/api/students/doubts/suggestions",
      "/api/students/doubts/analytics",
      "/api/students/doubts/abc/answers",
    ]) {
      expect(isOfflineReadable(at(path)), path).toBe(false);
    }
  });

  it("matches by path, so query strings (filters, pages) still qualify", () => {
    expect(isOfflineReadable(at("/api/students/doubts?subject=Maths&page=2"))).toBe(true);
  });
});
