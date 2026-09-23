"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  KanbanSquare,
  LayoutDashboard,
  Layers,
  ListOrdered,
  LogOut,
  FolderOpen,
  Mail,
  Package,
  Settings,
  Target,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAppState, logout, personById } from "@/lib/store";
import { ROLE_LABEL, isCoordinator, isTechAdmin } from "@/lib/labels";
import { Avatar, Badge, Button } from "@/components/ui";
import { frontById } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  {
    group: "Projeto",
    items: [
      { href: "/", label: "Visão geral", icon: LayoutDashboard },
      { href: "/backlog", label: "Product Backlog", icon: ListOrdered },
      { href: "/sprint", label: "Sprint", icon: Target },
      { href: "/fluxo", label: "Fluxo Kanban", icon: KanbanSquare },
    ],
  },
  {
    group: "Frentes e entregas",
    items: [
      { href: "/frentes", label: "Frentes", icon: Layers },
      { href: "/entregas", label: "Entregas", icon: Package },
      { href: "/arquivos", label: "Arquivos", icon: FolderOpen },
      { href: "/pessoas", label: "Pessoas", icon: Users },
    ],
  },
  {
    group: "Comunicação e agenda",
    items: [
      { href: "/notificacoes", label: "Notificações", icon: Mail },
      { href: "/agenda", label: "Agenda", icon: Calendar },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/": "Visão geral",
  "/backlog": "Product Backlog",
  "/sprint": "Sprint atual",
  "/fluxo": "Fluxo Kanban",
  "/frentes": "Frentes de trabalho",
  "/entregas": "Entregas e histórico",
  "/arquivos": "Arquivos",
  "/notificacoes": "Notificações",
  "/agenda": "Agenda",
  "/pessoas": "Pessoas e responsabilidades",
  "/configuracoes": "Configurações",
  "/configuracoes/integracoes": "Integrações",
  "/itens/[itemId]": "Detalhe do item",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  const user = personById(state, state.currentUserId);
  const membership = state.memberships.find((m) => m.personId === state.currentUserId);
  const role = membership?.role ?? null;
  const roleLabel = role ? ROLE_LABEL[role] : null;

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!state.currentUserId) {
      router.replace("/login");
    }
  }, [state.currentUserId, router]);

  const title = useMemo(() => {
    if (pathname.startsWith("/itens/")) return "Detalhe do item";
    if (pathname.startsWith("/configuracoes/integracoes")) return "Integrações";
    if (pathname.startsWith("/configuracoes")) return "Configurações";
    return TITLES[pathname] ?? "PETBSI Scrum";
  }, [pathname]);

  if (!state.currentUserId || !user) {
    return (
      <div className="page-loading" role="status">
        <span className="spinner" aria-hidden />
        Autenticando...
      </div>
    );
  }

  const admin = isTechAdmin(role ?? "MEMBER");
  const coordinator = isCoordinator(role ?? "MEMBER");

  return (
    <div className={`shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="sidebar-logo">
          <div className="flex items-center gap-2">
            <span className="mark" aria-hidden>
              P
            </span>
            <span className="sidebar-logo-text">PETBSI Scrum</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-toggle-btn"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </Button>
        </div>

        <nav className="sidebar-nav" aria-label="Seções">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="sidebar-group">
                <span className="sidebar-group-text">{section.group}</span>
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} title={isCollapsed ? item.label : undefined}>
                    <Icon aria-hidden />
                    <span className="nav-link-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
          {(admin || coordinator) && (
            <div>
              <div className="sidebar-group">
                <span className="sidebar-group-text">Administração</span>
              </div>
              <Link
                href="/configuracoes/integracoes"
                className={`nav-link ${pathname.startsWith("/configuracoes/integracoes") ? "active" : ""}`}
                title={isCollapsed ? "Integrações" : undefined}
              >
                <Settings aria-hidden />
                <span className="nav-link-text">Integrações</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-inner">
            <Avatar person={user} />
            <div className="sidebar-footer-text">
              <div className="sidebar-footer-name">
                {user.name}
              </div>
              <div className="sidebar-footer-role">{frontById(state, membership?.primaryFrontId ?? null)?.name ?? ""}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              aria-label="Sair"
              className="sidebar-logout-btn"
              title={isCollapsed ? "Sair" : undefined}
            >
              <LogOut size={15} />
            </Button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-spacer" />
          <ThemeToggle />
          {roleLabel && (
            <Badge tone={admin ? "warn" : coordinator ? "info" : "muted"}>{roleLabel}</Badge>
          )}
          <Avatar person={user} />
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}