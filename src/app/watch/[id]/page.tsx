
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import staticChannelData from "@/lib/channels.json";
import { ArrowLeft, Maximize, Info } from "lucide-react";
import Hls from "hls.js";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query } from "firebase/firestore";

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const db = useFirestore();
  const channelId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch channels from Firestore or fallback to static
  const channelsRef = db ? collection(db, "channels") : null;
  const channelsQuery = useMemo(() => channelsRef ? query(channelsRef) : null, [channelsRef]);
  const { data: dbChannels } = useCollection(channelsQuery);

  const allChannels = dbChannels && dbChannels.length > 0 ? dbChannels : staticChannelData.channels;
  const channel = allChannels.find((c: any) => (c.id === channelId || c.__id === channelId));

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

  useEffect(() => {
    if (channel?.stream_url && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(channel.stream_url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(() => {
            console.log("Autoplay prevented");
          });
        });
        return () => hls.destroy();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = channel.stream_url;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [channel]);

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

  const isHls = !!channel.stream_url;
  const playerUrl = isHls ? "" : `https://www.youtube.com/embed/${channel.youtube_id}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`;

  return (
    <div className="kaios-viewport flex flex-col bg-black overflow-hidden relative">
      {!isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-2 flex items-center gap-2">
          <ArrowLeft 
            className="w-4 h-4 text-white cursor-pointer" 
            onClick={() => router.push("/")}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-[10px] text-white font-bold truncate">
              {channel.name}
            </h2>
          </div>
        </div>
      )}

      <div className={`relative flex-1 bg-black flex items-center justify-center ${isFullscreen ? 'z-50' : ''}`}>
        {isHls ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            controls
            playsInline
            autoPlay
            muted
          />
        ) : (
          <iframe
            src={playerUrl}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

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

      {isFullscreen && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[8px] px-2 py-0.5 rounded-full z-[60]">
          Press OK to exit Fullscreen
        </div>
      )}
    </div>
  );
}
