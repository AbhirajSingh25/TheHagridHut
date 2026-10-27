import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, CloudRain, Flame, Moon, Play, Pause, ChevronUp } from "lucide-react";

type SoundPreset = "rain" | "hearth" | "study";

export default function AmbientSoundController({ className = "" }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem("hagrids-ambient-volume");
    return saved ? parseFloat(saved) : 0.3;
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

      // Filter to mimic rain vs hearth vs gentle room tone
      const filter = ctx.createBiquadFilter();
      if (preset === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);
      } else if (preset === "hearth") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(420, ctx.currentTime);
        filter.Q.setValueAtTime(2.0, ctx.currentTime);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(480, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      }

      // Main Gain Node
      const gain = ctx.createGain();
      const currentVol = isMuted ? 0 : volume;
      gain.gain.setValueAtTime(currentVol * 0.15, ctx.currentTime);

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
      const targetGain = isMuted || !isPlaying ? 0 : volume * 0.15;
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
    <div className={`relative inline-block select-none text-xs font-sans ${className}`}>
      <div className="flex items-center gap-1.5 bg-[#FAF5EC] dark:bg-[#2E2721] border border-[#49372B]/15 dark:border-[#E5D6BE]/15 rounded-full px-2.5 py-1 shadow-sm">
        {/* Play / Stop Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`p-1 rounded-full transition-all ${
            isPlaying
              ? "bg-[#49372B] text-[#FAF5EC] dark:bg-[#E5D6BE] dark:text-[#302820]"
              : "text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820] dark:hover:text-[#FAF5EC]"
          }`}
          title={isPlaying ? "Pause study ambience" : "Listen to rain study ambience"}
          aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Preset name */}
        <span className="text-[11px] font-medium text-[#6B5D50] dark:text-[#B8AFA3]">
          {preset === "rain" ? "Rain" : preset === "hearth" ? "Hearth" : "Room"}
        </span>

        {/* Mute button */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isPlaying}
          className={`p-0.5 rounded transition-colors ${
            !isPlaying
              ? "opacity-40 cursor-not-allowed text-[#9B8D7F]"
              : isMuted
              ? "text-[#AC5E50]"
              : "text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820]"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
          aria-label={isMuted ? "Unmute ambient sound" : "Mute ambient sound"}
        >
          {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>

        {/* Settings Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 text-[#9B8D7F] hover:text-[#302820] dark:hover:text-[#FAF5EC]"
          aria-label="Sound settings"
        >
          <ChevronUp
            className={`w-3 h-3 transition-transform duration-150 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Popover */}
      {isExpanded && (
        <div className="absolute right-0 bottom-full mb-2 w-56 p-3 rounded-lg bg-[#FAF5EC] dark:bg-[#2E2721] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 shadow-lg z-50 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#49372B]/10 dark:border-[#E5D6BE]/10 mb-2">
            <span className="text-xs font-semibold text-[#302820] dark:text-[#FAF5EC] font-serif">
              Study Ambience
            </span>
            <span className="text-[10px] text-[#AC7256] font-medium">Optional</span>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-2.5">
            <button
              type="button"
              onClick={() => setPreset("rain")}
              className={`flex flex-col items-center gap-1 p-1.5 rounded text-[11px] transition-colors ${
                preset === "rain"
                  ? "bg-[#49372B] text-[#FAF5EC]"
                  : "bg-[#F0E9DC] dark:bg-[#383029] text-[#6B5D50] dark:text-[#B8AFA3]"
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rain</span>
            </button>
            <button
              type="button"
              onClick={() => setPreset("hearth")}
              className={`flex flex-col items-center gap-1 p-1.5 rounded text-[11px] transition-colors ${
                preset === "hearth"
                  ? "bg-[#49372B] text-[#FAF5EC]"
                  : "bg-[#F0E9DC] dark:bg-[#383029] text-[#6B5D50] dark:text-[#B8AFA3]"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hearth</span>
            </button>
            <button
              type="button"
              onClick={() => setPreset("study")}
              className={`flex flex-col items-center gap-1 p-1.5 rounded text-[11px] transition-colors ${
                preset === "study"
                  ? "bg-[#49372B] text-[#FAF5EC]"
                  : "bg-[#F0E9DC] dark:bg-[#383029] text-[#6B5D50] dark:text-[#B8AFA3]"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Room</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[#6B5D50] dark:text-[#B8AFA3]">
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
              className="w-full accent-[#49372B] dark:accent-[#AC7256] h-1 bg-[#E5D6BE] dark:bg-[#383029] rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
