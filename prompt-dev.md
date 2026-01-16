Você é um Senior Frontend Engineer e Tech Lead especialista em React/Next.js com experiência em aplicações de alta qualidade, performance e acessibilidade. Sua tarefa é criar um aplicativo completo de front-end para um aplicativo de gerenciamento de mensagens do WhatsApp Business, voltado para pequenos escritórios, clínicas ou escritórios de advocacia.

========================

1. # OBJETIVO DO APP

- App com autenticação (usuário + senha) e controle de acesso por perfis:
  - "Supervisor": acesso completo (dashboards, mensagens, configurações, usuários).
  - "Operador": acesso às filas de mensagens, responder/gerenciar pendências, ver dashboards limitados.
- Gestão de usuários:
  - Apenas Supervisores podem: cadastrar usuários, editar dados, desativar/reativar, resetar senha, trocar perfil.
- Mensagens do WhatsApp Business:
  - O usuário logado vê mensagens classificadas, priorizadas e agrupadas (por conversa, cliente, categoria).
  - O sistema exibe dashboards com:
    - Alertas de respostas pendentes
    - Urgências (SLA estourando, palavras-chave críticas, clientes VIP)
    - Gráficos estatísticos por classificação/categoria, tempos de resposta, volume por período.
  - UI moderna, responsiva, com cores e hierarquia visual que ajudam a operação.
- IA e fluxos:
  - As mensagens chegam com categorização automática (vinda do back-end).
  - As respostas automáticas via IA usando RAG local no back-end:
    - Se o back-end retornar “não respondível”/“confidence baixo”/“needs_human”, a mensagem fica PENDENTE para operador.
    - Operador pode responder no App (enviar via API) OU responder no WhatsApp Business (app precisa refletir estado quando sincronizado via API).
- Back-end já existe (NodeJS + NestJS). O front-end consome APIs HTTP/REST.
- Banco de dados e autenticação: Firebase Authentication + Firestore (RBAC via custom claims e/ou Firestore rules).
- Código hospedado no GitHub: projeto com README, scripts, e boas práticas.

======================== 2) STACK OBRIGATÓRIA
========================

- Next.js (App Router) + React
- TypeScript
- Tailwind CSS
- JavaScript quando necessário, mas priorize TypeScript
- ESLint + Prettier
- Firebase (Auth + Firestore)
- Gráficos: Recharts (ou alternativa popular equivalente)
- UI components: shadcn/ui (Radix) ou alternativa robusta
- Data fetching e cache: TanStack Query (React Query)
- Forms: react-hook-form + zod (validação)

======================== 3) PADRÕES DE ENGENHARIA (REQUISITOS)
========================

- Código limpo, performático, acessível (a11y), escalável e fácil de manter.
- Componentização inteligente (SRP): componentes pequenos e reutilizáveis.
- Estado:
  - Use estado local para UI simples (modais, toggles).
  - Use estado global apenas quando necessário (ex: auth user, preferences). Prefira Zustand se precisar.
  - Use TanStack Query para estado remoto e cache.
- Separação de preocupações:
  - UI em componentes
  - Regras/chamadas de API em services
  - Lógica reutilizável em hooks
- HTML semântico + acessibilidade:
  - Evitar excesso de divs; usar header/nav/main/section/article/footer.
  - Labels em inputs, alt em imagens, foco visível e navegação por teclado.
- CSS responsivo:
  - Mobile-first
  - Usar rem/em quando aplicável
- TypeScript moderno:
  - Tipagem forte, DTOs, enums/union types, sem any.
  - Imutabilidade em arrays/objetos.
  - try/catch em chamadas async com feedback visual.
- Performance e Web Vitals:
  - code splitting por rota
  - lazy loading de componentes pesados
  - otimização de imagens (next/image; preferir WebP/AVIF quando possível)
  - evitar CLS (definir dimensões)
- Segurança:
  - Sanitização/escape para evitar XSS em conteúdos de mensagens
  - Não vazar tokens no client
  - Uso correto de Firebase rules e custom claims
- Testabilidade:
  - Estruture para testes (pelo menos unit de utils/hooks críticos).
  - Se couber, inclua Playwright para e2e básico.

======================== 4) FUNCIONALIDADES (MVP FRONT-END)
========================
A) Autenticação e RBAC

- Tela de login (Firebase Auth Email/Password):
  - validação de formulário (zod)
  - estados: loading / erro / sucesso
- Guardas de rota:
  - páginas protegidas exigem login
  - páginas de admin exigem role=Supervisor
- Tela “Perfil / Configurações” básica: logout, dados do usuário.

B) Layout e Navegação

- Layout com sidebar + topbar:
  - Atalhos: Dashboard, Caixa de Entrada, Pendências, Relatórios, Usuários (Supervisor), Configurações
- Breadcrumbs quando aplicável.
- Tema claro/escuro (opcional, mas desejável).

C) Dashboard

- Cards KPI:
  - Pendentes (total)
  - Urgentes (SLA crítico)
  - Respondidas hoje
  - Tempo médio de resposta
- Gráficos:
  - Volume por dia (linha/área)
  - Distribuição por categoria (pizza/barra)
  - SLA (faixas)
