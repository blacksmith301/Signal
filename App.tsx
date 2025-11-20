import React from 'react';
import { HapticVideoPlayer } from './components/HapticVideoPlayer';
import { Activity, Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center relative overflow-x-hidden">
      
      {/* Background Ambiance */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <header className="w-full max-w-4xl mx-auto pt-12 pb-8 px-6 flex flex-col md:flex-row items-center md:justify-between gap-6 z-10">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
                    <Activity className="text-white w-8 h-8" />
                </div>
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    Signal Sonic Expert
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-widest">Demo</span>
                </h1>
                <p className="text-zinc-400 text-sm mt-1 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-400" />
                    Sonic Experience
                </p>
            </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-20 z-10">
        <HapticVideoPlayer />
      </main>

      <footer className="w-full border-t border-zinc-900 bg-zinc-950/50 backdrop-blur mt-auto z-10">
        <div className="max-w-4xl mx-auto px-6 py-8 flex justify-center items-center">
            <div className="text-xs text-zinc-600 text-center">
                <p>&copy; 2025 Signal Sonic Expert Demo | Prototype by DAT - The Ai Company</p>
            </div>
        </div>
      </footer>
    </div>
  );
}