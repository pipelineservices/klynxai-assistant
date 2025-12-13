"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import IncidentList from "@/components/IncidentList";
import IncidentDetail from "@/components/IncidentDetail";

export default function AppShell() {
  const [selectedThreadTs, setSelectedThreadTs] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col">
      <TopBar />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr]">
        <div className="border-r border-slate-200 h-full">
          <IncidentList
            selectedThreadTs={selectedThreadTs}
            onSelect={(ts) => setSelectedThreadTs(ts)}
          />
        </div>

        <div className="h-full">
          <IncidentDetail threadTs={selectedThreadTs} />
        </div>
      </div>
    </div>
  );
}
