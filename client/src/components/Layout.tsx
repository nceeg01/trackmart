import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Activity,
  Layers,
  Map as MapIcon,
  ShoppingCart,
  Bell,
  Server,
  Shield,
  Moon,
  Sun,
  Circle,
} from "lucide-react";
import { Logo } from "./Logo";
import { useQuery } from "@tanstack/react-query";
import type { PipelineStatus, Alert } from "@shared/schema";

const NAV: { href: string; label: string; icon: any; testId: string }[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, testId: "link-nav-overview" },
  { href: "/traffic", label: "Traffic", icon: Activity, testId: "link-nav-traffic" },
  { href: "/sections", label: "Sections", icon: Layers, testId: "link-nav-sections" },
  { href: "/heatmap", label: "Heatmap", icon: MapIcon, testId: "link-nav-heatmap" },
  { href: "/checkout", label: "Checkout", icon: ShoppingCart, testId: "link-nav-checkout" },
  { href: "/alerts", label: "Alerts", icon: Bell, testId: "link-nav-alerts" },
  { href: "/pipeline", label: "Pipeline", icon: Server, testId: "link-nav-pipeline" },
  { href: "/admin", label: "Admin & Security", icon: Shield, testId: "link-nav-admin" },
];

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((v) => !v) };
}

function StatusDot({ status }: { status: string }) {
  const color = status === "online" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-rose-500";
  return <span className={`inline-block size-2 rounded-full ${color}`} aria-hidden />;
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { dark, toggle } = useTheme();

  const { data: pipeline } = useQuery<PipelineStatus>({ queryKey: ["/api/pipeline"] });
  const { data: alerts } = useQuery<Alert[]>({ queryKey: ["/api/alerts"] });
  const activeAlerts = alerts?.filter((a) => a.active).length ?? 0;

  return (
    <div className="h-dvh min-w-[1100px] grid grid-cols-[260px_1fr] grid-rows-[auto_1fr] overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="row-span-2 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <span className="text-sidebar-primary"><Logo size={28} /></span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-sidebar-accent-foreground tracking-tight">ByteTrack</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/70">Retail Ops</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" style={{ overscrollBehavior: "contain" as any }}>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">Workspace</div>
          {NAV.map((item) => {
            const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
            const Icon = item.icon;
            const isAlerts = item.href === "/alerts";
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] transition-colors hover-elevate ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/85"
                }`}
              >
                <Icon size={16} className={active ? "text-sidebar-primary" : ""} />
                <span className="flex-1">{item.label}</span>
                {isAlerts && activeAlerts > 0 && (
                  <span
                    data-testid="badge-alert-count"
                    className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  >
                    {activeAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border space-y-2 text-[11.5px]">
          <div className="flex items-center justify-between text-sidebar-foreground/70">
            <span className="uppercase tracking-[0.14em]">Store</span>
            <span className="text-sidebar-accent-foreground font-medium tabular">Pilot 01</span>
          </div>
          <div className="flex items-center justify-between text-sidebar-foreground/70">
            <span className="uppercase tracking-[0.14em]">Cameras</span>
            <span className="tabular text-sidebar-accent-foreground" data-testid="text-sidebar-cameras">
              {pipeline ? `${pipeline.onlineCameras}/${pipeline.totalCameras} online` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sidebar-foreground/70">
            <span className="uppercase tracking-[0.14em]">Pipeline</span>
            <span className="flex items-center gap-1.5">
              <StatusDot status={pipeline && pipeline.onlineCameras === pipeline.totalCameras ? "online" : "degraded"} />
              <span className="text-sidebar-accent-foreground">
                {pipeline && pipeline.onlineCameras === pipeline.totalCameras ? "Healthy" : "Degraded"}
              </span>
            </span>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-[15px] font-semibold tracking-tight" data-testid="text-page-title">
            {NAV.find((n) => (n.href === "/" ? location === "/" : location.startsWith(n.href)))?.label ?? "ByteTrack"}
          </h1>
          <span className="text-[11.5px] text-muted-foreground tabular">
            Day 1 · Mon 19 Jan 2026 · Pilot Store 01
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11.5px] text-muted-foreground tabular">
            <Circle size={6} className="fill-emerald-500 text-emerald-500" aria-hidden />
            Updated 12s ago
          </div>
          <button
            onClick={toggle}
            data-testid="button-theme-toggle"
            className="size-9 rounded-md border border-border bg-card hover-elevate flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main
        className="overflow-y-auto"
        style={{ overscrollBehavior: "contain" as any }}
        data-testid="main-content"
      >
        <div className="px-6 py-6 max-w-[1500px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
