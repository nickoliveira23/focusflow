---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['prd.md', 'architecture.md']
date: 2026-02-17
project_name: pomodoro-app
author: Nicko
---

# pomodoro-app - Epic Breakdown

## Overview

This document provides the epic and story breakdown for pomodoro-app, decomposing PRD and Architecture into implementation-ready stories.

## Requirements Inventory

### Functional Requirements

FR1: UsuÃ¡rio deve iniciar, pausar, retomar e resetar timer de pomodoro.  
FR2: UsuÃ¡rio deve configurar duraÃ§Ã£o de foco, pausa curta, pausa longa e ciclo.  
FR3: Sistema deve executar ciclo completo de pomodoro com transiÃ§Ãµes automÃ¡ticas.  
FR4: Sistema deve persistir configuraÃ§Ãµes e histÃ³rico bÃ¡sico de sessÃµes.  
FR5: Sistema deve exibir estatÃ­sticas bÃ¡sicas (sessÃµes completas e tempo focado).  
FR6: UsuÃ¡rio deve opcionalmente conectar conta Spotify.  
FR7: Sistema deve exibir mÃºsica atual durante sessÃ£o de foco.  
FR8: Sistema deve oferecer gatilhos mentais (ritual opcional, transiÃ§Ãµes visuais, ambientaÃ§Ã£o).  
FR9: Sistema deve funcionar offline para fluxo principal de timer.  
FR10: Sistema deve sincronizar dados quando conexÃ£o for restaurada (fase backend MVP).

### NonFunctional Requirements

NFR1: Carregamento inicial < 2s em rede 4G.  
NFR2: Tempo de resposta de interaÃ§Ã£o < 100ms.  
NFR3: Timer com precisÃ£o sem drift perceptÃ­vel.  
NFR4: Compatibilidade com Chrome, Firefox, Safari e Edge modernos.  
NFR5: Interface responsiva para desktop e mobile.  
NFR6: Acessibilidade bÃ¡sica no MVP (teclado, labels, contraste mÃ­nimo).  
NFR7: SeguranÃ§a OAuth Spotify com PKCE e sem segredos no frontend.

### Additional Requirements

- Arquitetura local-first com IndexedDB para sessÃµes e configuraÃ§Ãµes.
- Backend Node/Fastify com PostgreSQL para sync/auth/Spotify.
- Contratos de API versionados e validados.
- SeparaÃ§Ã£o de domÃ­nio pronta para presenÃ§a compartilhada futura.
- Telemetria de eventos de foco e integraÃ§Ã£o Spotify.

### FR Coverage Map

- Epic 1 cobre FR1, FR2, FR3, FR9.
- Epic 2 cobre FR4, FR5.
- Epic 3 cobre FR6, FR7.
- Epic 4 cobre FR8 e refinamentos de NFR UX/performance.
- Epic 5 cobre FR10 e hardening tÃ©cnico de NFRs.

## Epic List

1. Epic 1: Core Timer and Focus Cycle
2. Epic 2: Local Data, Stats, and Progress
3. Epic 3: Spotify Integration
4. Epic 4: Focus Experience and Personalization
5. Epic 5: Sync API and Production Readiness
6. Epic 6: Google Authentication and User Identity
7. Epic 7: Automated Testing and Quality Gates

## Epic 1: Core Timer and Focus Cycle

Entregar o fluxo principal do pomodoro com precisÃ£o, controle completo do usuÃ¡rio e funcionamento offline.

### Story 1.1: Bootstrap do app e shell de timer

As a usuÃ¡rio focado,  
I want abrir o app e visualizar o timer imediatamente,  
So that eu possa iniciar uma sessÃ£o em poucos segundos.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio abre o app  
**When** o carregamento termina  
**Then** a tela principal do timer Ã© exibida  
**And** o tempo padrÃ£o de foco Ã© mostrado pronto para iniciar

### Story 1.2: Controles de timer (start/pause/resume/reset)

As a usuÃ¡rio focado,  
I want controlar o timer manualmente,  
So that eu tenha controle total da sessÃ£o.

**Acceptance Criteria:**

**Given** que o timer estÃ¡ parado  
**When** o usuÃ¡rio clica em iniciar  
**Then** o contador comeÃ§a corretamente  
**And** os botÃµes de pausa e reset ficam disponÃ­veis

### Story 1.3: Ciclo pomodoro automÃ¡tico

As a usuÃ¡rio focado,  
I want alternar automaticamente entre foco e pausas,  
So that eu siga o mÃ©todo pomodoro sem esforÃ§o extra.

**Acceptance Criteria:**

**Given** que uma sessÃ£o de foco termina  
**When** o modo automÃ¡tico estÃ¡ ativo  
**Then** o sistema muda para pausa curta ou longa conforme ciclo  
**And** registra a conclusÃ£o da sessÃ£o de foco

