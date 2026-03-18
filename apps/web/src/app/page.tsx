'use client'

import { useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

import { Button } from "@licht/ui/components/button";
import { Card } from "@licht/ui/components/card";
import {
  ArrowRightIcon,
  TerminalIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

export default function HomePage() {
  const scope = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      if (!scope.current || !planeRef.current || !pathRef.current) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

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
        opacity: 0,
      });

      gsap.set(planeRef.current, {
        opacity: 0,
        scale: 0.9,
        transformOrigin: "50% 50%",
      });

      tl.to(".hero-grid-bg", {
        opacity: 1,
        duration: 0.8,
      })
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
          ".hero-path",
          {
            opacity: 1,
            duration: 0.5,
          },
          0.5
        )
        .to(
          planeRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
          },
          0.7
        )
        .to(
          planeRef.current,
          {
            duration: 4.8,
            ease: "power2.out",
            motionPath: {
              path: pathRef.current,
              align: pathRef.current,
              autoRotate: true,
              alignOrigin: [0.5, 0.5],
              start: 0,
              end: 1,
            },
          },
          0.82
        );
    },
    { scope }
  );

  return (
    <main
      ref={scope}
      className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      <div className="hero-grid-bg fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <svg
        className="hero-path pointer-events-none absolute left-0 top-12 h-[260px] w-1/2 overflow-visible"
        viewBox="-420 0 1400 260"
        fill="none"
      >
        <path
          ref={pathRef}
          className="stroke-border/60"
          strokeWidth="0"
          strokeDasharray="5 7"
          d="
            M-420,150
            C-330,150 -250,138 -180,120
            C-100,98 -40,70 30,42
            C150,-6 300,-6 450,18
            C600,42 720,82 840,126
            C900,144 960,150 1040,150
          "
        />
      </svg>

      <div
        ref={planeRef}
        className="pointer-events-none absolute left-0 top-0 z-20 text-5xl leading-none text-muted-foreground will-change-transform"
      >
        ᯓ➤
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
              local machine. Inspect, debug, and execute requests directly from
              your desktop runtime.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20"
              >
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

                <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter text-muted-foreground/50">
                  <TerminalIcon className="h-3 w-3" />
                  licht-system-bridge — 80x24
                </div>
              </div>

              <div className="flex min-h-[320px] flex-col p-6 font-mono text-[13px] leading-relaxed">
                <div className="space-y-1">
                  <p className="text-emerald-500">
                    C:\Users\Licht\Bridge{">"}licht init --verbose
                  </p>
                  <p className="text-muted-foreground">
                    [SYSTEM] Kernel version 1.0.4-stable-x64
                  </p>
                  <p className="text-muted-foreground">
                    [SYSTEM] Initializing secure handshake protocol...
                  </p>
                  <p className="text-muted-foreground">
                    [NETWORK] Binding to localhost:4000
                  </p>
                </div>

                <div className="mt-6 flex-1">
                  <div className="flex items-start gap-2">
                    <WarningCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                    <div className="space-y-1">
                      <p className="font-bold tracking-tight text-amber-400">
                        STATUS: WAITING_FOR_CONNECTION...
                      </p>
                      <p className="text-[11px] italic leading-snug uppercase tracking-wider text-amber-400/70">
                        No active bridge detected. Start the desktop client to
                        establish a secure tunnel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="tracking-tighter text-emerald-500">
                      C:\Users\Licht{">"}
                    </span>
                    <div className="flex items-center">
                      <span className="h-4 w-2 animate-[pulse_2s_infinite] bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <footer className="hero-footer absolute bottom-4 text-muted-foreground">
          <span>
            Made with ❤️ by{" "}
            <a
              href="https://github.com/th11n"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground"
            >
              Dominik Krakowiak
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}