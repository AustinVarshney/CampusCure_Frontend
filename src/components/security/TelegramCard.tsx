/**
 * Telegram notifications (CC-42).
 *
 * Linking is a deep link: the server issues a one-time code, the user opens
 * t.me/<bot>?start=<code>, presses Start, and the bot's webhook redeems it.
 * This card then polls until the server reports the chat linked.
 *
 * See campus_cure_backend/docs/specs/CC-42-telegram.md.
 */

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Popconfirm, Spin, Tag } from 'antd';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/auth';

interface TelegramStatus {
  enabled: boolean;
  linked: boolean;
  botUsername: string | null;
}

interface LinkOffer {
  deepLink: string;
  expiresInMinutes: number;
}

const POLL_MS = 3000;

export const TelegramCard = () => {
  const queryClient = useQueryClient();
  const [offer, setOffer] = useState<(LinkOffer & { expiresAt: number }) | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['telegram-status'],
    queryFn: async () => (await api.get<TelegramStatus>('/me/telegram')).data,
    // While a link is waiting to be redeemed, ask until it is.
    refetchInterval: offer ? POLL_MS : false,
  });

  useEffect(() => {
    if (!offer) return;
    if (status?.linked) {
      setOffer(null);
      toast.success('Telegram connected');
      return;
    }
    // Stop polling once the code has expired.
    const timer = window.setTimeout(() => setOffer(null), offer.expiresAt - Date.now());
    return () => window.clearTimeout(timer);
  }, [offer, status?.linked]);

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border bg-card p-6">
        <Spin />
      </div>
    );
  }

  // Not configured on the server: nothing to offer.
  if (!status?.enabled) return null;

  const connect = async () => {
    setBusy(true);
    try {
      const { data } = await api.get<LinkOffer>('/me/telegram/link');
      setOffer({ ...data, expiresAt: Date.now() + data.expiresInMinutes * 60_000 });
    } catch {
      toast.error('Could not start linking. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await api.delete('/me/telegram/link');
      await queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
      toast.success('Telegram disconnected');
    } catch {
      toast.error('Could not disconnect. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="cc-icon-tile shrink-0">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Telegram</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Get your CampusCure notifications as Telegram messages
              {status.botUsername ? ` from @${status.botUsername}` : ''}.
            </p>
          </div>
        </div>
        {status.linked ? <Tag color="green">Connected</Tag> : <Tag>Not connected</Tag>}
      </div>

      <div className="mt-4">
        {status.linked ? (
          <Popconfirm
            title="Stop Telegram notifications?"
            okText="Disconnect"
            okButtonProps={{ danger: true }}
            onConfirm={disconnect}
          >
            <Button loading={busy}>Disconnect</Button>
          </Popconfirm>
        ) : offer ? (
          <div className="space-y-3">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Open Telegram with the button below.</li>
              <li>Press <strong>Start</strong> in the chat with the bot.</li>
              <li>Come back here - this page updates by itself.</li>
            </ol>
            <div className="flex flex-wrap items-center gap-2">
              {/* A real link, not window.open after an await: browsers block
                  pop-ups that are not a direct result of the click. */}
              <Button type="primary" href={offer.deepLink} target="_blank" rel="noopener noreferrer">
                Open Telegram
              </Button>
              <Button onClick={() => setOffer(null)}>Cancel</Button>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Spin size="small" /> Waiting for Telegram…
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              The link works once and expires in {offer.expiresInMinutes} minutes.
            </p>
          </div>
        ) : (
          <Button type="primary" loading={busy} onClick={connect}>
            Connect Telegram
          </Button>
        )}
      </div>
    </section>
  );
};

export default TelegramCard;
