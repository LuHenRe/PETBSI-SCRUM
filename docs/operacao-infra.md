# Operação: PostgreSQL, Google e entrega contínua

## 1. Código e ambientes

Este projeto usa **Next.js (frontend e servidor no mesmo aplicativo)** e PostgreSQL no Neon. O repositório remoto já usa `main` para produção na Vercel. Um push direto na `main` inicia um build de produção **antes** do término dos checks de GitHub Actions: rode os checks locais e não publique etapas incompletas. O trabalho nesta cópia ainda não foi enviado ao GitHub.

Sem acesso ao projeto Vercel existente, é possível desenvolver localmente e usar **um projeto Vercel de testes próprio, sem integrar o repositório Git**, com URL e banco separados. Isso não substitui o controle do domínio de produção existente. Antes de disponibilizar a versão autenticada no domínio público, confirme quem controla sua promoção/configuração.

| Ambiente | Banco | Login | Segredos |
|---|---|---|---|
| Local | PostgreSQL de desenvolvimento ou branch Neon não produtiva | cliente OAuth local | `.env.local` ignorado pelo Git |
| CI | PostgreSQL descartável do workflow; sem dados reais | credenciais fictícias só para build | nenhum segredo de produção |
| Testes na Vercel | banco/branch **com dados sintéticos**, nunca uma cópia de pessoas reais de produção | cliente OAuth com callback estável de testes | variáveis do projeto Vercel de testes |
| Produção | banco exclusivo e papel de aplicação restrito | cliente OAuth de produção | variáveis **Production** do projeto Vercel existente |

Uma branch Neon derivada do banco de produção pode copiar seus dados: **não a use como preview aberto**. Faça backups antes de migrações de produção e verifique o procedimento de restauração.

## 2. Configuração por pessoa responsável

1. **Neon de testes já preparado nesta cópia:** o projeto `fancy-frost-33786176` (Ohio) está vinculado em `.neon`, sem puxar o papel proprietário para o runtime. A branch Neon se chama `production` por padrão, mas este **não é o banco de produção da equipe**. As migrações e as quatro frentes/seis colunas iniciais já foram aplicadas ao banco `neondb`. `petbsi_test` é um banco separado, descartável, usado somente para testes de integração.
2. `.env.local` já foi criado localmente com permissão `0600`, `DATABASE_URL` **pooled** do papel restrito `petbsi_app`, `AUTH_URL` e um `AUTH_SECRET` aleatório. Não sobrescreva esse arquivo copiando `.env.example` e nunca o envie por chat ou commit. O papel `petbsi_app` não pode alterar a estrutura do banco. Se recriar o ambiente, use a **URL direta** do papel de migração somente durante as migrações/bootstrap; não a coloque no runtime da Vercel.
3. **Ainda depende de você:** no Google Cloud, configure a tela de consentimento e um cliente OAuth **Web application**. Cadastre a URI de retorno exata `http://localhost:3000/api/auth/callback/google`. Acrescente `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` ao `.env.local` localmente. Para um ambiente com URL estável, cadastre `https://SEU-DOMINIO/api/auth/callback/google` em cliente próprio daquele ambiente. Preview com domínio aleatório não deve usar credenciais de produção. O login requer apenas identidade (`openid email profile`), não Drive/Gmail.

O comando `neon link --no-env-pull --no-config` foi usado de propósito: `neon link` sem essas opções pode gravar a URL do **papel proprietário** em um arquivo `.env`, e não precisamos de `neon.ts` para a aplicação Next.js/Drizzle. `neon skills`, `neon mcp`, `neon config init` e `neon deploy` dizem respeito a ferramentas de agente ou serviços Neon adicionais e não são pré-requisitos para este projeto.

No Neon, os papéis criados pelo Console podem receber privilégios administrativos. Para o **papel de runtime**, crie um papel SQL restrito após aplicar as migrações (no SQL Editor, conectado como dono do banco; adapte o nome do banco):

