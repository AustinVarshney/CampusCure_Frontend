import { loginUser } from '@/api/auth';
import {
  type FirstFactorResponse,
  type SecondFactorChallenge,
  type SessionResponse,
  getLoginMethods,
  requestEmailCode,
  verifyEmailCode,
  verifyTwoFactorLogin,
} from '@/api/twoFactor';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';

const features = [
  {
    title: 'Real-time complaint tracking',
    description: 'Students and staff can file, route, and monitor issues without relying on scattered updates.',
  },
  {
    title: 'Collaborative doubt community',
    description: 'Academic questions stay visible, searchable, and easier for peers and faculty to resolve together.',
  },
  {
    title: 'Role-based access control',
    description: 'Each user lands in a dashboard tailored to their responsibilities and approval flow.',
  },
];

/**
 * Which screen of the sign-in flow is showing.
 *
 * password / email-request / email-code are FIRST factors (CC-63 replaces the
 * password, never the second factor). totp is the CC-62 second step, reached
 * from either first factor.
 */
type Step = 'password' | 'email-request' | 'email-code' | 'totp';

const LoginPage = () => {
  const [step, setStep] = useState<Step>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [challenge, setChallenge] = useState<SecondFactorChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: methods } = useQuery({
    queryKey: ['login-methods'],
    queryFn: getLoginMethods,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const finishSession = (session: SessionResponse) => {
    login(session.token, session.user, session.refreshToken);
    toast.success(t('login.welcomeBack', { name: session.user.name }));
    if (session.recoveryCodesRemaining !== undefined) {
      toast.warning(t('login.recoveryUsed', { count: session.recoveryCodesRemaining }));
    }
    navigate(getRoleRedirect(session.user.role, session.user));
  };

  /** Route whatever a first factor earned: a session or a second step. */
  const handleFirstFactor = (response: FirstFactorResponse) => {
    if ('requiresTotp' in response) {
      setChallenge(response);
      setTotpCode('');
      setRecoveryCode('');
      setUseRecovery(false);
      setStep('totp');
      return;
    }

    // CC-60: face is the second step for users who enrolled one.
    if ('requiresFace' in response) {
      navigate('/face-login', {
        replace: true,
        state: {
          challenge: {
            challengeId: response.challengeId,
            nonce: response.nonce,
            expiresInSeconds: response.expiresInSeconds,
          },
        },
      });
      return;
    }

    finishSession(response);
  };

  const run = async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      await action();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = () => {
    if (!email || !password) {
      toast.error(t('login.needEmailPassword'));
      return;
    }
    void run(async () => handleFirstFactor(await loginUser(email, password)));
  };

  const handleRequestCode = () => {
    if (!email) {
      toast.error(t('login.needEmail'));
      return;
    }
    void run(async () => {
      const { message } = await requestEmailCode(email);
      toast.success(message);
      setEmailCode('');
      setStep('email-code');
    });
  };

  const handleEmailCode = (code = emailCode) => {
    if (code.length !== 6) return;
    void run(async () => handleFirstFactor(await verifyEmailCode(email, code)));
  };

  const handleTotp = (code = totpCode) => {
    if (!challenge) return;
    const proof = useRecovery ? { recoveryCode: recoveryCode.trim() } : { code };
    if (useRecovery ? !recoveryCode.trim() : code.length !== 6) return;

    void run(async () => {
      try {
        finishSession(await verifyTwoFactorLogin(challenge, proof));
      } catch (error) {
        setTotpCode('');
        throw error;
      }
    });
  };

  const backToStart = () => {
    setChallenge(null);
    setPassword('');
    setStep('password');
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  const titles: Record<Step, { title: string; description: string }> = {
    password: { title: t('login.welcome'), description: t('login.welcomeDesc') },
    'email-request': { title: t('login.codeTitle'), description: t('login.codeDesc') },
    'email-code': { title: t('login.checkEmail'), description: t('login.checkEmailDesc', { email }) },
    totp: {
      title: t('login.totpTitle'),
      description: useRecovery ? t('login.recoveryDesc') : t('login.totpDesc'),
    },
  };

  const emailField = (
    <div className="space-y-2">
      <label className="cc-label">{t('login.emailLabel')}</label>
      <Input
        size="large"
        prefix={<UserOutlined className="text-muted-foreground" />}
        placeholder="you@campus.edu"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onPressEnter={step === 'password' ? handlePasswordLogin : handleRequestCode}
        className="cc-field"
      />
    </div>
  );

  const linkButton = 'text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800';

  return (
    <AuthSplitLayout
      showcaseTitle={
        <>
          The Smarter Way to{' '}
        <span className="cc-gradient-text--onDark">
            Manage Campus Life
          </span>
        </>
      }
      showcaseDescription="One workspace for complaints & doubts. Built to keep the entire campus community aligned."
      highlights={features}
      formEyebrow={t('login.eyebrow')}
      formTitle={titles[step].title}
      formDescription={titles[step].description}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-brand-700 transition-colors hover:text-brand-800">
            {t('login.register')}
          </Link>
        </p>
      }
    >
      {/* CC-71: offered before sign-in, where it is needed most. */}
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      {step === 'password' && (
        <div className="space-y-4">
          {emailField}

          <div className="space-y-2">
            <label className="cc-label">{t('login.passwordLabel')}</label>
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-muted-foreground" />}
              placeholder={t('login.passwordPlaceholder')}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handlePasswordLogin}
              className="cc-field"
            />
          </div>

          <button
            onClick={handlePasswordLogin}
            disabled={loading}
            className="cc-btn cc-btn-primary cc-btn--lg w-full"
          >
            {loading ? <Spin size="small" /> : t('login.signIn')}
          </button>

          {methods?.emailCode && (
            <button type="button" onClick={() => setStep('email-request')} className={`${linkButton} block w-full text-center`}>
              <MailOutlined className="mr-1.5" />
              {t('login.emailInstead')}
            </button>
          )}
        </div>
      )}

      {step === 'email-request' && (
        <div className="space-y-4">
          {emailField}
          <button
            onClick={handleRequestCode}
            disabled={loading}
            className="cc-btn cc-btn-primary cc-btn--lg w-full"
          >
            {loading ? <Spin size="small" /> : t('login.sendCode')}
          </button>
          <button type="button" onClick={backToStart} className={`${linkButton} block w-full text-center`}>
            {t('login.usePassword')}
          </button>
        </div>
      )}

      {step === 'email-code' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Input.OTP
              length={6}
              size="large"
              value={emailCode}
              disabled={loading}
              onChange={(code) => {
                setEmailCode(code);
                handleEmailCode(code);
              }}
              autoFocus
            />
          </div>
          <button
            onClick={() => handleEmailCode()}
            disabled={loading || emailCode.length !== 6}
            className="cc-btn cc-btn-primary cc-btn--lg w-full"
          >
            {loading ? <Spin size="small" /> : t('login.signIn')}
          </button>
          <div className="flex justify-between">
            <button type="button" onClick={handleRequestCode} disabled={loading} className={linkButton}>
              {t('login.newCode')}
            </button>
            <button type="button" onClick={backToStart} className={linkButton}>
              {t('login.usePasswordShort')}
            </button>
          </div>
        </div>
      )}

      {step === 'totp' && (
        <div className="space-y-4">
          {useRecovery ? (
            <Input
              size="large"
              placeholder="XXXXX-XXXXX"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              onPressEnter={() => handleTotp()}
              autoFocus
              className="cc-field font-mono tracking-widest"
            />
          ) : (
            <div className="flex justify-center">
              <Input.OTP
                length={6}
                size="large"
                value={totpCode}
                disabled={loading}
                onChange={(code) => {
                  setTotpCode(code);
                  handleTotp(code);
                }}
                autoFocus
              />
            </div>
          )}

          <button
            onClick={() => handleTotp()}
            disabled={loading || (useRecovery ? !recoveryCode.trim() : totpCode.length !== 6)}
            className="cc-btn cc-btn-primary cc-btn--lg w-full"
          >
            {loading ? <Spin size="small" /> : t('login.verify')}
          </button>

          <div className="flex justify-between">
            <button type="button" onClick={() => setUseRecovery((v) => !v)} className={linkButton}>
              {useRecovery ? t('login.useApp') : t('login.useRecovery')}
            </button>
            <button type="button" onClick={backToStart} className={linkButton}>
              {t('login.startOver')}
            </button>
          </div>
        </div>
      )}

      {step === 'password' && (
        /* CC-60: face is never a way in on its own, only a second step for
           users who enrolled one. The endpoint behind the old button is
           deleted, not hidden. */
        <p className="text-center text-xs text-muted-foreground">
          {t('login.secondStepHint')}
        </p>
      )}
    </AuthSplitLayout>
  );
};

export default LoginPage;
