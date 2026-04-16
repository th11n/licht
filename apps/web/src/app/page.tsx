'use client';

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

import { Button } from "@licht/ui/components/button";
import { Card } from "@licht/ui/components/card";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  TerminalIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { useRuntimeHealth } from "@/utils/use-runtime-health";
import { ProjectPicker } from "@/components/project-chooser";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const TERMINAL_LINES = [
  'C:\\Users\\Licht\\Bridge>licht init --verbose',
  '[SYSTEM] Kernel version 1.0.4-stable-x64',
  '[SYSTEM] Initializing secure handshake protocol...',
];

const PROMPT = 'C:\\Users\\Licht>';

type Phase = "landing" | "waiting" | "connecting" | "ready";

export default function HomePage() {
  const { status } = useRuntimeHealth(1500);
  const [phase, setPhase] = useState<Phase>("landing");

  const scope = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const finishTweenRef = useRef<gsap.core.Tween | null>(null);

  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);

  const statusWrapRef = useRef<HTMLDivElement>(null);
  const caretWrapRef = useRef<HTMLDivElement>(null);

  const finishFlight = () => {
    if (!planeRef.current || !pathRef.current) return;
    if (finishTweenRef.current) return;
    if (phase === "connecting" || phase === "ready") return;

    setPhase("connecting");

    finishTweenRef.current = gsap.to(planeRef.current, {
      duration: 3.4,
      ease: "power1.inOut",
      motionPath: {
        path: pathRef.current,
        align: pathRef.current,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0.53,
        end: 1,
      },
      onComplete: () => {
        setPhase("ready");
      },
    });
  };

  useEffect(() => {
    if (status === "connected" && phase === "waiting") {
      finishFlight();
    }
  }, [status, phase]);

  useGSAP(
    () => {
      if (!scope.current || !planeRef.current || !pathRef.current) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          setPhase((prev) => (prev === "landing" ? "waiting" : prev));
        },
      });

      const typeText = (el: HTMLElement, text: string, speed = 0.028) => {
        const obj = { i: 0 };
        el.textContent = "";

        return gsap.to(obj, {
          i: text.length,
          duration: Math.max(text.length * speed, 0.2),
          ease: "none",
          onUpdate: () => {
            el.textContent = text.slice(0, Math.floor(obj.i));
          },
        });
      };

      gsap.set(".hero-copy > *", {
        opacity: 0,
        y: 28,
        filter: "blur(10px)",
      });

      gsap.set(".hero-card", {
        opacity: 0,
        x: 40,
        y: 20,
        scale: 0.96,
        filter: "blur(12px)",
      });

      gsap.set(".hero-footer", {
        opacity: 0,
        y: 14,
      });

      gsap.set(".hero-grid-bg", {
        opacity: 0,
      });

      gsap.set(".hero-path", {
        opacity: 0.28,
      });

      gsap.set(planeRef.current, {
        opacity: 0,
        scale: 0.9,
        transformOrigin: "50% 50%",
      });

      [line1Ref.current, line2Ref.current, line3Ref.current].forEach((el) => {
        if (el) el.textContent = "";
      });

      gsap.set([statusWrapRef.current, caretWrapRef.current], { opacity: 0 });

      tl.to(".hero-grid-bg", { opacity: 1, duration: 0.8 })
        .to(
          ".hero-copy > *",
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
          },
          0.15
        )
        .to(
          ".hero-card",
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
          },
          0.28
        )
        .to(
          ".hero-footer",
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          0.8
        )
        .to(
          planeRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
          },
          0.45
        )
        .to(
          planeRef.current,
          {
            duration: 3.4,
            ease: "power1.inOut",
            motionPath: {
              path: pathRef.current,
              align: pathRef.current,
              autoRotate: true,
              alignOrigin: [0.5, 0.5],
              start: 0,
              end: 0.53,
            },
          },
          0.55
        )
        .add(typeText(line1Ref.current!, TERMINAL_LINES[0], 0.032), 1.0)
        .add(typeText(line2Ref.current!, TERMINAL_LINES[1], 0.022), ">+=0.10")
        .add(typeText(line3Ref.current!, TERMINAL_LINES[2], 0.02), ">+=0.08")
        .to(statusWrapRef.current, { opacity: 1, duration: 0.2 }, ">+=0.12")
        .to(caretWrapRef.current, { opacity: 1, duration: 0.15 }, "<+=0.05");

      return () => {
        tl.kill();
        finishTweenRef.current?.kill();
      };
    },
    { scope }
  );

  const isConnected = status === "connected";
  const isReady = phase === "ready";

  const line4 =
    phase === "connecting"
      ? "[NETWORK] Handshake complete. Routing session..."
      : isConnected
        ? "[NETWORK] Runtime detected on localhost:4317"
        : "[NETWORK] Polling localhost:4317/health";

  if (isReady) {
    return <ProjectPicker />;
  }

  return (
    <main
      ref={scope}
      className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary"
    >
      <div className="hero-grid-bg fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="hero-path absolute inset-0 z-0 h-full w-full overflow-hidden"
          viewBox="0 0 1600 500"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            ref={pathRef}
            className="stroke-border/50"
            strokeWidth="1"
            strokeDasharray="4 6"
            d="
              M -80 150
              C 120 150, 290 60, 500 84
              C 700 106, 900 178, 1080 122
              C 1220 78, 1360 128, 1510 140
            "
          />
        </svg>

        <div
          ref={planeRef}
          className="absolute left-0 top-0 z-20 text-5xl leading-none text-muted-foreground/60 will-change-transform"
        >
          ᯓ➤
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[75%] flex-col items-center justify-center px-6 py-20 lg:px-10">
        <section className="grid w-full gap-32 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="hero-copy flex flex-col space-y-8">
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl lg:leading-[1.1]">
              Bridge the gap between{" "}
              <span className="text-muted-foreground">web & local.</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Licht is a high-performance bridge connecting your browser to your
              local machine.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-8 font-semibold shadow-lg">
                Get Desktop App <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>

              <Button variant="outline" size="lg" className="rounded-full px-8">
                Documentation
              </Button>
            </div>
          </div>

          <div className="hero-card relative mx-auto w-full max-w-md lg:max-w-none">
            <Card className="overflow-hidden border-border/40 bg-[#0c0c0c] py-0 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/5 bg-[#1a1a1a] px-4 py-2">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>

                <div className="text-[10px] uppercase font-mono tracking-tighter text-muted-foreground/50 flex items-center gap-2">
                  <TerminalIcon size={12} />
                  licht-bridge
                </div>
              </div>

              <div className="flex min-h-[320px] flex-col p-6 font-mono text-[13px] leading-relaxed">
                <div className="space-y-1">
                  <p ref={line1Ref} className="text-emerald-500" />
                  <p ref={line2Ref} className="text-muted-foreground" />
                  <p ref={line3Ref} className="text-muted-foreground" />
                  <p className={isConnected ? "text-emerald-400" : "text-muted-foreground opacity-50"}>
                    {line4}
                  </p>
                </div>

                <div className="mt-6 flex-1">
                  <div ref={statusWrapRef} className="flex items-start gap-2">
                    {isConnected ? (
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    ) : (
                      <WarningCircleIcon className="mt-0.5 h-4 w-4 text-amber-500" />
                    )}

                    <div className="space-y-1">
                      <p
                        className={`font-bold uppercase tracking-tight ${isConnected ? "text-emerald-400" : "text-amber-400"
                          }`}
                      >
                        {isConnected ? "STATUS: DETECTED" : "STATUS: WAITING..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  ref={caretWrapRef}
                  className="mt-auto border-t border-white/5 pt-4 flex items-center gap-2"
                >
                  <span className="text-emerald-500/50">{PROMPT}</span>
                  <span className="h-4 w-2 animate-pulse bg-primary" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        <footer className="absolute bottom-4 text-[10px] uppercase tracking-widest text-muted-foreground/40 font-mono hero-footer">
          Made with ❤️ by <a className="text-muted-foreground" href="https://github.com/th11n">Dominik Krakowiak</a>
        </footer>
      </div>
    </main>
  );
}