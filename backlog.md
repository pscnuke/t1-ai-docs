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
- É a UX do usuário do sistema (operadores e supervisores)

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
- Quando se referenciar a tenant, use o termo Unidade.
- Desenvolva inicialmente os seguintes módulos:

1. Controle de acesso (login)
2. Cadastro de Tenant (Cadastro de Unidades)
3. Cadastro de Usuários
4. Visualização de Logs do RAG
5. Visualização das métricas do RAG
6. Dashboard com estatísticas dos tenants e seus usuários

### 1. Controlde de acesso (login)

- Mesmo método de autenticação do Front-End
- Somente usuários com perfil 'admin' podem se logar (Firestore: users/role).
- Somente usuários ativos podem se logar.
- Deixe somente o quadro de login (não precisa daquele outro quadro do Front-End)
- Coloque na tela de login o nome do sistema indicando que é o módulo de administração

### 2. Cadastro de Unidades (tenant)

- Módulo para cadastro (inclusão, modificação, desativação) do tenant.
- Deve interagir tanto com o cadastro de tenant no Firestore como no cadastro de tenant do Postgres.
- Campos mínimos:
  - alias: um campo texto que indica um nome do tenant
  - id: o id do tenant
  - ownerId: o id do usuário proprietário do tenant
  - campos de data de criação e data de atualização (usar nomes padrões)
- No Firestore é a collections 'tenants'
- No Postgress é a tabela 'Tenant'

### 3. Cadastro de Usuários

- Além dos campos tradicionais, incluir seleção de tenant que pertence o usuário e qual o perfil (role).
- Possibilidade de resetar a senha.
- Possibilidade de desativar/ativar usuário.
- Criar campos administativos de datas (data de criação e data da última atualização). Usar os nomes padrões para estes dois campos. Criar as funcionalidades para manter estes campos atualizados.
- Criar campo de informe qual o usuário que fez a última modificação no registro do usuário. Criar as funcionalidades para que este campo esteja sempre atualizado.
- Temos 3 tipos de roles (perfis):
  - Operador: usuário comum do tenant
  - Supervisor: usuário com mais privilégios do tenant (é o administrador do tenant, tem os maiores privilégios do tenant)
  - admin: super usuário, tem acesso a tudo, somos nós (desenvedores e mantenedores deste sistema)

### 4. Visualização de Logs do RAG

- Basicamente ver os logs da tabela AiMessageLog
- Usar os endpoints já disponíveis no back-end (Admin AI Logs)

### 5. Visualização das métricas do RAG

- Mostrar os dados disponíveis dos endpoints de métricas do RAG
- Usar os endpoints já disponíveis no back-end (Admin AI Métricas)

### 6. Dashboard com estatísticas dos tenants e seus usuários

- Dashboard mostrando informações sobre quantitativos de tenants, usuários, logs e métricas
- Esse dashboard deve ser a tela inicial ao entrar no sistema

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
