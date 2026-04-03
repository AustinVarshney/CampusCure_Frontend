import { faceLogin } from '@/api/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { Spin } from 'antd';
import * as faceapi from 'face-api.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Status =
  | 'loading-models'
  | 'starting-camera'
  | 'camera-ready'
  | 'scanning'
  | 'success'
  | 'error';

const SCAN_TIMEOUT_MS = 30_000; // stop scanning after 30 seconds

const features = [
  {
    title: 'Biometric sign-in in seconds',
    description: 'Authenticate quickly without remembering passwords or OTPs.',
  },
  {
    title: 'Descriptor-based matching',
    description: 'Only encrypted facial descriptors are used, never raw images.',
  },
  {
    title: 'Designed for campus safety',
    description: 'Secure access flow for students, faculty, and admins.',
  },
];

const FaceLoginPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading-models');
  const [statusMsg, setStatusMsg] = useState('Loading face recognition models…');
  const [faceWarning, setFaceWarning] = useState<string | null>(null);
  const scanStartRef = useRef<number>(0);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Load models then start camera
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setStatus('loading-models');
        setStatusMsg('Loading face recognition models…');
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (cancelled) return;

        setStatus('starting-camera');
        setStatusMsg('Starting webcam…');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('camera-ready');
        setStatusMsg('Hold your face steady — scanning…');
        scanStartRef.current = Date.now();
        startAutoScan();
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Initialization failed.';
        setStatus('error');
        setStatusMsg(msg.includes('camera') || msg.includes('Permission')
          ? 'Camera access denied. Please allow camera permission and reload.'
          : 'Failed to load face recognition models. Please reload the page.'
        );
      }
    };

    init();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAutoScan = useCallback(() => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    const scan = async () => {
      if (!scanningRef.current || !videoRef.current) return;

      // ── Timeout check ──────────────────────────────────────────────
      const elapsed = Date.now() - scanStartRef.current;
      if (elapsed >= SCAN_TIMEOUT_MS) {
        scanningRef.current = false;
        setFaceWarning(null);
        setStatus('error');
        setStatusMsg('No face detected within 30 seconds. Please try again.');
        toast.error('Scanning timed out — no face detected.');
        stopCamera();
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (!scanningRef.current) return;

        // Draw overlays on canvas
        if (canvasRef.current && videoRef.current) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resized = faceapi.resizeResults(detections, dims);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resized);
        }

        if (detections.length === 0) {
          setFaceWarning('No face detected — please look directly at the camera.');
        } else if (detections.length > 1) {
          setFaceWarning('Multiple faces detected — only one face should be visible.');
        } else {
          // Exactly one face — attempt login
          setFaceWarning(null);
          scanningRef.current = false;
          setStatus('scanning');
          setStatusMsg('Face detected! Authenticating…');

          const descriptor = Array.from(detections[0].descriptor);
          const response = await faceLogin(descriptor);

          setStatus('success');
          setStatusMsg(`Welcome, ${response.user.name}!`);
          toast.success(`Welcome back, ${response.user.name}!`);
          stopCamera();
          login(response.token, response.user);
          navigate(getRoleRedirect(response.user.role, response.user));
          return;
        }
      } catch (err) {
        if (!scanningRef.current) return;
        const msg = err instanceof Error ? err.message : 'Authentication failed.';
        if (msg.includes('not recognized') || msg.includes('pending approval')) {
          scanningRef.current = false;
          setFaceWarning(null);
          setStatus('error');
          setStatusMsg(msg);
          toast.error(msg);
          stopCamera();
          return;
        }
        // Transient error — keep scanning
      }

      // Schedule next scan frame
      if (scanningRef.current) {
        setTimeout(scan, 600);
      }
    };

    setTimeout(scan, 800);
  }, [login, navigate, stopCamera]);

  const handleRetry = () => {
    setStatus('loading-models');
    setStatusMsg('Reloading…');
    window.location.reload();
  };

  const isLoading = ['loading-models', 'starting-camera', 'scanning'].includes(status);
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const ringColor = isSuccess
    ? 'ring-green-500'
    : isError
    ? 'ring-red-500'
    : status === 'camera-ready'
    ? 'ring-cyan-500'
    : 'ring-slate-600';

  return (
    <AuthSplitLayout
      showcaseTitle={
        <>
          Secure access with{' '}
          <span className="bg-linear-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
            Face ID
          </span>
        </>
      }
      showcaseDescription="Look at your camera and sign in instantly with a privacy-first biometric flow built for campus operations."
      highlights={features}
      formEyebrow="Face Login"
      formTitle="Authenticate with your face"
      formDescription="Center your face in the frame and hold steady while we verify your identity."
      footer={
        <div className="flex flex-col items-center gap-1 text-sm">
          <span className="text-slate-500">
            Use password instead?{' '}
            <Link to="/login" className="font-semibold text-cyan-700 transition-colors hover:text-cyan-900">
              Password Login
            </Link>
          </span>
          <span className="text-slate-500">
            No account?{' '}
            <Link to="/register" className="font-semibold text-cyan-700 transition-colors hover:text-cyan-900">
              Register
            </Link>
          </span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className={`relative overflow-hidden rounded-3xl ring-2 ${ringColor} shadow-[0_16px_42px_rgba(15,23,42,0.20)] transition-all duration-300`}
          style={{ width: 320, height: 240 }}
        >
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ pointerEvents: 'none' }}
          />

          {(isLoading || isSuccess) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/62 px-4 text-center text-white backdrop-blur-sm">
              {isSuccess ? <span className="text-5xl">✅</span> : <Spin size="large" />}
              <span className="text-sm font-medium">{statusMsg}</span>
            </div>
          )}

          {status === 'camera-ready' && !isError && (
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-cyan-300/45 animate-pulse" />
          )}
        </div>

        {status === 'camera-ready' && !faceWarning && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {statusMsg}
          </div>
        )}

        {status === 'camera-ready' && faceWarning && (
          <div className="flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
            <span>⚠️</span>
            <span>{faceWarning}</span>
          </div>
        )}

        {isError && (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex w-full items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="shrink-0">✗</span>
              <span>{statusMsg}</span>
            </div>
            <button
              onClick={handleRetry}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#06204d_0%,#0c5d8e_52%,#16b3c6_100%)] text-sm font-semibold text-white shadow-[0_14px_34px_rgba(8,79,120,0.30)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(8,79,120,0.36)]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
};

export default FaceLoginPage;