```sql
CREATE ROLE petbsi_app WITH LOGIN PASSWORD 'SENHA_ALEATORIA_GERADA_FORA_DO_REPOSITORIO';
GRANT CONNECT ON DATABASE neondb TO petbsi_app;
GRANT USAGE ON SCHEMA public TO petbsi_app;
GRANT SELECT ON "user", project_membership, front, sprint, backlog_item,
  workflow_column, work_item_state_change, blocker, item_assignee, calendar_event,
  delivery, delivery_item
  TO petbsi_app;
GRANT UPDATE ("googleSubject") ON "user" TO petbsi_app;
GRANT INSERT, UPDATE ON backlog_item, blocker, sprint, project_membership, workflow_column
  TO petbsi_app;
GRANT INSERT ON work_item_state_change, audit_event, calendar_event, item_assignee,
  delivery, delivery_item TO petbsi_app;
GRANT UPDATE ON delivery TO petbsi_app;
GRANT DELETE ON item_assignee TO petbsi_app;
```

Os `GRANT`s acima documentam o papel **já criado** por `scripts/provision-neon-runtime.ts`. Não rode `CREATE ROLE` novamente neste projeto; o script se recusa a sobrescrever `.env.local` ou a senha de um papel existente. Em outros ambientes, faça isso **depois** das migrações. Novas tabelas em migrações futuras exigem revisar os `GRANT`s do runtime.

## 3. Ordem de execução no ambiente de desenvolvimento

```bash
npm ci
npm run dev
```

Migração e bootstrap **já foram executados** no `neondb`. Para novas migrações, forneça `MIGRATION_DATABASE_URL` temporariamente (conexão direta e TLS `verify-full`); ela não fica no `.env.local`. Para convidar a primeira pessoa, com e-mail e papel confirmados, execute no terminal **sem imprimir a URL**:

```bash
MIGRATION_DATABASE_URL="$(npm exec --yes --package=neon@latest -- neon connection-string production --role-name neondb_owner --database-name neondb --ssl verify-full)" \
  npm run db:invite -- pessoa@exemplo.org PRODUCT_OWNER "Nome da pessoa"
```

O bootstrap cria **somente as quatro frentes e as seis colunas iniciais**, sem pessoas ou tarefas fictícias; valide o fluxo com a equipe antes de configurar limites de WIP. O convite exige uma conta Google com e-mail verificado e faz o vínculo inicial ao primeiro login. Cadastre os demais participantes apenas com e-mails e papéis confirmados. Membro recém-convidado não ganha edição em todas as frentes; um administrador técnico precisa conceder acesso/edição quando necessário.

Os comandos de migração e convite exigem `MIGRATION_DATABASE_URL` e **não são executados durante `next build`**. Cada nova alteração de schema deve gerar uma migração versionada (`npm run db:generate`), ser testada em ambiente descartável e aplicada de forma compatível com a versão ainda publicada antes da promoção de uma nova versão. Variáveis de servidor **não** usam o prefixo `NEXT_PUBLIC_`.

## 4. Verificação e publicação

```bash
npm run lint
npm run typecheck
npm run check:boundaries
npm test
npm run build
npm audit --omit=dev
```

O workflow em `.github/workflows/ci.yml` executa as migrações, bootstrap e testes contra um PostgreSQL descartável em pushes e PRs, sem credenciais Neon/Google reais. O código não usa tokens Google para ler ou enviar e-mails: essas integrações permanecem desativadas até obterem autorização, escopos mínimos e implementação próprios. A agenda interna é independente do Calendar.

Com deploy no domínio existente, configurar proteção dos deploys de teste e promoção controlada antes de começar a enviar commits diretamente à `main`: o CI em `push` detecta problemas, mas não bloqueia a tentativa de deploy iniciada pelo mesmo push. Na ausência desse acesso, uma Vercel de teste independente é a alternativa para verificar o aplicativo sem alterar o domínio da equipe.
