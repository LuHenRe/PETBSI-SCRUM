"use client";

import { useState } from "react";
import { Calendar, FolderOpen, Mail, MessageSquareText, Plug } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

function IntegrationCard({
  icon,
  name,
  description,
  connected,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  connected: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="avatar avatar-lg">{icon}</span>
          <div>
            <h3>{name}</h3>
            <p className="text-muted text-sm mt-1">{description}</p>
          </div>
        </div>
        <Badge tone={connected ? "ok" : "muted"} dot>{connected ? "Conectado" : "Não conectado"}</Badge>
      </div>
      <div className="mt-3 flex items-center gap-3 wrap">
        <Button
          variant={connected ? "secondary" : "primary"}
          size="sm"
          onClick={onToggle}
          aria-pressed={connected}
        >
          <Plug size={14} /> {connected ? "Desconectar" : "Conectar"}
        </Button>
        {children}
      </div>
    </Card>
  );
}

export default function IntegracoesPage() {
  const [drive, setDrive] = useState(true);
  const [gmail, setGmail] = useState(true);
  const [calendar, setCalendar] = useState(false);
  const [telegram, setTelegram] = useState(true);
  const [folder, setFolder] = useState("1DbKp_FolderPETBSI_Entregas");
  const [remetente, setRemetente] = useState("petbsi@projeto.edu.br");
  const [testSent, setTestSent] = useState(false);

  return (
    <div>
      <div className="mb-4">
        <h1>Integrações</h1>
        <p className="text-muted mt-1">
          Conexões com provedores externos. Tokens e segredos ficam somente no servidor e nunca no navegador.
        </p>
      </div>

      <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
        <IntegrationCard
          icon={<FolderOpen size={20} />}
          name="Google Drive"
          description="Pasta de arquivos e vínculos de itens e entregas."
          connected={drive}
          onToggle={() => setDrive((v) => !v)}
        >
          {drive && (
            <span className="badge badge-muted">Pasta: {folder}</span>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={<Mail size={20} />}
          name="Gmail"
          description="Envio de notificações e e-mails com destino autorizado."
          connected={gmail}
          onToggle={() => setGmail((v) => !v)}
        >
          {gmail && <span className="badge badge-muted">Remetente: {remetente}</span>}
        </IntegrationCard>

        <IntegrationCard
          icon={<Calendar size={20} />}
          name="Google Calendar"
          description="Sincronização da agenda interna. Opcional no primeiro incremento."
          connected={calendar}
          onToggle={() => setCalendar((v) => !v)}
        >
          {calendar && (
            <span className="badge badge-muted">Calendário: PETBSI · Reuniões</span>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={<MessageSquareText size={20} />}
          name="Telegram — PETBSI notificações"
          description="Notificações de eventos e lembretes de prazo no chat do bot."
          connected={telegram}
          onToggle={() => setTelegram((v) => !v)}
        >
          {telegram && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // Demonstração: em produção o envio passa por
                // SendTelegramMessageUseCase → TelegramGateway no servidor.
                // Aqui apenas simulamos o feedback local, sem tocar no store.
                setTestSent(true);
                window.setTimeout(() => setTestSent(false), 3000);
              }}
            >
              Enviar teste
            </Button>
          )}
          {testSent && <span className="badge badge-ok">Mensagem enviada</span>}
        </IntegrationCard>

        <Card>
          <div className="flex items-center gap-2 wrap justify-between">
            <div className="text-sm text-soft">
              <strong>Segurança:</strong> as configurações acima são de demonstração. Em produção, OAuth, tokens,
              retries e o mapeamento de erros são executados exclusivamente no servidor.
            </div>
            <Badge tone="info">Dados locais nunca dependem das integrações</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}