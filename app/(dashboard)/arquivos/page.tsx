"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FolderOpen, Upload } from "lucide-react";
import { uploadAttachment, useAppState } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import { Badge, Button, Card, EmptyState } from "@/components/ui";

export default function ArquivosPage() {
  const state = useAppState();
  const [uploading, setUploading] = useState(false);
  const [selectedKind, setSelectedKind] = useState<"item" | "entrega">("item");

  const handleUpload = (file: File | null) => {
    if (!file) return;
    setUploading(true);
    uploadAttachment({
      name: file.name,
      kind: selectedKind,
      refId: selectedKind === "item" ? state.backlogItems[0]?.id ?? "" : state.deliveries[0]?.id ?? "",
      uploadedBy: state.currentUserId ?? "",
    }).finally(() => setUploading(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between wrap gap-3 mb-4">
        <div>
          <h1>Arquivos</h1>
          <p className="text-muted mt-1">Vínculos com o Google Drive e estado dos uploads. Apenas metadados ficam no sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="select"
            style={{ width: "auto" }}
            aria-label="Tipo do arquivo"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value as "item" | "entrega")}
          >
            <option value="item">Vincular a um item</option>
            <option value="entrega">Vincular a uma entrega</option>
          </select>
          <label className="btn btn-primary">
            <Upload size={15} />
            {uploading ? "Enviando..." : "Enviar arquivo"}
            <input
              type="file"
              hidden
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      {state.attachments.length === 0 ? (
        <Card>
          <EmptyState icon={<FolderOpen />} title="Nenhum arquivo" description="Os arquivos enviados ao Drive aparecerão aqui." />
        </Card>
      ) : (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Vínculo</th>
                  <th>Estado</th>
                  <th>Enviado por</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {state.attachments.map((attachment) => {
                  const ref =
                    attachment.kind === "item"
                      ? state.backlogItems.find((i) => i.id === attachment.refId)
                      : state.deliveries.find((d) => d.id === attachment.refId);
                  return (
                    <tr key={attachment.id}>
                      <td style={{ fontWeight: 600 }}>{attachment.name}</td>
                      <td>
                        <Link href={attachment.kind === "item" ? `/itens/${attachment.refId}` : "/entregas"} className="text-sm">
                          {attachment.kind === "item" ? ref?.title ?? "Item" : ref?.title ?? "Entrega"}
                        </Link>
                      </td>
                      <td>
                        <Badge tone={attachment.status === "synced" ? "ok" : attachment.status === "pending" ? "warn" : "danger"} dot>
                          {attachment.status === "synced" ? "No Drive" : attachment.status === "pending" ? "Pendente" : "Falhou"}
                        </Badge>
                      </td>
                      <td>{state.people.find((p) => p.id === attachment.uploadedBy)?.name ?? "—"}</td>
                      <td>{formatDate(attachment.uploadedAt)}</td>
                      <td>
                        <a className="btn btn-ghost btn-sm" href={attachment.url} target="_blank" rel="noreferrer" aria-label="Abrir no Drive">
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}