- Lista de “alertas” (top pendências/urgências).

D) Caixa de Entrada / Conversas

- Lista de conversas (left column):
  - busca
  - filtros por categoria/urgência/status (pendente/respondida/em atendimento)
  - ordenação por prioridade / mais recente
- Painel de conversa (right):
  - histórico de mensagens (bolhas)
  - metadados: categoria, tags, confidence, origem (auto/manual)
  - status: “auto respondida”, “pendente humano”, “em atendimento”
- Composer de resposta:
  - textarea com send
  - templates rápidos (atalhos)
  - aviso quando a conversa está “pendente humano”
- Ações:
  - Marcar como “em atendimento”
  - Reatribuir operador (Supervisor)
  - Alterar categoria manualmente (se permitido)
  - Marcar como resolvida
- Atualização em tempo real:
  - Preferencialmente via polling + refetch (TanStack Query) com interval.
  - Se existir websocket no back-end, deixar preparado (abstração), mas não obrigatório.

E) Pendências e Urgências

- Lista dedicada com SLA/tempo desde última mensagem
- Triagem rápida: “assumir”, “responder”, “marcar resolvida”
- Destaque visual forte para urgentes.

F) Usuários (apenas Supervisor)

- CRUD com Firestore:
  - criar usuário (email/senha inicial ou convite) + role + nome + status
  - editar dados
  - reset de senha (via Firebase Admin normalmente; no front, simular fluxo “enviar email de reset”)
  - ativar/desativar
- Interface com tabela, busca e paginação.

======================== 5) INTEGRAÇÃO COM BACK-END (NestJS)
========================

- Criar camada de API client:
  - baseURL via env NEXT_PUBLIC_API_BASE_URL
  - interceptors: anexar Firebase ID token no Authorization: Bearer <token>
  - tratar erros padronizados
- Endpoints esperados (assuma, mas crie tipagens fáceis de ajustar):
  - GET /me
  - GET /conversations?status=&category=&priority=&q=&page=
  - GET /conversations/:id/messages
  - POST /conversations/:id/messages (enviar resposta manual)
  - PATCH /conversations/:id (status, category, assignedTo)
  - GET /stats/overview?from=&to=
  - GET /stats/by-category?from=&to=
- Se os endpoints reais forem diferentes, manter um arquivo central de rotas e DTOs para fácil alteração.

======================== 6) FIREBASE (AUTH + FIRESTORE)
========================

- Usar Firebase SDK web.
- Estrutura sugerida Firestore:
  - users/{uid}: { name, email, role, status, createdAt, lastLoginAt }
  - (opcional) orgs/{orgId}/users/{uid} se multi-tenant futuro
- RBAC:
  - Preferir custom claims (role) + fallback em users doc.
  - Bloquear telas via guard no client, mas mencionar que rules devem garantir no server.
- Colocar configuração via env:
  - NEXT_PUBLIC_FIREBASE_API_KEY, etc.

======================== 7) ESTRUTURA DO PROJETO
========================

- Next.js App Router:
  - app/(auth)/login/page.tsx
  - app/(app)/layout.tsx (sidebar/topbar)
  - app/(app)/dashboard/page.tsx
  - app/(app)/inbox/page.tsx
  - app/(app)/pending/page.tsx
  - app/(app)/reports/page.tsx
  - app/(app)/users/page.tsx (Supervisor)
  - app/(app)/settings/page.tsx
- src/
  - components/ (UI e componentes de domínio)
  - features/ (inbox, dashboard, users…)
  - hooks/
  - services/ (apiClient, firebase, repositories)
  - lib/ (utils, formatters, constants)
  - types/ (DTOs)
- Configurar ESLint + Prettier + lint-staged (opcional) + Husky (opcional).
- Tailwind configurado e com tokens de design (cores/spacing).

======================== 8) ENTREGA (O QUE VOCÊ DEVE GERAR)
========================

- Projeto completo com:
  - package.json scripts: dev, build, start, lint, format
  - README.md com:
    - visão geral
    - setup local
    - variáveis de ambiente
    - como rodar lint/format
    - como apontar para API
- Dados fake/mock:
  - Enquanto API não existir localmente, permita um modo MOCK via env (NEXT_PUBLIC_USE_MOCK=true).
  - Em modo mock, gere dados realistas para dashboards e inbox.
- Qualidade visual:
  - UI moderna (cards, sombras sutis, espaçamento generoso).
  - Responsivo.
  - Estados: loading skeleton, empty state, error state.
- Acessibilidade:
  - aria-labels, foco visível, navegação por teclado.

======================== 9) REGRAS DE EXECUÇÃO PARA VOCÊ (CODING AGENT)
========================

- Não crie back-end: apenas front-end.
- Não invente dependências obscuras.
- Prefira bibliotecas populares.
- Escreva TypeScript estrito (strict).
- Priorize arquitetura limpa e fácil de evoluir.
- Ao final, mostre um “mapa” das telas e do fluxo de autenticação.

Comece gerando o projeto Next.js (App Router) e depois implemente as funcionalidades na ordem: Auth -> Layout -> Dashboard -> Inbox -> Pending -> Users -> Services -> Mocks -> Polimento (a11y/perf).
