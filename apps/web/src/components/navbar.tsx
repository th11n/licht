"use client";
import {
	BookOpenIcon,
	ClockCounterClockwiseIcon,
	GlobeHemisphereWestIcon,
	LightningIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
	const links = [
		{ href: "/", label: "Engine", icon: LightningIcon },
		{ href: "/docs", label: "Docs", icon: BookOpenIcon },
		{ href: "/changelog", label: "History", icon: ClockCounterClockwiseIcon },
	];

	return (
		<header className="fixed top-0 z-50 w-full border-white/5 border-b bg-background/60 backdrop-blur-xl">
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-10">
				<div className="flex items-center gap-10">
					<Link
						href="/"
						className="group flex items-center gap-2 transition-opacity hover:opacity-80"
					>
						<Image
							src="/logo-full.png"
							alt="Licht"
							width={200}
							height={200}
							className="invert"
						/>
					</Link>

					<nav className="hidden items-center gap-2 md:flex">
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href as any}
								className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-[13px] text-muted-foreground transition-all hover:bg-white/3 hover:text-foreground"
							>
								<link.icon weight="regular" className="h-4 w-4" />
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				<div className="flex items-center gap-3">
					<div className="mr-2 hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 lg:flex">
						<GlobeHemisphereWestIcon
							weight="duotone"
							className="h-3.5 w-3.5 animate-[spin_10s_linear_infinite] text-emerald-500"
						/>
						<span className="font-bold font-mono text-[10px] text-emerald-500/80 uppercase tracking-widest">
							Node_Alpha: Online
						</span>
					</div>

					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
