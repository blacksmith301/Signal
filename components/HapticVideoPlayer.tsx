import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Smartphone, RefreshCw, Volume2, VolumeX, Zap, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { HAPTIC_CUES, VIDEO_URL } from '../constants';
import { Timeline } from './Timeline';

export const HapticVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const syncLoopRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCue, setActiveCue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canVibrate, setCanVibrate] = useState(true);

  // Check device capability
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) {
      setCanVibrate(false);
    }
  }, []);

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
        if (navigator.vibrate) {
            // Continuous vibration for the remainder of the cue
            const durationMs = (currentCue.endTime - t) * 1000;
            // Vibrate using a pattern to feel more "sonic" (rapid pulses) or just solid
            // Solid vibration feels more "motor-like" which fits a toothbrush
            navigator.vibrate(Math.max(0, durationMs));
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
  }, [activeCue]);

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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      // Reset vibration logic on seek
      if (navigator.vibrate) navigator.vibrate(0);
      setActiveCue(null);
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

  const currentActiveCueData = HAPTIC_CUES.find(c => c.id === activeCue);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Player Container */}
      <div className={`relative group aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-100 ${activeCue ? 'shadow-cyan-500/20 ring-2 ring-cyan-500/50 scale-[1.005]' : ''}`}>
        
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

        {/* Status Badge (Top Right) */}
        <div className="absolute top-4 right-4 z-30 pointer-events-none">
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
                 activeCue 
                 ? 'bg-cyan-500/90 border-cyan-400 text-white scale-110 font-bold' 
                 : 'bg-black/60 border-white/10 text-zinc-400'
             }`}>
                <Smartphone size={16} className={activeCue ? 'animate-bounce' : ''} />
                <span className="text-xs tracking-wider">
                    {activeCue ? 'VIBRATING' : 'HAPTICS READY'}
                </span>
             </div>
        </div>

        {/* Big Play Button (Center) - Only when paused */}
        {!isPlaying && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none">
                <button 
                    className="w-20 h-20 bg-cyan-500/90 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] backdrop-blur pointer-events-auto hover:scale-110 transition-transform duration-200"
                    onClick={togglePlay}
                >
                    <Play size={32} fill="white" className="text-white ml-1" />
                </button>
            </div>
        )}

        {/* Controls Bar (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-30 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-3">
            <Timeline currentTime={currentTime} duration={duration} onSeek={handleSeek} />
            
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
                </div>
            </div>
        </div>
      </div>

      {/* Info / Debug Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Current Action Card */}
        <div className={`p-5 rounded-xl border transition-all duration-300 ${activeCue ? 'bg-gradient-to-br from-cyan-900/40 to-zinc-900 border-cyan-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
             <div className="flex items-start justify-between mb-2">
                 <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Current Mode</h3>
                 {activeCue && <Zap size={16} className="text-cyan-400 animate-pulse" />}
             </div>
             <div className="min-h-[3rem]">
                {currentActiveCueData ? (
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{currentActiveCueData.label}</div>
                        <div className="text-sm text-cyan-200/70">{currentActiveCueData.description}</div>
                    </div>
                ) : (
                    <div className="text-lg font-medium text-zinc-600">Idle - Monitoring Audio...</div>
                )}
             </div>
        </div>

        {/* Device Status Card */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
             <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Device Compatibility</h3>
             <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${canVibrate ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                <div className="text-zinc-200 text-sm">
                    {canVibrate 
                        ? "Haptic Engine Detected" 
                        : "Haptic API Unavailable (Desktop)"}
                </div>
             </div>
             {!canVibrate && (
                 <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                     Your device or browser does not support the <code className="bg-zinc-800 px-1 rounded text-zinc-300">navigator.vibrate</code> API. Visual cues will still be displayed. Try on an Android device for the full experience.
                 </p>
             )}
        </div>

      </div>
    </div>
  );
};