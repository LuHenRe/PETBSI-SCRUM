"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Plus } from "lucide-react";
import { dispatch, useGlobalAppState } from "@/lib/store";
import { Avatar, Card, EmptyState, Modal, TextInput, TextArea, Field, Badge, Button } from "@/components/ui";

export default function ProjetosPage() {
  const state = useGlobalAppState();

  const user = state.people.find(p => p.id === state.currentUserId);
  const membership = state.memberships.find((m) => m.personId === state.currentUserId);
  const isAdmin = user?.systemRole === "ADMIN";
  const isPO = membership?.role === "PRODUCT_OWNER";
  const canCreate = isAdmin || isPO;

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ id: "", name: "", description: "" });

  const [frontModalOpen, setFrontModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [frontForm, setFrontForm] = useState({ name: "", description: "", color: "#3B82F6" });

  const handleCreateProject = () => {
    if (!projectForm.id || !projectForm.name) return;
    dispatch({ action: "createProject", ...projectForm });
    setProjectModalOpen(false);
    setProjectForm({ id: "", name: "", description: "" });
  };

  const handleCreateFront = () => {
    if (!frontForm.name || !selectedProjectId) return;
    dispatch({ action: "createFront", projectId: selectedProjectId, ...frontForm });
    setFrontModalOpen(false);
    setFrontForm({ name: "", description: "", color: "#3B82F6" });
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1>Projetos e Frentes</h1>
          <p className="text-muted mt-1">Gerencie os projetos acadêmicos e suas respectivas frentes de trabalho.</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setProjectModalOpen(true)}>
            <Plus size={16} /> Novo Projeto
          </Button>
        )}
      </div>

      {state.projects?.map((project) => {
        const projectFronts = state.fronts.filter(f => f.projectId === project.id);

        return (
          <div key={project.id} className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{project.name}</h2>
                {project.description && <p className="text-muted text-sm">{project.description}</p>}
              </div>
              {canCreate && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedProjectId(project.id); setFrontModalOpen(true); }}>
                  <Plus size={16} /> Nova Frente
                </Button>
              )}
            </div>

            {projectFronts.length === 0 ? (
              <Card className="p-8 text-center text-muted">
                <Layers className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma frente de trabalho configurada neste projeto.</p>
              </Card>
            ) : (
              <div className="overview-grid">
                {projectFronts.map((front) => {
                  const items = state.backlogItems.filter((i) => i.frontId === front.id);
                  const open = items.filter((i) => i.status !== "done").length;
                  const done = items.filter((i) => i.status === "done").length;
                  const members = state.memberships
                    .filter((m) => m.primaryFrontId === front.id || m.frontPermissions.some((fp) => fp.frontId === front.id && (fp.canView || fp.canEdit)))
                    .map((m) => state.people.find((p) => p.id === m.personId) ?? null)
                    .filter((p): p is NonNullable<typeof p> => !!p);
                  const deliveries = state.deliveries.filter((d) => d.frontId === front.id);
                  const blockers = items.filter((i) => i.status === "blocked").length;

                  return (
                    <Link key={front.id} href={`/projetos/${front.id}`} className="card" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <span className="badge" style={{ background: `${front.color}14`, color: front.color }}>
                            <span className="dot" style={{ background: front.color }} aria-hidden />
                            {front.name}
                          </span>
                          <ArrowRight size={16} className="text-muted" aria-hidden />
                        </div>
                        <p className="text-sm text-soft mt-2">{front.description}</p>
                        <div className="row-meta mt-3">
                          <Badge tone="info">{open} em aberto</Badge>
                          <Badge tone="ok">{done} concluídos</Badge>
                          {blockers > 0 && <Badge tone="danger">{blockers} bloqueado(s)</Badge>}
                          <Badge tone="muted">{deliveries.length} entrega(s)</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3" style={{ marginTop: "auto", paddingTop: 16 }}>
                          <span className="avatar-stack">
                            {members.map((m) => (
                              <Avatar key={m.id} person={m} />
                            ))}
                          </span>
                          <span className="text-xs text-muted">{items.length} itens</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {(!state.projects || state.projects.length === 0) && (
        <Card><EmptyState icon={<Layers />} title="Nenhum projeto configurado" /></Card>
      )}

      {/* MODAL: NOVO PROJETO */}
      <Modal open={projectModalOpen} title="Novo Projeto" onClose={() => setProjectModalOpen(false)} footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setProjectModalOpen(false)}>Cancelar</Button>
          <Button variant="primary" disabled={!projectForm.id || !projectForm.name} onClick={handleCreateProject}>Salvar Projeto</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <Field label="ID do Projeto (Slug)" hint={!projectForm.id ? <span className="text-danger text-sm">Obrigatório (ex: petbsi)</span> : undefined}>
            <TextInput placeholder="meu-projeto" value={projectForm.id} onChange={(e) => setProjectForm({ ...projectForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
          </Field>
          <Field label="Nome do Projeto" hint={!projectForm.name ? <span className="text-danger text-sm">Obrigatório</span> : undefined}>
            <TextInput placeholder="Ex: PETBSI Scrum" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
          </Field>
          <Field label="Descrição">
            <TextArea placeholder="Qual é o objetivo deste projeto?" rows={3} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* MODAL: NOVA FRENTE */}
      <Modal open={frontModalOpen} title="Nova Frente de Trabalho" onClose={() => setFrontModalOpen(false)} footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFrontModalOpen(false)}>Cancelar</Button>
          <Button variant="primary" disabled={!frontForm.name} onClick={handleCreateFront}>Salvar Frente</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <Field label="Nome da Frente" hint={!frontForm.name ? <span className="text-danger text-sm">Obrigatório</span> : undefined}>
            <TextInput placeholder="Ex: Frontend" value={frontForm.name} onChange={(e) => setFrontForm({ ...frontForm, name: e.target.value })} />
          </Field>
          <Field label="Descrição">
            <TextArea placeholder="Descreva as responsabilidades dessa frente..." rows={3} value={frontForm.description} onChange={(e) => setFrontForm({ ...frontForm, description: e.target.value })} />
          </Field>
          <Field label="Cor de Identificação">
            <div className="flex gap-2">
              {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"].map((c) => (
                <button
                  key={c}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: frontForm.color === c ? "2px solid #fff" : "none", outline: frontForm.color === c ? `2px solid ${c}` : "none", cursor: "pointer" }}
                  onClick={() => setFrontForm({ ...frontForm, color: c })}
                  aria-label={`Selecionar cor ${c}`}
                  type="button"
                />
              ))}
            </div>
          </Field>
        </div>
      </Modal>

    </div>
  );
}