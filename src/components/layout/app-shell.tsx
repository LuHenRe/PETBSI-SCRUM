"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
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
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { ProjectMembership } from "@/domain/project/project-membership";
import { ROLE_LABEL } from "@/lib/labels";
import { Avatar, Badge, Button } from "@/components/ui";

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

const WRITE_LINKS = new Set(["/backlog", "/sprint", "/fluxo"]);

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
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);

  const pathname = usePathname();
  const router = useRouter();
  const version = apiClient.getVersion();

  const currentUserId = apiClient.getCurrentUserId();
  const people = useMemo(() => apiClient.listPeople(), [version]);
  const fronts = useMemo(() => apiClient.listFronts(), [version]);
  const [domainMemberships, setDomainMemberships] = useState<ProjectMembership[]>([]);

  // Resolve membership via adapter memory, sem store legado.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .getDeps()
      .memberships.listAll()
      .then((all) => {
        if (!cancelled) setDomainMemberships(all);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [version, currentUserId]);

  const user = people.find((p) => p.id === currentUserId) ?? null;
  const mine = domainMemberships.filter((m) => m.personId === currentUserId);
  const membership = mine[0] ?? null;
  const role = membership?.role ?? null;
  const isVisitante = mine.length > 0 && mine.every((m) => !m.canEdit);
  const roleLabel = membership
    ? !membership.canEdit
      ? "Visitante"
      : role
        ? ROLE_LABEL[role as keyof typeof ROLE_LABEL]
        : null
    : null;

  useEffect(() => {
    if (!currentUserId) {
      router.replace("/login");
    }
  }, [currentUserId, router]);

  const title = useMemo(() => {
    if (pathname.startsWith("/itens/")) return "Detalhe do item";
    if (pathname.startsWith("/configuracoes/integracoes")) return "Integrações";
    if (pathname.startsWith("/configuracoes")) return "Configurações";
    return TITLES[pathname] ?? "PETBSI Scrum";
  }, [pathname]);

  if (!currentUserId || !user) {
    return (
      <div className="page-loading" role="status">
        <span className="spinner" aria-hidden />
        Autenticando...
      </div>
    );
  }

  const admin = mine.some((m) => m.isTechAdmin());
  const coordinator = mine.some((m) => m.isCoordinator());

  const filteredNav = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (isVisitante && WRITE_LINKS.has(item.href)) return false;
      return true;
    }),
  })).filter((s) => s.items.length > 0);

  const frontName = fronts.find((f) => f.id === (membership?.frontId ?? null))?.name ?? "";

  const handleLogout = () => {
    apiClient.setCurrentUserId(null);
    router.replace("/login");
  };

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="sidebar-logo">
          <span className="mark" aria-hidden>
            P
          </span>
          PETBSI Scrum
        </div>

        <nav className="sidebar-nav" aria-label="Seções">
          {filteredNav.map((section) => (
            <div key={section.group}>
              <div className="sidebar-group">{section.group}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
                    <Icon aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
          {(admin || coordinator) && (
            <div>
              <div className="sidebar-group">Administração</div>
              <Link
                href="/configuracoes/integracoes"
                className={`nav-link ${pathname.startsWith("/configuracoes/integracoes") ? "active" : ""}`}
              >
                <Settings aria-hidden />
                Integrações
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="flex items-center gap-2" style={{ padding: "6px 10px" }}>
            <Avatar person={user} />
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </div>
              <div className="text-xs text-muted">{frontName}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Sair"
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
          {roleLabel && (
            <Badge tone={isVisitante ? "muted" : admin ? "warn" : coordinator ? "info" : "muted"}>{roleLabel}</Badge>
          )}
          <Avatar person={user} />
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
