'use client';

import { useEffect, useState } from "react";

type RuntimeStatus = "checking" | "connected" | "disconnected";

type HealthResponse = {
    ok: boolean;
    service: string;
    status: string;
    timestamp: number;
};

const HEALTH_URL = "http://127.0.0.1:4317/health";

export function useRuntimeHealth(intervalMs = 2000) {
    const [status, setStatus] = useState<RuntimeStatus>("checking");
    const [lastSeen, setLastSeen] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const check = async () => {
            try {
                const res = await fetch(HEALTH_URL, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(`Health check failed: ${res.status}`);
                }

                const data = (await res.json()) as HealthResponse;

                if (!cancelled && data.ok) {
                    setStatus("connected");
                    setLastSeen(Date.now());
                }
            } catch {
                if (!cancelled) {
                    setStatus("disconnected");
                }
            }
        };

        check();
        intervalId = setInterval(check, intervalMs);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalMs]);

    return { status, lastSeen };
}