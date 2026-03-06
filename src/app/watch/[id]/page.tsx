
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import channelData from "@/lib/channels.json";
import { ArrowLeft, Maximize, Volume2, Info } from "lucide-react";

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id as string;
  const channel = channelData.channels.find((c) => c.id === channelId);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Escape") {
        e.preventDefault();
        router.push("/");
      }
      if (e.key === "Enter" || e.key === "SoftCenter") {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isFullscreen]);

  if (!channel) {
    return (
      <div className="kaios-viewport flex items-center justify-center bg-background p-4 text-center">
        <div className="space-y-2">
          <p className="text-sm font-bold text-destructive">Error</p>
          <p className="text-xs">Channel not found.</p>
          <button 
            onClick={() => router.push("/")}
            className="text-[10px] bg-primary text-white px-2 py-1 rounded"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kaios-viewport flex flex-col bg-black overflow-hidden relative">
      {/* Player Header - Only show when not fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-2 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-white" />
          <div className="flex-1 min-w-0">
            <h2 className="text-[10px] text-white font-bold truncate">
              {channel.name}
            </h2>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div className={`relative flex-1 bg-black flex items-center justify-center ${isFullscreen ? 'z-50' : ''}`}>
        <iframe
          src={`https://www.youtube.com/embed/${channel.youtube_id}?autoplay=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3`}
          className="absolute inset-0 w-full h-full border-none pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        
        {/* Overlay to catch focus/hints */}
        <div className="absolute inset-0 z-10 pointer-events-none" />
      </div>

      {/* Control Bar - Only show when not fullscreen */}
      {!isFullscreen && (
        <div className="bg-primary text-primary-foreground p-1 flex justify-between items-center text-[9px] font-bold">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>LIVE STREAM</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Maximize className="w-3 h-3" />
              <span>OK: FULL</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>BACK: LIST</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast-style indicator for Fullscreen */}
      {isFullscreen && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[8px] px-2 py-0.5 rounded-full z-[60] animate-out fade-out fill-mode-forwards duration-1000 delay-[2000ms]">
          Press OK to exit Fullscreen
        </div>
      )}
    </div>
  );
}
