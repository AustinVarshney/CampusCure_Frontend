/// <reference lib="webworker" />
/**
 * The service worker (CC-70 installable app + offline reading, CC-41 push).
 *
 * Built by vite-plugin-pwa in injectManifest mode: the plugin supplies the
 * list of hashed build files (self.__WB_MANIFEST); everything else here is
 * ours.
 *
 * See campus_cure_backend/docs/specs/CC-70-pwa.md and CC-41-web-push.md.
 */

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { API_READ_CACHE, isOfflineReadable } from './lib/offlineCache';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };

/* ---------------------------------------------------------------- *
 * App shell: every built file, so the app opens with no network.
 * ---------------------------------------------------------------- */

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// A deep link (/student/doubts/123) opened offline still gets the app, which
// then routes client-side.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// A new deploy takes over at once rather than waiting for every tab to close.
// Safe here because the precache is versioned: old pages keep working until
// they reload.
self.addEventListener('install', () => void self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

/* ---------------------------------------------------------------- *
 * Offline READING. Network first: the cache answers only when the network
 * does not, so nobody is shown stale data while online. Which requests
 * qualify is decided in lib/offlineCache.ts, next to the logout that clears
 * them.
 * ---------------------------------------------------------------- */

registerRoute(
  ({ url, request }) => request.method === 'GET' && isOfflineReadable(url),
  new NetworkFirst({
    cacheName: API_READ_CACHE,
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  }),
);

/* ---------------------------------------------------------------- *
 * Push (CC-41).
 * ---------------------------------------------------------------- */

interface PushPayload {
  title?: string;
  body?: string;
  tag?: string;
  notificationId?: string;
}

self.addEventListener('push', (event) => {
  let payload: PushPayload = {};
  try {
    payload = (event.data?.json() as PushPayload) ?? {};
  } catch {
    payload = { body: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'CampusCure', {
      body: payload.body ?? '',
      // Same tag replaces rather than stacks: a retried push shows once.
      tag: payload.tag,
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      data: { notificationId: payload.notificationId },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const id = (event.notification.data as { notificationId?: string } | undefined)?.notificationId;
  const target = id ? `/notifications/${encodeURIComponent(id)}` : '/';

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Reuse an open tab: focus it and let the app route, which keeps its
      // in-memory state and avoids a second copy of CampusCure.
      for (const client of windows) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({ type: 'open-notification', id });
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
