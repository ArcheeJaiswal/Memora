import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen, X, Maximize2, Minimize2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export default function PomodoroTimer() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [isMinimized, setIsMinimized] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Audio ref for the alarm
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const playAlarm = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContext.current;
    
    // Play a gentle "ding-ding" sound
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(880, now, 0.5); // A5
    playNote(1108.73, now + 0.2, 0.5); // C#6
  };

  const handleComplete = () => {
    setIsActive(false);
    playAlarm();

    if (mode === "work") {
      setSessionsCompleted((prev) => prev + 1);
      setMode("break");
      setTimeLeft(BREAK_TIME);
      
      // Save study time (25 mins) to local storage for analytics
      const today = new Date().toDateString();
      const stored = JSON.parse(localStorage.getItem("studyTime") || "{}");
      stored[today] = (stored[today] || 0) + 25;
      localStorage.setItem("studyTime", JSON.stringify(stored));

      toast({
        title: "Focus session complete! 🎉",
        description: "Great job! Time for a 5-minute break.",
      });
      
      // Auto-expand if minimized
      if (isMinimized) setIsMinimized(false);
    } else {
      setMode("work");
      setTimeLeft(WORK_TIME);
      toast({
        title: "Break is over! 📚",
        description: "Ready for another focus session?",
      });
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: "work" | "break") => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  /**
   * SVG Progress Ring Math:
   * The circumference of a circle is 2 * PI * r. 
   * For the main timer (r=40), circumference = ~251. 
   * For the mini timer (r=8), circumference = ~50.
   * `strokeDashoffset` is calculated to 'hide' a percentage of the stroke based on timeLeft.
   */
  const totalTime = mode === "work" ? WORK_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = 251 - (251 * progress) / 100; // Adjusted to match main timer radius of 40 (2 * 3.14 * 40 ≈ 251)

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all border border-[#2D3748] ${
            mode === "work" ? "bg-[#161B22] text-[#F8FAFC]" : "bg-[#161B22] text-[#06B6D4]"
          } hover:scale-105`}
        >
          {/* Mini progress ring */}
          <div className="relative w-5 h-5">
            <svg className="w-5 h-5 transform -rotate-90">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" className="opacity-20" />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke={mode === "work" ? "#7C3AED" : "#06B6D4"}
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="50"
                strokeDashoffset={50 - (50 * progress) / 100}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
          <span className="font-mono font-bold tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <Maximize2 className="w-4 h-4 text-[#94A3B8]" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Card className="w-72 bg-[#161B22]/95 backdrop-blur-xl border border-[#2D3748] rounded-3xl shadow-2xl overflow-hidden text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D3748] bg-[#0D1117]/50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${mode === "work" ? "bg-[#7C3AED]/20 text-[#A78BFA]" : "bg-[#06B6D4]/20 text-[#06B6D4]"}`}>
              {mode === "work" ? <BookOpen className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">
                {mode === "work" ? "Focus Session" : "Short Break"}
              </span>
              <span className="text-[10px] text-[#94A3B8] leading-tight font-medium">
                Pomodoro Technique
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Main Timer Ring */}
          <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="76" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#1E293B]" />
              <circle
                cx="80"
                cy="80"
                r="76"
                stroke={mode === "work" ? "#7C3AED" : "#06B6D4"}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="477" /* 2 * PI * 76 */
                strokeDashoffset={477 - (477 * progress) / 100}
                className="transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-mono font-bold tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-widest mt-1">
                {mode === "work" ? "Focus" : "Relax"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 w-full justify-center mb-6">
            <Button
              onClick={resetTimer}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-[#2D3748] bg-[#0D1117] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={toggleTimer}
              className={`w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 ${
                mode === "work" ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white" : "bg-[#06B6D4] hover:bg-[#0891B2] text-white"
              }`}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>

            <Button
              onClick={() => switchMode(mode === "work" ? "break" : "work")}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-[#2D3748] bg-[#0D1117] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]"
              title={`Skip to ${mode === "work" ? "break" : "focus"}`}
            >
              {mode === "work" ? <Coffee className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </Button>
          </div>

          {/* Sessions Counter */}
          <div className="flex items-center justify-center gap-1.5 w-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < (sessionsCompleted % 4)
                    ? "bg-[#7C3AED]"
                    : "bg-[#1E293B]"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[#64748B] mt-2">
            {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed today
          </p>
        </div>
      </Card>
    </div>
  );
}
