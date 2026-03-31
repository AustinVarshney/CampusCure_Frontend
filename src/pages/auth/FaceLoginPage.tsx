import { faceLogin } from '@/api/auth';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
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
    ? 'ring-blue-500'
    : 'ring-slate-600';

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (lg+) ── */}
      <div className="hidden lg:flex flex-col justify-between w-115 shrink-0 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 bg-blue-600/20 blur-3xl rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0">
            <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
          </div>
          <span className="text-xl font-bold"><span className="text-blue-400">Campus</span><span className="text-violet-400">Cure</span></span>
        </div>

        {/* Heading + description */}
        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Log in securely with{' '}
            <span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
              Face ID
            </span>
          </h2>
          <p className="text-blue-200/70 text-sm leading-relaxed mb-8">
            Your face is your password. No need to remember credentials — just look at the camera and you're in.
          </p>
          <ul className="space-y-3">
            {[
              'Face data is processed locally on-device',
              'Encrypted descriptors — never raw images',
              'Works in under 3 seconds',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/30 ring-1 ring-blue-500/40">
                  <CheckOutlined style={{ fontSize: 10, color: '#93c5fd' }} />
                </span>
                <span className="text-sm text-blue-100/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy card */}
        <div className="relative border border-white/10 rounded-2xl p-6 bg-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
              🔒
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Privacy First</p>
              <p className="text-xs text-blue-200/60">Your biometrics stay on-device</p>
            </div>
          </div>
          <p className="text-xs text-blue-200/50 leading-relaxed">
            CampusCure never uploads your facial image. Only an encrypted descriptor is stored to verify your identity.
          </p>
        </div>
      </div>

      {/* ── Right camera panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Back link */}
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftOutlined style={{ fontSize: 12 }} />
            Back to home
          </Link>
        </div>

        {/* Centered camera area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 gap-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="h-9 w-9 shrink-0">
              <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
            </div>
            <span className="text-xl font-bold"><span className="text-blue-600">Campus</span><span className="text-violet-600">Cure</span></span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm flex flex-col items-center gap-5"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Face Login</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Look at the camera to authenticate
              </p>
            </div>

            {/* Camera viewport */}
            <div className={`relative rounded-2xl overflow-hidden ring-2 ${ringColor} shadow-lg shadow-black/10 transition-all duration-300`}
              style={{ width: 320, height: 240 }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
              {/* Overlay for loading/success states */}
              {(isLoading || isSuccess) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-3 px-4 text-center backdrop-blur-sm">
                  {isSuccess
                    ? <span className="text-5xl">✅</span>
                    : <Spin size="large" />
                  }
                  <span className="text-sm font-medium">{statusMsg}</span>
                </div>
              )}
              {/* Scanning pulse ring overlay */}
              {status === 'camera-ready' && !isError && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/40 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Status badges */}
            {status === 'camera-ready' && !faceWarning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {statusMsg}
              </div>
            )}

            {status === 'camera-ready' && faceWarning && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-full">
                <span>⚠️</span>
                <span>{faceWarning}</span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 w-full">
                  <span className="shrink-0">✗</span>
                  <span>{statusMsg}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="w-full h-10 rounded-xl font-semibold text-sm bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Footer links */}
            <div className="flex flex-col items-center gap-1 text-sm">
              <span className="text-muted-foreground">
                Use password instead?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Password Login
                </Link>
              </span>
              <span className="text-muted-foreground">
                No account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Register
                </Link>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FaceLoginPage;
