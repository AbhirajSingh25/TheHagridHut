import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, CloudRain, Flame, Moon, Play, Pause, ChevronUp } from "lucide-react";

type SoundPreset = "rain" | "hearth" | "study";

export default function AmbientSoundController({ className = "" }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem("hagrids-ambient-volume");
    return saved ? parseFloat(saved) : 0.35;
  });
  const [preset, setPreset] = useState<SoundPreset>(() => {
    const saved = localStorage.getItem("hagrids-ambient-preset");
    return (saved as SoundPreset) || "rain";
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Web Audio API references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const crackleTimerRef = useRef<number | null>(null);

  // Initialize or reconfigure sound synthesis
  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Stop existing source if any
      if (noiseSourceRef.current) {
        try {
          noiseSourceRef.current.stop();
          noiseSourceRef.current.disconnect();
        } catch (_) {}
      }

      // Generate 5-second pink/brown noise buffer
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown/pink filter
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter to mimic rain vs hearth
      const filter = ctx.createBiquadFilter();
      if (preset === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(850, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else if (preset === "hearth") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(2.2, ctx.currentTime);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);
      }

      // Main Gain Node
      const gain = ctx.createGain();
      const currentVol = isMuted ? 0 : volume;
      gain.gain.setValueAtTime(currentVol * 0.18, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();

      noiseSourceRef.current = noiseSource;
      filterNodeRef.current = filter;
      gainNodeRef.current = gain;
      setIsPlaying(true);
    } catch (err) {
      console.warn("Ambient sound initialization:", err);
    }
  };

  const stopAudio = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch (_) {}
      noiseSourceRef.current = null;
    }
    if (crackleTimerRef.current) {
      clearInterval(crackleTimerRef.current);
      crackleTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Adjust volume live
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted || !isPlaying ? 0 : volume * 0.18;
      gainNodeRef.current.gain.setTargetAtTime(
        targetGain,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
    localStorage.setItem("hagrids-ambient-volume", volume.toString());
  }, [volume, isMuted, isPlaying]);

  // Handle preset change
  useEffect(() => {
    localStorage.setItem("hagrids-ambient-preset", preset);
    if (isPlaying) {
      startAudio();
    }
  }, [preset]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div className="flex items-center gap-1 bg-[#1A1512]/90 border border-[rgba(232,173,98,0.22)] rounded-full px-2 py-1 shadow-md backdrop-blur-md">
        {/* Play / Stop Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`touch-target p-1.5 rounded-full transition-all duration-200 ${
            isPlaying
              ? "bg-[#E8AD62] text-[#211B17] shadow-sm"
              : "text-[#B9AB97] hover:text-[#FFF7E9] hover:bg-[#2E231C]"
          }`}
          title={isPlaying ? "Pause study ambience" : "Listen to study ambience (Rain & Hearth)"}
          aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Ambient indicator icon */}
        <span className="text-xs text-[#EFE4D2] font-medium hidden sm:inline px-1">
          {preset === "rain" ? "Rain" : preset === "hearth" ? "Hearth" : "Study"}
        </span>

        {/* Mute button */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isPlaying}
          className={`p-1 rounded-full transition-colors ${
            !isPlaying
              ? "opacity-40 cursor-not-allowed text-[#B9AB97]"
              : isMuted
              ? "text-[#D96B58]"
              : "text-[#B9AB97] hover:text-[#FFF7E9]"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
          aria-label={isMuted ? "Unmute ambient sound" : "Mute ambient sound"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Expand settings popover */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full text-[#B9AB97] hover:text-[#FFF7E9] transition-transform"
          aria-label="Sound settings"
        >
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expandable Ambience Menu */}
      {isExpanded && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl bg-[#241B16] border border-[#E8AD62]/30 shadow-2xl z-50 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8AD62]/15 mb-3">
            <span className="text-xs font-semibold text-[#FFF7E9] font-display">Study Ambience</span>
            <span className="text-[10px] text-[#E8AD62] font-mono">WebAudio</span>
          </div>

          {/* Sound Presets */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => setPreset("rain")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                preset === "rain"
                  ? "bg-[#E8AD62]/20 border border-[#E8AD62]/40 text-[#F6CD8B]"
                  : "bg-[#1A1512] text-[#B9AB97] hover:text-[#FFF7E9]"
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span className="text-[10px]">Rain</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset("hearth")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                preset === "hearth"
                  ? "bg-[#E8AD62]/20 border border-[#E8AD62]/40 text-[#F6CD8B]"
                  : "bg-[#1A1512] text-[#B9AB97] hover:text-[#FFF7E9]"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="text-[10px]">Hearth</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset("study")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                preset === "study"
                  ? "bg-[#E8AD62]/20 border border-[#E8AD62]/40 text-[#F6CD8B]"
                  : "bg-[#1A1512] text-[#B9AB97] hover:text-[#FFF7E9]"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-[10px]">Night</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#B9AB97]">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#E8AD62] h-1.5 bg-[#1A1512] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
