/**
 * Browser push notifications, page side (CC-41).
 *
 * The service worker (src/sw.ts) shows the notifications; this module asks
 * permission, subscribes, and tells the backend where to send.
 *
 * See campus_cure_backend/docs/specs/CC-41-web-push.md.
 */

import { api } from '@/api/auth';

export type PushState =
  | 'unsupported' // no service worker / PushManager (e.g. iOS Safari outside an installed app)
  | 'unavailable' // the server has no VAPID keys
  | 'denied' // the user blocked notifications in the browser
  | 'off'
  | 'on';

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** iOS only offers push to a site added to the home screen. */
export const isIosOutsideInstalledApp = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.matchMedia('(display-mode: standalone)').matches;

const getConfig = async () =>
  (await api.get<{ enabled: boolean; publicKey: string | null }>('/notifications/push/config')).data;

/** The VAPID public key arrives base64url; the browser wants bytes. */
const toBytes = (base64url: string): Uint8Array<ArrayBuffer> => {
  const padded = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
};

const registration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;
  // No worker in `vite dev` (the plugin only builds it for production), so
  // do not wait forever for one that will never come.
  const existing = await navigator.serviceWorker.getRegistration();
  return existing ? navigator.serviceWorker.ready : null;
};

export const getPushState = async (): Promise<PushState> => {
  if (!isPushSupported()) return 'unsupported';
  const config = await getConfig().catch(() => null);
  if (!config?.enabled) return 'unavailable';
  if (Notification.permission === 'denied') return 'denied';

  const reg = await registration();
  if (!reg) return 'unsupported';
  return (await reg.pushManager.getSubscription()) ? 'on' : 'off';
};

/** Ask permission, subscribe this browser, register it with the backend. */
export const enablePush = async (): Promise<PushState> => {
  const config = await getConfig();
  if (!config.enabled || !config.publicKey) return 'unavailable';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';

  const reg = await registration();
  if (!reg) return 'unsupported';

  const subscription =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toBytes(config.publicKey),
    }));

  await api.post('/notifications/push/subscribe', { subscription: subscription.toJSON() });
  return 'on';
};

/**
 * Stop notifications on THIS browser. Used by the toggle and on logout - a
 * shared computer must not keep receiving the last user's alerts.
 */
export const disablePush = async (): Promise<void> => {
  const reg = await registration().catch(() => null);
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;

  // Backend first, while the session still exists to authorise it.
  await api
    .post('/notifications/push/unsubscribe', { endpoint: subscription.endpoint })
    .catch(() => undefined);
  await subscription.unsubscribe().catch(() => undefined);
};
