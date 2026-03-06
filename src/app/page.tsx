
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import channelData from "@/lib/channels.json";
import { cn } from "@/lib/utils";
import { Tv, Radio, Search, ChevronRight, ChevronLeft, Globe, Briefcase, LayoutGrid } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeChannelIndex, setActiveChannelIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const categories = channelData.categories;
  const currentCategory = categories[activeCategoryIndex];
  
  const filteredChannels = channelData.channels.filter(c => 
    currentCategory === "All" || c.category === currentCategory
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setActiveChannelIndex(prev => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveChannelIndex(prev => Math.min(filteredChannels.length - 1, prev + 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setActiveCategoryIndex(prev => (prev > 0 ? prev - 1 : categories.length - 1));
          setActiveChannelIndex(0);
          break;
        case "ArrowRight":
          e.preventDefault();
          setActiveCategoryIndex(prev => (prev < categories.length - 1 ? prev + 1 : 0));
          setActiveChannelIndex(0);
          break;
        case "Enter":
        case "SoftCenter": // KaiOS specific
          if (filteredChannels[activeChannelIndex]) {
            router.push(`/watch/${filteredChannels[activeChannelIndex].id}`);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeChannelIndex, activeCategoryIndex, filteredChannels, categories.length, router]);

  // Handle scrolling of active element into view
  useEffect(() => {
    const activeElement = document.getElementById(`channel-${activeChannelIndex}`);
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeChannelIndex]);

  return (
    <div className="kaios-viewport flex flex-col font-body">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-2 py-1 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-1">
          <Tv className="w-4 h-4" />
          <h1 className="text-xs font-bold tracking-tight">NewsTV</h1>
        </div>
        <div className="text-[10px] bg-accent px-1 rounded font-bold animate-pulse">
          LIVE
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-secondary flex items-center justify-between px-1 py-1 overflow-hidden border-b">
        <ChevronLeft className="w-3 h-3 text-primary shrink-0 opacity-50" />
        <div className="flex-1 flex justify-center">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            {currentCategory}
          </span>
        </div>
        <ChevronRight className="w-3 h-3 text-primary shrink-0 opacity-50" />
      </div>

      {/* Channel List */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto bg-background p-1 space-y-1"
      >
        {filteredChannels.map((channel, idx) => (
          <div
            key={channel.id}
            id={`channel-${idx}`}
            onClick={() => router.push(`/watch/${channel.id}`)}
            className={cn(
              "flex items-center gap-2 p-2 rounded border border-transparent transition-all duration-150 cursor-pointer",
              idx === activeChannelIndex 
                ? "bg-primary text-white shadow-md scale-[1.02] translate-x-1" 
                : "bg-white text-foreground shadow-sm hover:bg-gray-50"
            )}
          >
            <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded-sm overflow-hidden border">
              <Image
                src={channel.logo}
                alt={channel.name}
                fill
                className="object-cover"
                data-ai-hint="channel logo"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate leading-tight">
                {channel.name}
              </div>
              <div className={cn(
                "text-[10px] truncate",
                idx === activeChannelIndex ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {channel.category}
              </div>
            </div>
            {idx === activeChannelIndex && (
              <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
            )}
          </div>
        ))}

        {filteredChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <LayoutGrid className="w-8 h-8 mb-2" />
            <span className="text-[10px]">No channels found</span>
          </div>
        )}
      </div>

      {/* Footer / Hint */}
      <div className="bg-gray-100 border-t px-2 py-0.5 flex justify-between text-[9px] font-medium text-gray-500">
        <span>LEFT/RIGHT: Categories</span>
        <span className="font-bold text-primary">OK: Play</span>
      </div>
    </div>
  );
}
