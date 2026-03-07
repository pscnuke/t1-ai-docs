# Back log de funcionalidades do back-end de IA

- Resumo das conversas - FEITO
- Reescrever a resposta - FEITO
- Colocar endpoint /conversations/summary para dentro de /ia/summary - FEITO
- Atualizar swagger com descrições mais detalhadas dos principais endpoints - FEITO
- Atualizar módulo de categories - FEITO
- Responder a conversas e não a simplesmente mensagens - FEITO
- Ao criar tenant, retirar retorno das categorias e prompts pack - FEITO
- Implementar a possibilidade de enviar apenas uma mensagem para o chat (atualemnte só conjunto de mensagens) - FEITO
- Sugestão de respostas - FEITO
- Regras operacionais - FEITO
- Instruções para o RAG (vai junto com a pergunta, contexto, resumo) - FEITO
- Prirização das respostas (Urgente, Alta, Média, Baixa, ainda não priorizada) - FEITO
- Implantar conceito de Queue (fila das conversas), grupo de pessoas para quem a conversa se deve ser tratada - FEITO

# Projeto t1-ai-admin

- Levando em consideração o contexto já estudado anteiormente, vamos fazer o planejamento para um novo projeto:
  - O módulo de administração do sistema
  - A ser usado pelos desenvolvedores e proprietários do sistema

## Contexto

### Atualmente nosso projeto de gestão de mensagens de WhtsApp é composto por dois projeto:

- t1-ai: back-end
- t1-ai-front: front-end

### Back-end

- projeto t1-ai
- Nosso back-end é composto por uma solução que usa IA para ajudar nas respsotas e gestão das mensagens e conversas do WhatsApp.
- Analise agents.md e README.para mais detalhes.
- Analise t1-ai/prisma/schema.primsa para o modelo de banco de dados Postgres.
- Backend em NestJS (TypeScript)
- Banco: PostgreSQL + pgvector
- ORM: Prisma

#### Banco de dados

- O banco de dados do RAG é o postgres + pgvector. Modelo com o Prisma.
- Também usamos o Firestore do GCP como banco de dados para gerir a integração com o WhatsApp e cadastro de usuários e clientes

### Front-End

- projeto t1-ai-front
- Next.js App Router com Auth Firebase + React Query + UI operacional por papel (useAuth.tsx, layout.tsx).
- É a UX do usuário do sistema, do tenant

## Objetivo

- Planejar e desenvolver o módulo de administração de nosso sistema de gestão de mensagens de WhatsApp.
- Se o front-end é a UX do cliente, o t1-ai-admin é o UX de administração a ser usada por nós, desenvolvedores e mantenedore do sistema.
- O nome do aplicativo é 'CommSupervisor Admin'

## Especificações Gerais

- Deve ter o mesmo padrão de UX do front-end assim como a mesma stack.
- Deve ter o mesmo Design System do front-end.
- Respeite e use as mesmas versões de softwares dos dois projetos quando necessário.
- Pasta raiz do projeto: t1-ai-admin.
- Criar agents.md na pasta raiz.
- Inicializar git na pasta raiz.
- Não alterar o projeto t1-ai-front.
- Usar necessariamente os endpoints existentes no back-end. Se precisar de algum novo endpoint, peça minha autorização para criá-lo.
- Para acessar o Firestore no GCP use a mesma forma que o front-end atualmente faz.
- Quando se referenciar a RAG, use o termo Base de Conhecimento.
- Quando se referenciar a tenant, use o termo unidade.
- Desenvolva inicialmente os seguintes módulos:

1. Controle de acesso (login)
2. Cadastro de Tenant
3. Visualização de Logs do RAG
4. Visualização das métricas do RAG
5. Dashboard com estatísticas dos tenants e seus usuários

### 1. Controlde de acesso

- Mesmo método de autenticação do Front-End
- Somente usuários com perfil 'admin' podem se logar (Firestore: users/role)

### 2. Cadastro de Tenant

- Módulo para cadastro (inclusão, modificação, desativação) do tenant
- Deve interagir tanto com o cadastro de tenant no Firestore como no cadastro de tenant do Postgres

### 3. Visualização de Logs do RAG

- Basicamente ver os logs da tabela AiMessageLog
- Usar os endpoints já disponíveis no back-end (Admin AI Logs)

### 4. Visualização das métricas do RAG

- Mostrar os dados disponíveis dos endpoints de métricas do RAG
- Usar os endpoints já disponíveis no back-end (Admin AI Métricas)

### 5. Dashboard com estatísticas dos tenants e seus usuários

- Dashboard mostrando informações sobre quantitativos de tenants, usuários, logs e métricas

## Git

- O projeto deve ser hospedado no github
- O projeto vai estar na organização palmalabs (mesma organização dos outros dois)
- Local: https://github.com/palmalabs/t1-ai-admin
- Criar tal respositório
- Inicializar o git

## Ao final

- Ao final teremos 3 projetos:

1. t1-ai, back-end, já existente
2. t1-ai-front, front-end, já existente
3. t1-ai-admin, módulo de administração, que estamos planejando e executando agora