### Story 1.4: PrecisÃ£o e resiliÃªncia do timer

As a usuÃ¡rio focado,  
I want que o timer mantenha precisÃ£o mesmo com aba em segundo plano,  
So that eu confie no tempo exibido.

**Acceptance Criteria:**

**Given** que o timer foi iniciado  
**When** a aba entra em background e volta ao foreground  
**Then** o tempo restante Ã© recalculado por timestamp  
**And** nÃ£o ocorre drift perceptÃ­vel no contador

## Epic 2: Local Data, Stats, and Progress

Garantir persistÃªncia local, recuperaÃ§Ã£o de estado e estatÃ­sticas bÃ¡sicas para reforÃ§ar progresso.

### Story 2.1: PersistÃªncia de configuraÃ§Ãµes do timer

As a usuÃ¡rio recorrente,  
I want manter minhas configuraÃ§Ãµes salvas,  
So that eu nÃ£o precise reconfigurar a cada uso.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio altera duraÃ§Ã£o de foco e pausas  
**When** ele recarrega o app  
**Then** as preferÃªncias sÃ£o restauradas automaticamente  
**And** aplicadas no prÃ³ximo ciclo

### Story 2.2: Registro local de sessÃµes

As a usuÃ¡rio recorrente,  
I want que sessÃµes concluÃ­das sejam registradas,  
So that eu acompanhe meu progresso.

**Acceptance Criteria:**

**Given** que uma sessÃ£o de foco termina  
**When** o sistema finaliza a sessÃ£o  
**Then** o evento Ã© salvo no armazenamento local  
**And** contÃ©m duraÃ§Ã£o, timestamp e status

### Story 2.3: Dashboard de estatÃ­sticas bÃ¡sicas

As a usuÃ¡rio recorrente,  
I want visualizar mÃ©tricas essenciais,  
So that eu entenda minha consistÃªncia diÃ¡ria e semanal.

**Acceptance Criteria:**

**Given** que existem sessÃµes registradas  
**When** o usuÃ¡rio abre a Ã¡rea de estatÃ­sticas  
**Then** vÃª total de pomodoros e tempo focado por perÃ­odo  
**And** os dados refletem o histÃ³rico local salvo

## Epic 3: Spotify Integration

Entregar integraÃ§Ã£o opcional com Spotify para contexto emocional durante foco, com seguranÃ§a adequada.

### Story 3.1: Conectar e desconectar conta Spotify

As a usuÃ¡rio que usa mÃºsica para focar,  
I want conectar minha conta Spotify,  
So that eu traga meu contexto musical para a sessÃ£o.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio escolhe conectar Spotify  
**When** conclui OAuth com sucesso  
**Then** o app marca conta como conectada  
**And** permite desconectar em configuraÃ§Ãµes

### Story 3.2: Exibir now playing no modo foco

As a usuÃ¡rio que usa mÃºsica para focar,  
I want ver a faixa atual durante o pomodoro,  
So that o app reflita meu estado de foco.

**Acceptance Criteria:**

**Given** que a conta estÃ¡ conectada  
**When** hÃ¡ mÃºsica em reproduÃ§Ã£o no Spotify  
**Then** o app mostra tÃ­tulo, artista e estado de reproduÃ§Ã£o  
**And** falhas de API nÃ£o quebram o timer

## Epic 4: Focus Experience and Personalization

Construir diferenciaÃ§Ã£o de experiÃªncia com personalidade forte, gatilhos mentais e micro personalizaÃ§Ã£o.

### Story 4.1: Ritual de preparaÃ§Ã£o opcional

As a usuÃ¡rio que procrastina para comeÃ§ar,  
I want um ritual rÃ¡pido antes de iniciar,  
So that eu entre em estado de foco com menos fricÃ§Ã£o.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio ativa ritual opcional  
**When** clica em iniciar sessÃ£o  
**Then** o app executa sequÃªncia breve de preparaÃ§Ã£o  
**And** permite pular sem bloquear inÃ­cio do timer

### Story 4.2: TransiÃ§Ãµes visuais de foco e break

As a usuÃ¡rio focado,  
I want pistas visuais claras entre modos,  
So that eu reconheÃ§a transiÃ§Ãµes sem esforÃ§o cognitivo.

**Acceptance Criteria:**

**Given** que o app troca entre foco e pausa  
**When** a transiÃ§Ã£o ocorre  
**Then** a UI aplica mudanÃ§a visual consistente  
**And** mantÃ©m legibilidade e performance fluida

### Story 4.3: Micro configuraÃ§Ãµes de experiÃªncia

As a usuÃ¡rio avanÃ§ado,  
I want ajustar elementos da experiÃªncia,  
So that a ferramenta se adapte ao meu estilo de foco.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio acessa preferÃªncias  
**When** altera opÃ§Ãµes de UI/ritual/ambiente  
**Then** as mudanÃ§as sÃ£o aplicadas em tempo real  
**And** persistidas localmente

