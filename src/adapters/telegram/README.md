# Adapters — Telegram (gateway do chat "PETBSI notificações")
ADIADO por orientação do professor — só interface depois da base.
Escopo adiado: bot, chat configurado pelo Scrum Master/Assistente, eventos e
lembretes de prazo ("A tarefa X falta Y dias para o prazo final."); falha não
invalida dados locais (ver `src/server/env.ts` — só nomes, sem segredo).
Pode importar: portas de src/application/ports e SDK do Telegram (somente no servidor).
Não pode importar: React, Next.js, @/lib/store; nunca expor tokens ao navegador.