import React, { useMemo } from 'react';
import { HAPTIC_CUES } from '../constants';
import { Zap } from 'lucide-react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ currentTime, duration, onSeek }) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // clamp between 0 and duration
    const newTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
    onSeek(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-1 select-none">
      
      <div 
        className="relative h-14 bg-zinc-900/80 backdrop-blur rounded-lg border border-zinc-800 cursor-pointer overflow-hidden group touch-none"
        onClick={handleTrackClick}
      >
        {/* Background Grid / Tick Marks */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #71717a 0px, transparent 1px, transparent 5%)' }}></div>

        {/* Haptic Safe Zones (Indicators) */}
        {HAPTIC_CUES.map((cue) => {
          if (duration === 0) return null;
          const startPct = (cue.startTime / duration) * 100; 
          const widthPct = ((cue.endTime - cue.startTime) / duration) * 100;
          const isActive = currentTime >= cue.startTime && currentTime < cue.endTime;

          return (
            <div
              key={cue.id}
              className={`absolute top-1.5 bottom-1.5 rounded flex flex-col items-center justify-center transition-all duration-200 border ${
                isActive 
                  ? 'bg-cyan-500/30 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10' 
                  : 'bg-zinc-800/60 border-zinc-700/50 hover:bg-zinc-700/60'
              }`}
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
              }}
              title={`${cue.label}`}
            >
              <Zap size={10} className={`mb-0.5 ${isActive ? 'text-cyan-200 animate-pulse' : 'text-zinc-500'}`} />
              <div className={`text-[8px] font-bold uppercase hidden sm:block ${isActive ? 'text-cyan-200' : 'text-zinc-500'}`}>
                Sync
              </div>
            </div>
          );
        })}

        {/* Playhead Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />
        
        {/* Playhead Knob (visible on drag/hover mostly, but keeping it static here) */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md z-20 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};