# Adapters — Google (Drive, Gmail, Calendar e OAuth)
ADIADO por orientação do professor — só interface depois da base.
Escopo adiado: upload Drive, envio Gmail, sync Calendar e OAuth; status
(pending/synced/failed) e pasta de destino ficam no servidor (ver `src/server/env.ts` — só nomes, sem segredo).
Pode importar: portas de src/application/ports e SDKs Google (somente no servidor).
Não pode importar: React, Next.js, @/lib/store; nunca expor tokens ao navegador.