## Epic 5: Sync API and Production Readiness

Fechar requisitos de robustez para operaÃ§Ã£o online/offline com sincronizaÃ§Ã£o, observabilidade e padrÃµes de release.

### Story 5.1: API de settings e sessÃµes de foco

As a usuÃ¡rio autenticado,  
I want sincronizar minhas configuraÃ§Ãµes e sessÃµes,  
So that meus dados sobrevivam a troca de dispositivo.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio estÃ¡ autenticado  
**When** existem mudanÃ§as pendentes no cliente  
**Then** o app envia lote idempotente para API  
**And** confirma cursor de sincronizaÃ§Ã£o

### Story 5.2: Fila de sync e reconciliaÃ§Ã£o offline

As a usuÃ¡rio com conexÃ£o instÃ¡vel,  
I want o app continuar funcionando e sincronizar depois,  
So that eu nÃ£o perca progresso.

**Acceptance Criteria:**

**Given** que a conexÃ£o estÃ¡ offline  
**When** o usuÃ¡rio completa sessÃµes  
**Then** eventos ficam na fila local  
**And** sÃ£o sincronizados automaticamente quando rede retorna

### Story 5.3: InstrumentaÃ§Ã£o e critÃ©rios de release MVP

As a equipe de produto,  
I want medir comportamento real de uso,  
So that possamos validar KPIs do PRD com dados confiÃ¡veis.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio usa timer e Spotify  
**When** eventos crÃ­ticos acontecem  
**Then** eventos padronizados sÃ£o emitidos e armazenados  
**And** dashboard mÃ­nimo permite acompanhar mÃ©tricas-chave

## Epic 6: Google Authentication and User Identity

Permitir login com Google para separar dados por usuÃ¡rio e preparar evoluÃ§Ã£o para recursos sociais futuros.

### Story 6.1: Login com Google (OIDC)

As a usuÃ¡rio que quer manter histÃ³rico pessoal consistente,  
I want entrar com minha conta Google,  
So that meus dados fiquem vinculados Ã  minha identidade.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio clica em Login with Google  
**When** conclui consentimento no Google  
**Then** a aplicaÃ§Ã£o cria sessÃ£o autenticada  
**And** retorna estado autenticado em `/api/auth/me`

### Story 6.2: SessÃ£o segura e logout

As a usuÃ¡rio autenticado,  
I want encerrar sessÃ£o quando necessÃ¡rio,  
So that eu tenha controle sobre minha conta no dispositivo.

**Acceptance Criteria:**

**Given** que existe sessÃ£o ativa  
**When** o usuÃ¡rio faz logout  
**Then** a sessÃ£o Ã© invalidada no backend  
**And** a UI volta para estado nÃ£o autenticado

### Story 6.3: Dados por usuÃ¡rio autenticado

As a usuÃ¡rio autenticado,  
I want salvar settings e sessÃµes no meu prÃ³prio escopo,  
So that meus dados nÃ£o se misturem com outros usuÃ¡rios.

**Acceptance Criteria:**

**Given** que o usuÃ¡rio estÃ¡ autenticado  
**When** envia settings ou sessÃµes  
**Then** os endpoints usam o `user_id` da sessÃ£o  
**And** os resumos retornam somente dados daquele usuÃ¡rio

## Epic 7: Automated Testing and Quality Gates

Criar uma fase dedicada de testes automatizados para reduzir regressões e aumentar confiança nos fluxos críticos.

### Story 7.1: Base de testes do frontend (unit + integração)

As a equipe de produto,  
I want cobrir os fluxos principais do timer e auth no frontend com testes automatizados,  
So that regressões sejam detectadas antes de release.

**Acceptance Criteria:**

**Given** que o desenvolvedor altera componentes ou estado do timer  
**When** executa a suíte de frontend  
**Then** os cenários críticos (timer, settings, login/logout, hidratação local) são validados  
**And** falhas quebram o pipeline local/CI

### Story 7.2: Base de testes da API (integração)

As a equipe de produto,  
I want validar endpoints críticos da API com testes de integração,  
So that autenticação, settings e stats não regressem silenciosamente.

**Acceptance Criteria:**

**Given** que mudanças são feitas no backend  
**When** a suíte da API é executada  
**Then** endpoints de auth, settings, focus sessions e stats são testados  
**And** os testes cobrem cenários autenticado e anônimo

### Story 7.3: Pipeline de qualidade (test + typecheck + build)

As a equipe de engenharia,  
I want ter um comando/pipeline padrão de qualidade,  
So that cada entrega tenha validação consistente antes de merge/release.

**Acceptance Criteria:**

**Given** que há alterações no monorepo  
**When** o pipeline é executado  
**Then** roda typecheck, testes e build para web/api  
**And** a entrega é bloqueada em caso de falha
