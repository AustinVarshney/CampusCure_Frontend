/**
 * Offline reading (CC-70).
 *
 * Shared by the service worker, which fills the cache, and the page, which
 * empties it on logout. Kept in one file so "what is cached" and "what is
 * cleared" cannot drift apart.
 *
 * Deliberately narrow. Only reads that are useful in a lecture hall with no
 * signal, and nothing that is a credential or someone else's data: the
 * doubt community (shared content), and the signed-in student's own
 * complaints and the faculty member's doubt queue. No auth, profile, admin,
 * privacy-export or attachment URLs - those are either sensitive or expire.
 */

export const API_READ_CACHE = 'cc-api-read-v1';

const READABLE: RegExp[] = [
  /\/api\/students\/doubts$/,
  /\/api\/students\/doubts\/tags$/,
  /\/api\/students\/doubts\/bookmarked$/,
  // A single doubt. Excludes the non-id sub-routes, which are writes or
  // computed views (suggestions, analytics).
  /\/api\/students\/doubts\/(?!suggestions|analytics|from-image)[^/]+$/,
  /\/api\/students\/complaints$/,
  /\/api\/faculty\/doubts$/,
  /\/api\/faculty\/doubts\/[^/]+$/,
];

export const isOfflineReadable = (url: URL): boolean =>
  url.pathname.includes('/api/') && READABLE.some((pattern) => pattern.test(url.pathname));

/**
 * Forget everything cached for the signed-in user.
 *
 * The cache is keyed by URL, not by who asked, so on a shared computer the
 * next person to sign in would otherwise be shown the last person's
 * complaints while offline. Called on logout.
 */
export const clearOfflineCache = async (): Promise<void> => {
  if (typeof caches === 'undefined') return;
  await caches.delete(API_READ_CACHE);
};
