import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Bot, LayoutGrid, Settings, Users } from "lucide-react";
import logo from "@/assets/logo.png";

const NAV = [
  { label: "Board", icon: LayoutGrid, to: "/" },
  { label: "Assistant", icon: Bot, to: "/assistant" },
  { label: "Activity", icon: Activity, to: "/activity" },
  { label: "Team", icon: Users, to: "/team" },
  { label: "Settings", icon: Settings, to: "/settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <nav className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <img src={logo} alt="Flow Board" width={32} height={32} className="h-8 w-8" />
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Flow Board</p>
            <p className="text-[11px] text-muted-foreground">Shared workspace</p>
          </div>
        </div>

        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                activeProps={{
                  className:
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground",
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-xl border border-sidebar-border bg-background/40 p-3">
          <p className="text-xs font-medium">Tip</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Drag a card between columns, or just tell the assistant what changed.
          </p>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 bg-sidebar px-2 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground"
              activeProps={{
                className:
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs bg-sidebar-accent text-sidebar-accent-foreground",
              }}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
