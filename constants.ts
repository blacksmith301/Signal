import { HapticCue } from './types';

export const HAPTIC_CUES: HapticCue[] = [
  {
    id: 'cue-start-burst',
    startTime: 6.2,
    endTime: 6.5,
    label: 'Activation',
    description: 'Initial activation burst'
  },
  {
    id: 'cue-intense',
    startTime: 9.5,
    endTime: 12,
    label: 'Intense Clean',
    description: 'High frequency sonic vibration'
  },
  {
    id: 'cue-pulse',
    startTime: 15.5,
    endTime: 17,
    label: 'Pulse Mode',
    description: 'Rapid rhythmic bursts'
  },
  {
    id: 'cue-whitening',
    startTime: 21,
    endTime: 22.2,
    label: 'Whitening Pulse',
    description: 'Triple-burst polishing action',
    vibrationPattern: [300, 200, 300, 200, 300, 200]
  },
  {
    id: 'cue-deep',
    startTime: 28,
    endTime: 30,
    label: 'Deep Scrub',
    description: 'Sustained deep cleaning action'
  },
  {
    id: 'cue-closing-burst',
    startTime: 38,
    endTime: 38.1,
    label: 'Closing Burst',
    description: 'Final activation burst'
  }
];

export const VIDEO_URL = "https://closeup-sonicexpert.com/cdn/shop/videos/c/vp/0499295a775148d0a7d38998241f1758/0499295a775148d0a7d38998241f1758.HD-720p-2.1Mbps-27295103.mp4?v=0";