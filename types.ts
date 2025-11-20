export interface HapticCue {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  label: string;
  description: string;
  vibrationPattern?: number[];
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isVibrating: boolean;
  activeCueId: string | null;
}