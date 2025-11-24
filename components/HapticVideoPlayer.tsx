import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Volume2, VolumeX, Loader2, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { HAPTIC_CUES, VIDEO_URL } from '../constants';

export const HapticVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const syncLoopRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCue, setActiveCue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Simple iOS detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  // Handle Fullscreen toggling
  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g. user pressing Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls logic
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    // Only set timeout to hide if we are playing
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, [isPlaying]);

  // Effect to manage controls visibility based on play state
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    } else {
      // When playback starts, start the hide timer immediately
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying]);

  // The Heartbeat: Syncs video time to React state and triggers Haptics
  const handleSync = useCallback(() => {
    if (!videoRef.current) return;

    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Find if we are currently inside a haptic zone
    const currentCue = HAPTIC_CUES.find(cue => t >= cue.startTime && t < cue.endTime);

    if (currentCue) {
      // If we just entered a cue (or switched cues), trigger vibration
      if (activeCue !== currentCue.id) {
        setActiveCue(currentCue.id);
        // Only attempt vibration if supported (and not iOS just to be safe, though API check handles it usually)
        if (navigator.vibrate && !isIOS) {
            if (currentCue.vibrationPattern) {
                // Use specific pattern if defined (e.g., [300, 200, 300])
                navigator.vibrate(currentCue.vibrationPattern);
            } else {
                // Continuous vibration for the remainder of the cue
                const durationMs = (currentCue.endTime - t) * 1000;
                navigator.vibrate(Math.max(0, durationMs));
            }
        }
      }
    } else {
      // If we were in a cue but now we are not
      if (activeCue) {
        setActiveCue(null);
        if (navigator.vibrate) navigator.vibrate(0); // Stop immediately
      }
    }

    // Loop
    if (!videoRef.current.paused && !videoRef.current.ended) {
      syncLoopRef.current = requestAnimationFrame(handleSync);
    }
  }, [activeCue, isIOS]);

  // Start/Stop Loop based on play state
  useEffect(() => {
    if (isPlaying) {
      syncLoopRef.current = requestAnimationFrame(handleSync);
    } else {
      if (syncLoopRef.current) cancelAnimationFrame(syncLoopRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
      setActiveCue(null);
    }
    return () => {
      if (syncLoopRef.current) cancelAnimationFrame(syncLoopRef.current);
    };
  }, [isPlaying, handleSync]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error("Play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const resetPlayer = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* Player Container */}
      <div 
        ref={playerContainerRef}
        className={`relative bg-black overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-100 
        ${isFullscreen ? 'w-full h-full rounded-none' : 'aspect-video rounded-2xl'}
        ${activeCue && !isFullscreen ? 'shadow-cyan-500/20 ring-2 ring-cyan-500/50 scale-[1.005]' : ''}
        ${!showControls && isPlaying ? 'cursor-none' : 'cursor-default'}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleMouseMove} // Ensure touch wakes up controls
      >
        
        {/* Visual Vibration Overlay */}
        {activeCue && (
            <>
             <div className="absolute inset-0 pointer-events-none z-20 animate-rumble opacity-20 bg-cyan-400 mix-blend-overlay"></div>
             <div className="absolute inset-0 pointer-events-none z-20 border-4 border-cyan-500/30 rounded-2xl animate-pulse"></div>
            </>
        )}

        <video
          ref={videoRef}
          src={VIDEO_URL}
          className="w-full h-full object-contain bg-zinc-900"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />

        {/* Loader */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          </div>
        )}

        {/* Big Play Button (Center) - Only when paused */}
        {!isPlaying && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 transition-colors pointer-events-none">
                <button 
                    className="w-20 h-20 bg-cyan-500/90 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] backdrop-blur pointer-events-auto hover:scale-110 transition-transform duration-200"
                    onClick={togglePlay}
                >
                    <Play size={32} fill="white" className="text-white ml-1" />
                </button>
            </div>
        )}

        {/* Controls Bar (Bottom) */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-30 transition-all duration-500 ease-out flex flex-col gap-3 
            ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-cyan-400 transition">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <button onClick={toggleMute} className="text-zinc-300 hover:text-white transition">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div className="text-xs font-mono text-zinc-400">
                        {activeCue ? <span className="text-cyan-400 animate-pulse font-bold">HAPTIC ACTIVE</span> : <span>SYNC ENGINE ON</span>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={resetPlayer} className="text-zinc-300 hover:text-white transition" title="Replay">
                        <RefreshCw size={20} />
                    </button>
                    <button onClick={toggleFullscreen} className="text-zinc-300 hover:text-white transition" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* iOS Compatibility Warning */}
      {isIOS && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200/90">
                <span className="font-semibold text-amber-400 block mb-1">iOS Device Detected</span>
                Apple prevents web browsers from accessing physical vibration. The player will use visual shake effects instead. For physical haptics, please use an Android device.
            </div>
        </div>
      )}
    </div>
  );
};