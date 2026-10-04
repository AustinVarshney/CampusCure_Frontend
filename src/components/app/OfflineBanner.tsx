/**
 * Says so when the app is offline (CC-70).
 *
 * Offline, the service worker answers some reads from its cache. Without this
 * the page would show those as if they were live; with it, the reader knows
 * what they are looking at may be out of date, and why a save just failed.
 */

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OfflineBanner = () => {
  const { t } = useTranslation();
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      {t('common.offline')}
    </div>
  );
};

export default OfflineBanner;
