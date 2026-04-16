'use client';

import { useState, useEffect } from "react";
import { PlusIcon, XIcon, TrashIcon, KeyIcon, LockIcon, DownloadIcon, UploadIcon } from "@phosphor-icons/react";
import { Button } from "@licht/ui/components/button";
import { Input } from "@licht/ui/components/input";
import { useRef } from "react";

type EnvironmentManagerProps = {
  projectId: string;
  environments: any[];
  onClose: () => void;
  onRefresh: () => void;
};

export function EnvironmentManager({ projectId, environments, onClose, onRefresh }: EnvironmentManagerProps) {
  const [activeEnvId, setActiveEnvId] = useState<string | null>(environments.length > 0 ? environments[0].id : null);
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");

  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [newVarSecret, setNewVarSecret] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeEnvId) {
      fetchVariables(activeEnvId);
    } else {
      setVariables([]);
    }
  }, [activeEnvId]);

  const fetchVariables = async (envId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:4317/environments/${envId}/variables`);
      if (res.ok) {
        const data = await res.json();
        setVariables(data.variables || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:4317/projects/${projectId}/environments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEnvName.trim() }),
      });
      if (res.ok) {
        setNewEnvName("");
        onRefresh();
        const data = await res.json();
        setActiveEnvId(data.environment.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEnvId || !newVarKey.trim()) return;

    try {
      const res = await fetch(`http://127.0.0.1:4317/environments/${activeEnvId}/variables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newVarKey.trim(),
          value: newVarValue,
          is_secret: newVarSecret
        }),
      });
      if (res.ok) {
        setNewVarKey("");
        setNewVarValue("");
        setNewVarSecret(false);
        fetchVariables(activeEnvId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:4317/projects/${projectId}/export`);
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `environments_export_${projectId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch(`http://127.0.0.1:4317/projects/${projectId}/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ environments: Array.isArray(json) ? json : [json] }),
        });
        if (res.ok) {
          onRefresh();
        }
      } catch (err) {
        console.error("Import failed", err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-[80vh] w-[900px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] shadow-2xl animate-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between border-b border-white/5 bg-[#141414] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Manage Environments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Define variables that can be shared across multiple requests.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground">
            <XIcon weight="bold" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          <div className="w-64 shrink-0 border-r border-white/5 bg-[#111111] flex flex-col">
            <div className="p-4 border-b border-white/5">
              <form onSubmit={handleCreateEnv} className="flex gap-2">
                <Input
                  placeholder="New Environment"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="h-8 text-xs bg-black/40 border-white/10"
                />
                <Button type="submit" size="icon" variant="outline" className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground border-white/10 bg-black/40">
                  <PlusIcon />
                </Button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {environments.length === 0 ? (
                <div className="text-xs text-center text-muted-foreground p-4">No environments yet.</div>
              ) : (
                environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setActiveEnvId(env.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeEnvId === env.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                  >
                    {env.name}
                  </button>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-black/40 border-white/10" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon /> Import
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-black/40 border-white/10" onClick={handleExport}>
                <DownloadIcon /> Export
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-transparent relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none -z-10" />

            {activeEnvId ? (
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <KeyIcon className="text-primary" /> Variables
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {loading ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Loading variables...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-white/5 overflow-hidden bg-black/40">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white/5 border-b border-white/5 text-xs text-muted-foreground uppercase tracking-wider">
                            <tr>
                              <th className="font-medium px-4 py-2 w-1/3">Key</th>
                              <th className="font-medium px-4 py-2 w-1/2">Value</th>
                              <th className="font-medium px-4 py-2 w-[50px]"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {variables.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-xs">No variables defined.</td>
                              </tr>
                            )}
                            {variables.map((v) => (
                              <tr key={v.id} className="border-b border-white/5 last:border-0 group">
                                <td className="px-4 py-2 font-mono text-xs text-emerald-400">{v.key}</td>
                                <td className="px-4 py-2 font-mono text-xs opacity-80">
                                  {v.is_secret ? "••••••••••••" : v.value}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <form onSubmit={handleAddVariable} className="flex gap-3 bg-white/5 p-4 rounded-lg border border-white/10 items-end">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-xs text-muted-foreground uppercase font-semibold">Key</label>
                          <Input required placeholder="API_KEY" className="font-mono text-xs h-9 bg-black/50" value={newVarKey} onChange={e => setNewVarKey(e.target.value)} />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <label className="text-xs text-muted-foreground uppercase font-semibold">Value</label>
                          <Input required placeholder="Value" className="font-mono text-xs h-9 bg-black/50" value={newVarValue} onChange={e => setNewVarValue(e.target.value)} />
                        </div>
                        <Button type="button" variant="ghost" className={`h-9 px-3 gap-2 border border-transparent ${newVarSecret ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'text-muted-foreground hover:bg-white/10'}`} onClick={() => setNewVarSecret(!newVarSecret)}>
                          <LockIcon /> {newVarSecret ? "Secret" : "Plain"}
                        </Button>
                        <Button type="submit" className="h-9 gap-2">
                          <PlusIcon /> Add
                        </Button>
                      </form>

                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <KeyIcon size={48} className="mb-4 opacity-20" />
                <p>Select or create an environment from the sidebar to manage its variables.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
