"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  KanbanSquare,
  LayoutDashboard,
  Layers,
  ListOrdered,
  LogOut,
  Package,
  Settings,
  Target,
  Users,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
} from "lucide-react";
import { useAppState, setServerState, personById, setActiveProject } from "@/lib/store";
import { signOut } from "next-auth/react";
import type { AppState } from "@/lib/types";
import { ROLE_LABEL, isCoordinator, isTechAdmin } from "@/lib/labels";
import { Avatar, Badge, Button, Select } from "@/components/ui";
import { frontById } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const NAV = [
  {
    group: "Projeto",
    items: [
      { href: "/", label: "Visão geral", icon: LayoutDashboard },
      { href: "/backlog", label: "Product Backlog", icon: ListOrdered },
      { href: "/planejamento", label: "Sprint Planning", icon: KanbanSquare },
      { href: "/sprint", label: "Sprint", icon: Target },
      { href: "/fluxo", label: "Fluxo Kanban", icon: KanbanSquare },
    ],
  },
  {
    group: "Gestão",
    items: [
      { href: "/projetos", label: "Projetos", icon: Layers },
      { href: "/entregas", label: "Entregas", icon: Package },
      { href: "/pessoas", label: "Pessoas", icon: Users },
    ],
  },
  {
    group: "Comunicação e agenda",
    items: [
      { href: "/agenda", label: "Agenda", icon: Calendar },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/": "Visão geral",
  "/backlog": "Product Backlog",
  "/sprint": "Sprint atual",
  "/planejamento": "Sprint Planning",
  "/fluxo": "Fluxo Kanban",
  "/projetos": "Gestão de Projetos e Frentes",
  "/entregas": "Entregas e histórico",
  "/arquivos": "Arquivos",
  "/notificacoes": "Notificações",
  "/agenda": "Agenda",
  "/pessoas": "Pessoas e responsabilidades",
  "/configuracoes": "Configurações",
  "/configuracoes/integracoes": "Integrações",
  "/itens/[itemId]": "Detalhe do item",
};

const TUTORIALS: Record<string, { element?: string; popover: { title: string; description: string } }[]> = {
  "/": [
    { element: '.topbar', popover: { title: 'Visão Geral', description: 'Aqui você tem uma visão ampla de tudo o que está acontecendo.' } },
    { element: '.widget-grid', popover: { title: 'Métricas', description: 'Observe os indicadores e o progresso das frentes.' } },
    { element: '.sidebar-nav', popover: { title: 'Navegação', description: 'Acesse atalhos rápidos para as atividades mais importantes.' } }
  ],
  "/backlog": [
    { element: '.page h1', popover: { title: 'Product Backlog', description: 'O Product Backlog é a lista de tudo o que precisa ser feito.' } },
    { popover: { title: 'Novo Item', description: "Clique em 'Novo item' para adicionar uma tarefa, documento ou pesquisa." } },
    { element: '.table-wrap', popover: { title: 'Organização', description: 'Reordene os itens arrastando para definir a prioridade.' } }
  ],
  "/planejamento": [
    { element: '.page h1', popover: { title: 'Sprint Planning', description: 'Aqui você planeja a próxima iteração (Sprint).' } },
    { element: '.card:first-child', popover: { title: 'Backlog', description: 'Avalie a capacidade da equipe e mova os itens do backlog para a Sprint.' } },
    { popover: { title: 'Sprint Atual', description: 'Certifique-se de definir uma meta clara para a Sprint.' } }
  ],
  "/sprint": [
    { element: '.page h1', popover: { title: 'Sprint', description: 'Acompanhe o andamento dos itens que estão ativamente sendo trabalhados.' } },
    { popover: { title: 'Meta', description: 'Acompanhe a meta atual e verifique se há gargalos.' } },
    { popover: { title: 'Finalizar', description: 'Finalize a Sprint quando o tempo se esgotar ou tudo for concluído.' } }
  ],
  "/fluxo": [
    { element: '.page h1', popover: { title: 'Fluxo Kanban', description: 'Este é o quadro Kanban visual.' } },
    { popover: { title: 'Colunas', description: 'Arraste os cartões pelas colunas para atualizar o status (Ex: Em andamento, Revisão, Concluído).' } },
    { popover: { title: 'Limites WIP', description: 'Fique de olho nos limites de trabalho em progresso (WIP) de cada coluna.' } }
  ],
  "/projetos": [
    { element: '.page h1', popover: { title: 'Projetos', description: 'Gerencie os múltiplos projetos e suas frentes de trabalho.' } },
    { popover: { title: 'Acesso', description: 'Apenas Administradores Globais podem criar novos projetos.' } },
    { element: '.card', popover: { title: 'Frentes', description: 'Crie frentes específicas e atribua uma cor para facilitar a identificação.' } }
  ],
  "/entregas": [
    { element: '.page h1', popover: { title: 'Entregas', description: 'Registre os produtos, documentos e códigos que foram concluídos e entregues.' } },
    { element: '.card:first-child', popover: { title: 'Nova Entrega', description: 'Vincule os itens do backlog que compõem a entrega.' } },
    { popover: { title: 'Histórico', description: 'Acompanhe o histórico para ter rastreabilidade do valor gerado.' } }
  ],
  "/pessoas": [
    { element: '.page h1', popover: { title: 'Pessoas', description: 'Visualize quem faz parte do projeto.' } },
    { element: '.table-wrap', popover: { title: 'Funções', description: 'Veja as funções de cada um (Scrum Master, Product Owner, Membro).' } },
    { popover: { title: 'Edição', description: 'Verifique e ajuste as frentes de atuação de cada participante.' } }
  ],
  "/agenda": [
    { element: '.page h1', popover: { title: 'Agenda', description: 'Veja o calendário de reuniões semanais.' } },
    { popover: { title: 'Reuniões', description: 'Acompanhe as próximas agendas do time.' } },
    { popover: { title: 'Prazos', description: 'Acompanhe os prazos definidos para as tarefas do Backlog e crie novos eventos.' } }
  ],
  "/itens/[itemId]": [
    { element: '.page h1', popover: { title: 'Detalhe do item', description: 'Nesta tela você vê todas as informações detalhadas de uma atividade.' } },
    { element: '.card', popover: { title: 'Edição', description: 'Associe responsáveis, altere a descrição, mude a prioridade ou data de entrega.' } },
    { popover: { title: 'Bloqueios', description: 'Adicione bloqueios se a tarefa estiver dependendo de fatores externos.' } }
  ],
};

export function AppShell({ children, initialState }: { children: React.ReactNode; initialState: AppState }) {
  useEffect(() => { setServerState(initialState); }, [initialState]);
  const state = useAppState();
  const pathname = usePathname();

  const user = personById(state, state.currentUserId);
  const membership = state.memberships.find((m) => m.personId === state.currentUserId);
  const role = membership?.role ?? null;
  const roleLabel = role ? ROLE_LABEL[role] : null;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const title = useMemo(() => {
    if (pathname.startsWith("/itens/")) return "Detalhe do item";
    if (pathname.startsWith("/configuracoes/integracoes")) return "Integrações";
    if (pathname.startsWith("/configuracoes")) return "Configurações";
    return TITLES[pathname] ?? "PETBSI Scrum";
  }, [pathname]);

  const tutorial = useMemo(() => {
    if (pathname.startsWith("/itens/")) return TUTORIALS["/itens/[itemId]"];
    return TUTORIALS[pathname];
  }, [pathname]);

  const handleStartTour = () => {
    if (!tutorial) return;
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendi',
      steps: tutorial
    });
    driverObj.drive();
  };

  if (state.currentUserId !== initialState.currentUserId || !user) {
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

        {!isCollapsed && state.projects.length > 0 && (
          <div style={{ padding: "0 16px 20px 16px", borderBottom: "1px solid var(--border)", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
              Projeto Ativo
            </span>
            <Select 
              value={state.activeProjectId || ""} 
              onChange={(e) => setActiveProject(e.target.value)} 
              aria-label="Selecionar Projeto Ativo"
            >
              {state.projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        )}

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
              onClick={() => { void signOut({ redirectTo: "/login" }); }}
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
          
          {pathname !== "/configuracoes" && tutorial && (
            <Button variant="ghost" size="sm" onClick={handleStartTour} title="Tutorial da página" aria-label="Abrir tutorial">
              <HelpCircle size={18} />
            </Button>
          )}

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
