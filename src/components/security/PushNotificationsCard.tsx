/**
 * Browser notifications on/off for this device (CC-41).
 *
 * Per device, not per account: turning it on here does nothing for the
 * user's phone, and the copy says so.
 */

import { useEffect, useState } from 'react';
import { Button, Spin, Tag } from 'antd';
import { BellRing } from 'lucide-react';
import { toast } from 'sonner';
import {
  type PushState,
  disablePush,
  enablePush,
  getPushState,
  isIosOutsideInstalledApp,
} from '@/lib/push';

const EXPLAIN: Record<Exclude<PushState, 'on' | 'off'>, string> = {
  unsupported: isIosOutsideInstalledApp()
    ? 'On iPhone and iPad, add CampusCure to your home screen first (Share → Add to Home Screen), then open it from there.'
    : 'This browser cannot show notifications from websites.',
  unavailable: 'Browser notifications are not set up on this server yet.',
  denied:
    'Notifications are blocked for this site. Allow them in your browser\'s site settings, then come back.',
};

export const PushNotificationsCard = () => {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPushState().then(setState).catch(() => setState('unsupported'));
  }, []);

  // Nothing to offer, and nothing useful to say, when the server has no keys.
  if (state === 'unavailable') return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (state === 'on') {
        await disablePush();
        setState('off');
        toast.success('Notifications turned off on this device');
      } else {
        const next = await enablePush();
        setState(next);
        if (next === 'on') toast.success('Notifications turned on for this device');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change notifications');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="cc-icon-tile shrink-0">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Browser notifications</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Get an alert on this device when a complaint moves or a doubt is answered, even with
              CampusCure closed. Each device is turned on separately.
            </p>
          </div>
        </div>
        {state === 'on' ? <Tag color="green">On</Tag> : state === 'off' ? <Tag>Off</Tag> : null}
      </div>

      <div className="mt-4">
        {state === null ? (
          <Spin size="small" />
        ) : state === 'on' || state === 'off' ? (
          <Button type={state === 'on' ? 'default' : 'primary'} loading={busy} onClick={toggle}>
            {state === 'on' ? 'Turn off on this device' : 'Turn on for this device'}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">{EXPLAIN[state]}</p>
        )}
      </div>
    </section>
  );
};

export default PushNotificationsCard;
