'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretLeftIcon, GearIcon, PlusIcon, CodeIcon, ClockIcon } from "@phosphor-icons/react";
import { Button } from "@licht/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@licht/ui/components/select";

import { EnvironmentManager } from "./environment-manager";
import { RequestEditor } from "./request-editor";
import { HistoryViewer } from "./history-viewer";

type Project = { id: string; name: string };
type Environment = { id: string; name: string };

export default function ProjectWorkspace() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(null);

  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");

  const fetchData = async () => {
    try {
      const resProj = await fetch(`http://127.0.0.1:4317/projects`);
      if (resProj.ok) {
        const data = await resProj.json();
        const found = data.projects.find((p: Project) => p.id === projectId);
        if (found) setProject(found);
      }

      const resEnvs = await fetch(`http://127.0.0.1:4317/projects/${projectId}/environments`);
      if (resEnvs.ok) {
        const data = await resEnvs.json();
        setEnvironments(data.environments || []);
        if (data.environments && data.environments.length > 0 && !activeEnvId) {
          setActiveEnvId(data.environments[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load workspace data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  if (!project) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground animate-pulse">Loading workspace...</div>;
  }

  const activeEnv = environments.find((e) => e.id === activeEnvId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/40 px-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => router.push("/")}>
            <CaretLeftIcon weight="bold" />
          </Button>
          <div className="h-4 w-px bg-border/50" />
          <h1 className="font-semibold text-sm mr-2">{project.name}</h1>

          <div className="flex space-x-1 border border-border/50 rounded-lg p-0.5 bg-black/20">
            <button
              onClick={() => setActiveTab("request")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === "request" ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-1.5"><CodeIcon /> Request</div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === "history" ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-1.5"><ClockIcon /> History</div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Environment:</span>
            <Select
              value={activeEnvId || undefined}
              onValueChange={setActiveEnvId}
            >
              <SelectTrigger className="h-8 w-[160px] bg-black/20 border-border/50">
                <SelectValue placeholder="No Environment">
                  {environments.find(e => e.id === activeEnvId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {environments.length === 0 ? (
                  <div className="px-2 py-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest">No Environments</div>
                ) : (
                  environments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-2 bg-black/20 border-border/50 hover:bg-white/5" onClick={() => setIsEnvManagerOpen(true)}>
            <GearIcon weight="bold" />
            Variables
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.05),transparent_100%)] pointer-events-none" />

        <div className={`h-full ${activeTab === "request" ? "block" : "hidden"}`}>
          <RequestEditor projectId={projectId} activeEnv={activeEnv} />
        </div>

        <div className={`h-full ${activeTab === "history" ? "block" : "hidden"}`}>
          <HistoryViewer active={activeTab === "history"} />
        </div>
      </main>

      {isEnvManagerOpen && (
        <EnvironmentManager
          projectId={projectId}
          environments={environments}
          onClose={() => setIsEnvManagerOpen(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
