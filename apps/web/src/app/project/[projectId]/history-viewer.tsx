'use client';

import { useState, useEffect } from "react";
import { ClockIcon, GlobeIcon, CaretRightIcon } from "@phosphor-icons/react";

type HistoryItem = {
  id: string;
  method: string;
  url: string;
  response_status: number;
  duration_ms: number;
  created_at: string;
  success: number;
};

export function HistoryViewer({ active }: { active: boolean }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active) {
      fetchHistory();
    }
  }, [active]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:4317/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case "GET": return "text-blue-400";
      case "POST": return "text-emerald-400";
      case "PUT": return "text-amber-400";
      case "DELETE": return "text-red-400";
      case "PATCH": return "text-purple-400";
      default: return "text-muted-foreground";
    }
  };


  return (
    <div className="flex h-full w-full flex-col bg-[#0c0c0c] z-10 relative text-foreground">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#141414] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2"><ClockIcon /> Request History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Recent requests sent through the Bridge Proxy</p>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse flex h-full items-center justify-center">Loading history...</div>
        ) : history.length === 0 ? (
           <div className="flex h-full items-center justify-center flex-col text-muted-foreground">
             <GlobeIcon size={48} className="mb-4 opacity-20" />
             <p>No requests found in history yet.</p>
           </div>
        ) : (
          <div className="space-y-2 max-w-4xl mx-auto">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 p-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-bold text-xs w-12 ${getMethodColor(item.method)}`}>
                    {item.method}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground truncate max-w-sm" title={item.url}>
                    {item.url}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs font-mono">
                  <span className={`w-12 text-right ${item.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.response_status || "ERR"}
                  </span>
                  <span className="text-muted-foreground w-16 text-right">
                    {item.duration_ms} ms
                  </span>
                  <span className="text-muted-foreground w-32 text-right">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
