'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, FolderOpenIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@licht/ui/components/button";
import { Card } from "@licht/ui/components/card";
import { Input } from "@licht/ui/components/input";
import { Label } from "@licht/ui/components/label";

type Project = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export function ProjectPicker() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:4317/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch("http://127.0.0.1:4317/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects([data.project, ...projects]);
        setIsCreating(false);
        setNewProjectName("");
      }
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const handleOpenProject = (id: string) => {
    router.push(`/project/${id}`);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Select a Workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose an existing project or create a new one to get started.
          </p>
        </div>

        <Card className="overflow-hidden border-border/40 bg-card/40 py-0 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 p-6">
          {isCreating ? (
            <div className="animate-in fade-in slide-in-from-right-4">
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">Project Name</Label>
                  <Input
                    id="projectName"
                    autoFocus
                    placeholder="e.g. Acme API Bridge"
                    className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary/50 text-lg"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="h-11">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-11 flex-1 font-medium bg-primary hover:bg-primary/90">
                    Create Project
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Recent Projects
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)} className="h-8 gap-2 hover:bg-white/5">
                  <PlusIcon weight="bold" />
                  New Project
                </Button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 bg-black/20 py-12 text-center">
                  <FolderOpenIcon size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No projects found.</p>
                  <Button variant="link" onClick={() => setIsCreating(true)} className="mt-2 text-primary">
                    Create your first project &rarr;
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleOpenProject(project.id)}
                      className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:bg-white/5 hover:border-white/10 active:scale-[0.98]"
                    >
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Last updated {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <CaretRightIcon weight="bold" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
