/**
 * Two-step verification settings (CC-62).
 *
 * Setup is two steps on purpose: the secret shown in the QR code only becomes
 * the login secret once a code from the app proves it was scanned correctly.
 * An app set up wrong therefore cannot lock anyone out.
 *
 * See campus_cure_backend/docs/specs/CC-62-totp-2fa.md.
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Input, Modal, Spin, Tag } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
} from '@/api/twoFactor';

/** Shown once, right after they are created. Never retrievable again. */
const RecoveryCodes = ({ codes, onDone }: { codes: string[]; onDone: () => void }) => {
  const text = codes.join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Recovery codes copied');
    } catch {
      toast.error('Could not copy. Select and copy them by hand.');
    }
  };

  const download = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          'CampusCure recovery codes\n\nEach code works once. Keep them somewhere safe and offline.\n\n',
          text,
          '\n',
        ],
        { type: 'text/plain' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campuscure-recovery-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Alert
        type="warning"
        showIcon
        message="Save these codes now"
        description="If you lose your phone, each code lets you sign in once. They will not be shown again."
      />
      <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-4 font-mono text-sm tracking-wider">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button icon={<Copy className="h-4 w-4" />} onClick={copy}>
          Copy
        </Button>
        <Button icon={<Download className="h-4 w-4" />} onClick={download}>
          Download
        </Button>
        <Button type="primary" onClick={onDone}>
          I have saved them
        </Button>
      </div>
    </div>
  );
};

export const TwoFactorCard = () => {
  const queryClient = useQueryClient();
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [setupCode, setSetupCode] = useState('');
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  const { data: status, isLoading } = useQuery({
    queryKey: ['two-factor-status'],
    queryFn: getTwoFactorStatus,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['two-factor-status'] });

  const begin = useMutation({
    mutationFn: startTwoFactorSetup,
    onSuccess: (data) => {
      setSetup(data);
      setSetupCode('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enable = useMutation({
    mutationFn: (code: string) => enableTwoFactor(code),
    onSuccess: (data) => {
      setSetup(null);
      setFreshCodes(data.recoveryCodes);
      toast.success('Two-step verification is on');
      void refresh();
    },
    onError: (e: Error) => {
      setSetupCode('');
      toast.error(e.message);
    },
  });

  const disable = useMutation({
    mutationFn: () => disableTwoFactor({ password, code: confirmCode }),
    onSuccess: () => {
      setDisableOpen(false);
      setPassword('');
      setConfirmCode('');
      toast.success('Two-step verification is off');
      void refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const regenerate = useMutation({
    mutationFn: () => regenerateRecoveryCodes(confirmCode),
    onSuccess: (data) => {
      setRegenOpen(false);
      setConfirmCode('');
      setFreshCodes(data.recoveryCodes);
      void refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border bg-card p-6">
        <Spin />
      </div>
    );
  }

  if (!status?.available) return null;

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="cc-icon-tile shrink-0">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Two-step verification</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              After your password, also ask for a code from an authenticator app such as
              Google Authenticator, Microsoft Authenticator or Authy.
            </p>
          </div>
        </div>
        {status.enabled ? (
          <Tag color="green" icon={<ShieldCheck className="mr-1 inline h-3.5 w-3.5" />}>
            On
          </Tag>
        ) : (
          <Tag>Off</Tag>
        )}
      </div>

      <div className="mt-5">
        {freshCodes ? (
          <RecoveryCodes codes={freshCodes} onDone={() => setFreshCodes(null)} />
        ) : status.enabled ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {status.recoveryCodesRemaining} of 10 recovery codes left.
              {status.recoveryCodesRemaining <= 3 && ' Create new ones soon.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setRegenOpen(true)}>New recovery codes</Button>
              <Button danger icon={<ShieldOff className="h-4 w-4" />} onClick={() => setDisableOpen(true)}>
                Turn off
              </Button>
            </div>
          </div>
        ) : setup ? (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex justify-center rounded-xl border bg-white p-4">
              {/* White behind the code in both themes: scanners need contrast. */}
              <QRCodeSVG value={setup.otpauthUrl} size={176} level="M" />
            </div>
            <div className="space-y-4">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Open your authenticator app and add an account.</li>
                <li>Scan this QR code, or type the key below.</li>
                <li>Enter the six-digit code the app shows.</li>
              </ol>
              <div>
                <p className="text-xs text-muted-foreground">Setup key</p>
                <code className="break-all font-mono text-sm tracking-wider">
                  {setup.secret.match(/.{1,4}/g)?.join(' ')}
                </code>
              </div>
              <Input.OTP
                length={6}
                value={setupCode}
                disabled={enable.isPending}
                onChange={(code) => {
                  setSetupCode(code);
                  if (code.length === 6) enable.mutate(code);
                }}
              />
              <div className="flex gap-2">
                <Button
                  type="primary"
                  loading={enable.isPending}
                  disabled={setupCode.length !== 6}
                  onClick={() => enable.mutate(setupCode)}
                >
                  Turn on
                </Button>
                <Button onClick={() => setSetup(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        ) : (
          <Button type="primary" loading={begin.isPending} onClick={() => begin.mutate()}>
            Set up two-step verification
          </Button>
        )}
      </div>

      <Modal
        title="Turn off two-step verification"
        open={disableOpen}
        onCancel={() => setDisableOpen(false)}
        onOk={() => disable.mutate()}
        okText="Turn off"
        okButtonProps={{ danger: true, loading: disable.isPending, disabled: !password || confirmCode.length !== 6 }}
        destroyOnHidden
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Your account will be protected by your password alone. Confirm with your password and a
          current code.
        </p>
        <div className="space-y-3">
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input.OTP length={6} value={confirmCode} onChange={setConfirmCode} />
        </div>
      </Modal>

      <Modal
        title="Create new recovery codes"
        open={regenOpen}
        onCancel={() => setRegenOpen(false)}
        onOk={() => regenerate.mutate()}
        okText="Create"
        okButtonProps={{ loading: regenerate.isPending, disabled: confirmCode.length !== 6 }}
        destroyOnHidden
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Your old codes will stop working. Enter a current code from your app to continue.
        </p>
        <Input.OTP length={6} value={confirmCode} onChange={setConfirmCode} />
      </Modal>
    </section>
  );
};

export default TwoFactorCard;
