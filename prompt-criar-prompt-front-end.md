# Objetivo

Crie um prompt para usar no Codex da OpenAI Coding Agent. Este prompt será usado para construir um aplicativo (App) do tipo front-end.

1. ## Definição do App que o prompt deve especificar:
   1. App com controle de acesso (usuário+senha) que faz a gestão das mensagens de WhatsApp Business de um pequeno escritório, clínica ou escritório de advocacia
   2. A princípio teremos dois tipos de usuários: os supervisores (que tem acesso completo) e os operadores (que são aqueles que vão responder as mensagens). Portanto necessário fazer uma funcionalidade de cadastro de usuários onde somente os supervisores podem cadastrar, mudar os dados, resert a senha, etc
   3. O sistema usa categorização automática de mensagens via IA
   4. O sistema usa respostas automáticas pela IA usando um RAG local no back-end. As mensagens que o RAG não consegue responder devem ficar pendentes para resposta manual pelo operador. As mensagens podem ser respondidas no App ou pelo próprio WhatsApp Business
   5. Quando o usuário se logar vai ver mensagens classificadas, priorizadas e agrupadas. Mostrar em formato de dashboards. Alertas de respostas pendentes, e urgências. Vai ter gráficos estatísticos para as diferentes classificações. Tudo muito moderno, com cores que ajudam na operação
2. ## Stack
   1. O prompt deverá definir toda a stack de desenvolvimento
   2. Use as mais populares e robustas
   3. Já definimos algumas e deverão constar no prompt: React, NextJS, Tailwind CSS, JavaScript, Typescript
3. ## Padrões de desenvolvimento que o prompt deverá se referir:
   1. Usar ESLint + Prettier
   2. Melhores práticas de desenvolvimento e mais modernas devem ser usadas
   3. Instruir para usar código limpo, focado em performance, acessibilidade e escalabilidade. Aplicações que sejam performáticas, acessíveis, escaláveis e fáceis de manter.
   4. **Componentização Inteligente:** Quebrar a interface em componentes pequenos, reutilizáveis e isolados. Seguir o princípio de **Responsabilidade Única** (um componente deve fazer apenas uma coisa bem feita).
   5. **Gerenciamento de Estado:** Não use um "martelo para matar uma mosca".
      1. Use **estado local** para coisas simples (abrir/fechar um modal).
      2. Use **estado global** (Context API, Redux, Zustand) apenas quando dados precisam ser compartilhados entre muitos componentes distantes na árvore.
   6. **Separação de Preocupações (SoC):** Mantenha a lógica de negócios (regras, chamadas de API) separada da lógica de apresentação (UI). Hooks customizados (no React) ou Services são ótimos para isso.
   7. HTML Semântico e Acessibilidade (a11y). A acessibilidade não é uma "feature", é um requisito básico da Web. Use HTML semântico e bem estruturado:
      1. **Use HTML Semântico:** Evite o excesso de `<div>`. Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, e `<footer>`. Isso melhora o SEO e ajuda leitores de tela a entenderem a estrutura da página.
      2. **Textos Alternativos e Labels:** Sempre forneça atributos `alt` descritivos para imagens e garanta que todos os campos de formulário tenham `labels` associados.
      3. **Navegação por Teclado:** Teste sua aplicação usando apenas a tecla `Tab`. O foco deve ser visível e seguir uma ordem lógica.
   8. CSS e Design Responsivo
      1. **Mobile-First:** Comece estilizando para telas pequenas e use _media queries_ para adaptar o layout para telas maiores. Isso geralmente resulta em um código CSS mais limpo e performático.
      2. **Unidades Relativas:** Prefira usar `rem` e `em` para fontes e espaçamentos em vez de `px` fixos. Isso permite que o site escale de acordo com as preferências do navegador do usuário.
   9. JavaScript e TypeScript Moderno
      1. **Adote TypeScript:** O uso de tipagem estática previne a maioria dos erros de execução comuns (como `undefined is not a function`) e melhora drasticamente a experiência de desenvolvimento com autocompletar inteligente.
      2. **Imutabilidade:** Ao lidar com objetos e arrays, prefira criar novas cópias em vez de alterar o original (use `map`, `filter`, `reduce` e o spread operator `...`). Isso é crucial para a detecção de mudanças em frameworks reativos.
      3. **Tratamento de Erros:** Sempre envolva chamadas assíncronas em blocos `try/catch` e forneça feedback visual ao usuário caso algo dê errado.
   10. Performance e Web Vitals
       - A velocidade de carregamento impacta diretamente a retenção de usuários e o ranking no Google.
       - **Core Web Vitals:** Foque nas métricas principais:
       - **LCP (Largest Contentful Paint):** Velocidade de carregamento do conteúdo principal.
       - **CLS (Cumulative Layout Shift):** Estabilidade visual (evite elementos que "pulam" de lugar).
       - **INP (Interaction to Next Paint):** Responsividade à interação do usuário.
       - **Code Splitting e Lazy Loading:** Não carregue todo o JavaScript de uma vez. Divida o código por rotas e carregue imagens ou componentes pesados apenas quando eles entrarem na tela.
       - **Otimização de Mídia:** Use formatos modernos de imagem como **WebP** ou **AVIF** e sempre defina `width` e `height` explícitos para evitar _layout shifts_.
   11. Segurança
       1. **Sanitização de Dados:** Nunca confie em dados vindos do usuário ou de APIs. Proteja-se contra ataques XSS (Cross-Site Scripting) usando bibliotecas que escapam o HTML perigoso.
4. ## Banco de dados e controle de acesso:
   1. O banco de dados e a solução de controle de acesso será a solução Firestore/Firebase
5. ## Back-end
   1. O back-end já está desenvolvido e é baseado em NodeJS e Nest.JS
   2. A comunicação com o back-end será via suas api
6. ## O código fonte deverá ser hospedado no github
