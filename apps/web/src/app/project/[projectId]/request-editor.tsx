'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { CaretDownIcon, PlayIcon, CodeBlockIcon, ListIcon, GlobeIcon, ClockIcon, TrashIcon, KeyIcon } from "@phosphor-icons/react";
import { Button } from "@licht/ui/components/button";
import { Input } from "@licht/ui/components/input";

type RequestEditorProps = {
  projectId: string;
  activeEnv?: any;
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

export function RequestEditor({ projectId, activeEnv }: RequestEditorProps) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");

  const [reqTab, setReqTab] = useState<"params" | "headers" | "body">("headers");
  const [resTab, setResTab] = useState<"body" | "headers">("body");

  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [bodyText, setBodyText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [variables, setVariables] = useState<any[]>([]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);

  const lastFocusedRef = useRef<{ value: string, setter: (v: string) => void, el: HTMLInputElement | HTMLTextAreaElement } | null>(null);

  useEffect(() => {
    if (activeEnv?.id) {
      fetch(`http://127.0.0.1:4317/environments/${activeEnv.id}/variables`)
        .then(res => res.json())
        .then(data => setVariables(data.variables || []))
        .catch(err => console.error(err));
    } else {
      setVariables([]);
    }
  }, [activeEnv?.id]);

  useEffect(() => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const newParams: { key: string; value: string }[] = [];
      urlObj.searchParams.forEach((value, key) => {
        newParams.push({ key, value });
      });
      if (newParams.length > 0) {
        setQueryParams([...newParams, { key: "", value: "" }]);
      }
    } catch (e) {
      // invalid URL, ignore
    }
  }, []);

  const updateUrlWithParams = (params: { key: string; value: string }[]) => {
    try {
      const [baseUrl, _] = url.split("?");
      const searchParams = new URLSearchParams();
      params.forEach(p => {
        if (p.key) searchParams.append(p.key, p.value);
      });
      // We unescape {{ and }} so they are readable and resolvable in the URL bar
      const queryString = searchParams.toString()
        .replace(/%7B%7B/g, "{{")
        .replace(/%7D%7D/g, "}}");

      setUrl(queryString ? `${baseUrl}?${queryString}` : baseUrl);
    } catch (e) { }
  };

  const resolveVars = (text: string) => {
    let result = text;
    // Also handle URL encoded braces if they leaked in
    const decoded = decodeURIComponent(text);
    let hasEncoded = decoded !== text;

    variables.forEach(v => {
      const literalRegex = new RegExp(`{{${v.key}}}`, "g");
      result = result.replace(literalRegex, v.value);

      if (hasEncoded) {
        const encodedRegex = new RegExp(`%7B%7B${v.key}%7D%7D`, "g");
        result = result.replace(encodedRegex, v.value);
      }
    });
    return result;
  };

  const insertVariable = (varName: string) => {
    if (!lastFocusedRef.current) return;
    const { value, setter, el } = lastFocusedRef.current;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newValue = value.substring(0, start) + `{{${varName}}}` + value.substring(end);

    setter(newValue);

    // Attempt to restore focus and position
    setTimeout(() => {
      el.focus();
      const newPos = start + varName.length + 4; // {{ + name + }}
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSend = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const start = Date.now();
      try {
        const headersObj: Record<string, string> = {};
        headers.forEach(h => { if (h.key) headersObj[h.key] = resolveVars(h.value); });

        const reqPayload = {
          method,
          url: resolveVars(url),
          headers: headersObj,
          requestBody: ["POST", "PUT", "PATCH"].includes(method) ? resolveVars(bodyText) : undefined
        };

        const res = await fetch("http://127.0.0.1:4317/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqPayload)
        });

        const proxyData = await res.json();

        if (res.ok) {
          let json = null;
          try { json = JSON.parse(proxyData.data); } catch (e) { }

          setResponse({
            status: proxyData.status,
            time: proxyData.time,
            size: proxyData.data?.length || 0,
            data: json || proxyData.data,
            headers: Object.entries(proxyData.headers || {}),
            error: proxyData.error
          });
        } else {
          throw new Error(proxyData.error || "Proxy failed");
        }
      } catch (err: any) {
        setResponse({
          error: err.message,
          time: Date.now() - start,
        });
      }

    } finally {
      setIsLoading(false);
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
    <div className="flex h-full flex-col">
      <div className="flex p-4 gap-3 bg-black/10 border-b border-white/5 shadow-sm z-10 relative backdrop-blur-sm">
        <div className="flex shadow-sm rounded-lg overflow-hidden border border-border/50 focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 flex-1 bg-[#1a1a1a]">
          <div className="relative group">
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className={`h-12 appearance-none bg-transparent pl-4 pr-8 font-bold tracking-wider outline-none ${getMethodColor(method)}`}
            >
              {METHODS.map(m => <option key={m} value={m} className="bg-[#1a1a1a] text-foreground">{m}</option>)}
            </select>
            <CaretDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <div className="absolute right-0 top-[15%] bottom-[15%] w-px bg-border/50" />
          </div>

          <input
            value={url}
            onFocus={(e) => lastFocusedRef.current = { value: url, setter: setUrl, el: e.target }}
            onChange={e => {
              setUrl(e.target.value);
              if (lastFocusedRef.current?.el === e.target) lastFocusedRef.current.value = e.target.value;
            }}
            className="flex-1 h-12 bg-transparent px-4 font-mono text-sm outline-none text-foreground placeholder:text-muted-foreground/30"
            placeholder="Enter Request URL"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
        </div>

        <Button size="lg" className="h-12 px-8 font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95" onClick={handleSend} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <PlayIcon weight="fill" /> Send
            </div>
          )}
        </Button>
      </div>

      {/* Variables Quick Bar */}
      {variables.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 border-b border-primary/10 overflow-x-auto no-scrollbar scroll-smooth">
          <KeyIcon size={12} className="text-primary shrink-0" weight="bold" />
          <span className="text-[10px] uppercase font-bold text-primary/60 whitespace-nowrap mr-1">Variables:</span>
          <div className="flex gap-1.5 font-mono">
            {variables.map(v => (
              <button
                key={v.id}
                onClick={() => insertVariable(v.key)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all active:scale-95 whitespace-nowrap"
              >
                {v.key}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-4 flex flex-col border-r border-white/5 relative bg-transparent overflow-hidden">
          <div className="flex border-b border-white/5 px-2 bg-black/20">
            <button className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${reqTab === 'params' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setReqTab('params')}>
              Params {queryParams.filter(p => p.key).length > 0 && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{queryParams.filter(p => p.key).length}</span>}
            </button>
            <button className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${reqTab === 'headers' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setReqTab('headers')}>
              Headers {headers.filter(h => h.key).length > 0 && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{headers.filter(h => h.key).length}</span>}
            </button>
            <button className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${reqTab === 'body' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setReqTab('body')}>
              Body
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-black/10">
            {reqTab === "headers" && (
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2 group">
                    <Input className="font-mono text-sm bg-black/30 border-white/5" placeholder="Key" value={h.key} onFocus={(e) => lastFocusedRef.current = {
                      value: h.key, setter: (val) => {
                        const newH = [...headers]; newH[i].key = val; setHeaders(newH);
                      }, el: e.target
                    }} onChange={e => {
                      const newH = [...headers]; newH[i].key = e.target.value; setHeaders(newH);
                      if (lastFocusedRef.current?.el === e.target) lastFocusedRef.current.value = e.target.value;
                    }} />
                    <Input className="font-mono text-sm bg-black/30 border-white/5" placeholder="Value" value={h.value} onFocus={(e) => lastFocusedRef.current = {
                      value: h.value, setter: (val) => {
                        const newH = [...headers]; newH[i].value = val; setHeaders(newH);
                      }, el: e.target
                    }} onChange={e => {
                      const newH = [...headers]; newH[i].value = e.target.value; setHeaders(newH);
                      if (lastFocusedRef.current?.el === e.target) lastFocusedRef.current.value = e.target.value;
                    }} />
                    <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400" onClick={() => {
                      const newH = headers.filter((_, idx) => idx !== i);
                      setHeaders(newH.length ? newH : [{ key: "", value: "" }]);
                    }}><TrashIcon /></Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-foreground" onClick={() => setHeaders([...headers, { key: "", value: "" }])}>
                  + Add Header
                </Button>
              </div>
            )}

            {reqTab === "body" && (
              <div className="h-full flex flex-col">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"> raw</span>
                  <span>JSON</span>
                </div>
                <textarea
                  value={bodyText}
                  onFocus={(e) => lastFocusedRef.current = { value: bodyText, setter: setBodyText, el: e.target }}
                  onChange={(e) => {
                    setBodyText(e.target.value);
                    if (lastFocusedRef.current?.el === e.target) lastFocusedRef.current.value = e.target.value;
                  }}
                  className="flex-1 w-full bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none text-emerald-400"
                  placeholder="{}"
                />
              </div>
            )}

            {reqTab === "params" && (
              <div className="space-y-2">
                {queryParams.map((p, i) => (
                  <div key={i} className="flex gap-2 group">
                    <Input className="font-mono text-sm bg-black/30 border-white/5" placeholder="Key" value={p.key} onFocus={(e) => lastFocusedRef.current = {
                      value: p.key, setter: (val) => {
                        const newP = [...queryParams]; newP[i].key = val; setQueryParams(newP); updateUrlWithParams(newP);
                      }, el: e.target
                    }} onChange={e => {
                      const newP = [...queryParams]; newP[i].key = e.target.value; setQueryParams(newP); updateUrlWithParams(newP);
                      if (lastFocusedRef.current?.el === e.target) lastFocusedRef.current.value = e.target.value;
                    }} />
                    <Input className="font-mono text-sm bg-black/30 border-white/5" placeholder="Value" value={p.value} onFocus={(e) => lastFocusedRef.current = {
                      value: p.value, setter: (val) => {
                        const newP = [...queryParams]; newP[i].value = val; setQueryParams(newP); updateUrlWithParams(newP);
                      }, el: e.target
                    }} onChange={e => {
                      const newP = [...queryParams]; newP[i].value = e.target.value; setQueryParams(newP); updateUrlWithParams(newP);
                      if (lastFocusedRef.current?.el === e.target) lastFocusedRef.current.value = e.target.value;
                    }} />
                    <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400" onClick={() => {
                      const newP = queryParams.filter((_, idx) => idx !== i);
                      const updated = newP.length ? newP : [{ key: "", value: "" }];
                      setQueryParams(updated);
                      updateUrlWithParams(updated);
                    }}><TrashIcon /></Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-foreground" onClick={() => setQueryParams([...queryParams, { key: "", value: "" }])}>
                  + Add Param
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-6 flex flex-col bg-[#0c0c0c] relative">
          <div className="flex items-center justify-between border-b border-white/5 px-2 bg-black/20">
            <div className="flex">
              <button className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${resTab === 'body' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setResTab('body')}>
                Response
              </button>
              <button className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${resTab === 'headers' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setResTab('headers')}>
                Headers {response?.headers && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{response.headers.length}</span>}
              </button>
            </div>

            {response && (
              <div className="flex items-center gap-4 text-xs font-mono mr-4">
                <span className={`flex items-center gap-1 font-bold ${response.status >= 200 && response.status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                  <GlobeIcon /> {response.status}
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <ClockIcon /> {response.time} ms
                </span>
                <span className="text-muted-foreground">
                  {(response.size / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {!response ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="border border-white/10 rounded-full p-4 mb-4 bg-white/5">
                  <GlobeIcon size={32} />
                </div>
                <p>Enter URL and click Send to get a response</p>
              </div>
            ) : (
              <>
                {resTab === "body" && (
                  <div className="h-full w-full">
                    {response.error ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono text-sm">
                        Error: {response.error}
                      </div>
                    ) : (
                      <pre className="font-mono text-sm leading-relaxed text-emerald-400/90 whitespace-pre-wrap">
                        {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                {resTab === "headers" && (
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {response.headers?.map(([k, v]: any) => (
                        <tr key={k} className="border-b border-white/5 last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{k}</td>
                          <td className="py-2 font-mono text-xs text-foreground break-all">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
