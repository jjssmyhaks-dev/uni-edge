'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Camera,
  CameraOff,
  Shield,
  AlertTriangle,
  Clock,
  Monitor,
  Eye,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface FlagEvent {
  type: string;
  severity: number;
  timestamp: string;
  description: string;
}

export default function ProctoringPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [flags, setFlags] = useState<FlagEvent[]>([]);
  const [examTime, setExamTime] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [identityVerified, setIdentityVerified] = useState(false);
  const tabSwitchCount = useRef(0);
  const lastActivity = useRef(Date.now());

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setExamTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format timer
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Add flag
  const addFlag = useCallback((type: string, severity: number, description: string) => {
    const flag: FlagEvent = { type, severity, timestamp: new Date().toISOString(), description };
    setFlags(prev => [...prev, flag]);
  }, []);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current++;
        addFlag('tab_switch', 3, `Tab switched (${tabSwitchCount.current} times)`);
      }
      lastActivity.current = Date.now();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [addFlag]);

  // Keyboard lockdown
  useEffect(() => {
    if (!isLocked) return;

    const blocked = (e: KeyboardEvent) => {
      // Block: Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+S, F12, Alt+Tab (can't block but flag)
      if (
        (e.ctrlKey && ['c', 'v', 'u', 's', 'p'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        addFlag('key_attempt', 4, `Blocked key combination: ${e.key}`);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addFlag('right_click', 2, 'Right-click attempt');
    };

    document.addEventListener('keydown', blocked);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('keydown', blocked);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isLocked, addFlag]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError(null);
        addFlag('camera_start', 0, 'Camera activated');
      }
    } catch (err: any) {
      setCameraError(err.message || 'Camera access denied');
      addFlag('camera_denied', 5, 'Camera access denied or unavailable');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Verify identity
  const verifyIdentity = () => {
    setIdentityVerified(true);
    addFlag('identity_verified', 0, 'Identity verification completed');
  };

  // Toggle lockdown
  const toggleLockdown = () => {
    if (!isLocked) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      addFlag('lockdown_start', 0, 'Browser lockdown activated');
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsLocked(!isLocked);
  };

  // Severity colors
  const severityColor = (s: number) => {
    if (s >= 5) return 'text-red-600 bg-red-50 border-red-200';
    if (s >= 3) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (s > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const flagCount = flags.filter(f => f.severity >= 3).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proctored Exam</h1>
          <p className="text-sm text-muted-foreground mt-1">Ensure your camera is on and browser is locked</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            {isConnected ? (
              <><Wifi className="h-3.5 w-3.5 text-emerald-500" /> <span className="text-emerald-600">Connected</span></>
            ) : (
              <><WifiOff className="h-3.5 w-3.5 text-red-500" /> <span className="text-red-600">Disconnected</span></>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-mono">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {formatTime(examTime)}
          </div>
          <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${flagCount > 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
            <Shield className="h-3.5 w-3.5" />
            {flagCount} flag{flagCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Camera + Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Camera Feed</CardTitle>
            <CardDescription className="text-xs">
              {cameraActive ? 'Camera is active — your exam is being monitored' : 'Enable camera to start the exam'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Camera not active</p>
                </div>
              )}
              {cameraActive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  REC
                </div>
              )}
              {isLocked && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  <Monitor className="h-3 w-3" />
                  Locked
                </div>
              )}
            </div>

            {cameraError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {cameraError}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              {!cameraActive ? (
                <Button onClick={startCamera} size="sm">
                  <Camera className="h-4 w-4 mr-1.5" />
                  Enable Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" size="sm">
                  <CameraOff className="h-4 w-4 mr-1.5" />
                  Disable Camera
                </Button>
              )}
              <Button
                onClick={toggleLockdown}
                variant={isLocked ? 'destructive' : 'outline'}
                size="sm"
              >
                <Monitor className="h-4 w-4 mr-1.5" />
                {isLocked ? 'Unlock Browser' : 'Lock Browser'}
              </Button>
              {!identityVerified ? (
                <Button onClick={verifyIdentity} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1.5" />
                  Verify Identity
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Verified
                </Button>
              )}
            </div>

            {/* Status Checklist */}
            <div className="space-y-2 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exam Readiness</p>
              {[
                { label: 'Camera active', done: cameraActive },
                { label: 'Browser locked', done: isLocked },
                { label: 'Identity verified', done: identityVerified },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flag Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Flag Timeline</CardTitle>
            <CardDescription className="text-xs">Events detected during your session</CardDescription>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                No flags yet
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {flags.map((flag, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-2.5 text-xs ${severityColor(flag.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{flag.type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] opacity-60">
                        {new Date(flag.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-0.5 opacity-80">{flag.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
