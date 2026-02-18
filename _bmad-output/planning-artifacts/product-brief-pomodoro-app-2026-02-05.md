---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
date: 2026-02-05
author: Nicko
workflowStatus: complete
---

# Product Brief: pomodoro-app

## Executive Summary

**pomodoro-app** é uma ferramenta pessoal de foco e gestão de tempo que combina a simplicidade do método Pomodoro com personalidade forte, personalização completa e integração contextual através do Spotify. Diferencia-se por oferecer controle total ao usuário (filosofia "quase open source" - tudo disponível, sem limitações de planos pagos) e por estar arquiteturalmente preparada para evoluir para uma experiência de presença compartilhada anônima que cria a sensação de não estar sozinho na jornada de foco, inspirada no fenômeno "estude comigo" / "trabalhe comigo".

O MVP foca em construir uma base sólida superior ao Pomofocus, com personalidade forte, integração Spotify e micro configurações, sabendo que o próximo passo será adicionar a camada de presença compartilhada passiva durante breaks.

---

## Core Vision

### Problem Statement

O problema central é a falta de uma ferramenta de Pomodoro que combine simplicidade funcional com personalidade forte, gatilhos mentais que ajudem a entrar em estado de foco profundo, e controle total sem limitações artificiais. As soluções existentes são genéricas, carecem de personalidade, não utilizam elementos psicológicos para facilitar a transição para o workflow state, e muitas vezes limitam funcionalidades através de planos pagos.

Além disso, pessoas que trabalham e focam sentem falta de sentir que o mundo está concentrado também - daí o sucesso dos vídeos "estude comigo" / "trabalhe comigo" no YouTube, que criam um gatilho psicológico de presença compartilhada sem interação direta.

### Problem Impact

Quando não há uma ferramenta adequada, o resultado é procrastinação e dificuldade em manter o foco. O usuário precisa de algo que vá além de um timer simples — precisa de uma experiência que o ajude mentalmente a entrar no modo de trabalho profundo através de personalidade, gatilhos visuais e microinterações que criem um ritual de foco.

A falta de presença compartilhada também impacta a motivação - trabalhar sozinho pode ser isolante, mesmo quando você está focado. O fenômeno "estude comigo" demonstra que há uma necessidade psicológica real de sentir que outros estão na mesma jornada.

### Why Existing Solutions Fall Short

**Pomofocus** é a solução atual mais próxima, mas ainda falta:
- **Personalidade**: As ferramentas são muito genéricas e não criam uma conexão emocional ou identidade visual única
- **Gatilhos mentais**: Não utilizam elementos psicológicos e microinterações para facilitar a entrada em deep focus
- **Controle limitado**: Muitas ferramentas têm planos pagos que restringem funcionalidades essenciais, ou não oferecem micro configurações suficientes
- **Falta de integração contextual**: Não aproveitam elementos do ambiente (como música) que já ajudam no foco
- **Ausência de presença compartilhada**: Não criam a sensação de que você não está sozinho na jornada de foco

### Proposed Solution

Uma aplicação de Pomodoro simples e personalizável que:

**MVP (Base Sólida):**
- Permite iniciar pomodoros rapidamente com tempos pré-estabelecidos ou configuráveis
- Oferece personalização completa (tempos, tarefas, visual, cores, micro configurações)
- Mantém a simplicidade do método Pomodoro sem complexidade desnecessária
- Integra com Spotify para mostrar a música que está sendo ouvida no momento (similar ao Discord)
- Utiliza gatilhos mentais, personalidade forte e microinterações para ajudar a entrar em deep focus
- Dá controle total ao usuário, sem limitações de planos pagos (filosofia "quase open source")
- Arquitetura preparada para evoluir para presença compartilhada futura

**Evolução Futura (Pós-MVP):**
- Presença compartilhada anônima passiva durante breaks
- Feed sutil e calmo mostrando que outras pessoas estão focando (sem interação direta)
- Estatísticas agregadas anônimas que criam sensação de comunidade focada
- Gamificação sutil baseada em progresso pessoal (badges, streaks, estatísticas visuais)

### Key Differentiators

1. **Personalidade forte**: Não é apenas um timer, mas uma experiência projetada com identidade visual única, microinterações e gatilhos mentais que facilitam a entrada em estado de foco profundo

2. **Controle total (Filosofia "quase open source")**: Sem limitações de planos pagos — todas as funcionalidades disponíveis desde o início. Micro configurações que dão controle completo sobre todos os aspectos do app, como se fosse open source, mas sem a complexidade

3. **Integração com Spotify**: Aproveita a música como elemento contextual que já ajuda no foco, criando um ambiente imersivo e mostrando contexto emocional

4. **Arquitetura preparada para presença compartilhada**: Base sólida construída pensando na evolução futura para criar a sensação de "não estar sozinho" na jornada de foco, inspirada no fenômeno "estude comigo" / "trabalhe comigo"

5. **Simplicidade com poder**: Mantém a essência do Pomodoro enquanto oferece personalização completa quando necessário

6. **Foco em satisfação pessoal primeiro**: Desenvolvido por quem entende a dor, garantindo que resolva problemas reais antes de pensar em mercado

---

## Target Users

### Primary Users

#### Persona 1: Nicko - Profissional de TI / Trabalhador Remoto

**Contexto e Background:**
- Trabalha remotamente em arquitetura de soluções de TI
- Desenvolve projetos pessoais paralelamente
- Luta com procrastinação e falta de foco, especialmente durante tarefas complexas de arquitetura
- Busca ativamente ferramentas que ajudem a manter o foco

**Experiência do Problema:**
- **Interrupções**: Principal desafio durante arquitetura de soluções - perde o fluxo de pensamento facilmente
- **Distrações**: Redes sociais, pensamentos dispersos e ambiente são os maiores obstáculos, nessa ordem
- **Falta de gatilhos mentais**: Precisa de elementos que o ajudem a entrar em "workflow state" - café, silêncio e preparação mental são seus rituais atuais
- **Frustração atual**: Pomofocus funciona, mas falta personalidade e gatilhos mentais que realmente facilitem a transição para foco profundo

**Visão de Sucesso:**
- Conseguir usar a ferramenta por um dia inteiro sem abandonar
- Sensação de controle sobre seu próprio foco e produtividade
- Entrar em "foco absoluto e 0 distrações" de forma consistente
- Ter uma ferramenta que realmente entenda suas necessidades de personalização (tempos diferentes conforme a complexidade da tarefa)

**Gatilhos Mentais Desejados (explorando possibilidades criativas):**
- **Visual**: Transição suave de cores ao iniciar pomodoro (ex: de tons neutros para cores mais vibrantes que indicam "modo foco"), animação sutil que cria sensação de "entrada em um espaço de trabalho", contador visual que respira com o tempo restante
- **Sonoro**: Opção de som ambiente personalizado ao iniciar (ex: "click" satisfatório, ou som de ambiente de café, ou silêncio total), notificações suaves que não quebram o foco
- **Ritual**: Sequência de preparação antes de iniciar (ex: tela de "preparação mental" com respiração guiada opcional, checklist rápido de "ambiente pronto"), transição visual que marca o início do foco como um ritual
- **Contextual**: Integração com Spotify que mostra música atual e sugere playlists de foco, ambiente visual que muda baseado na música (ex: cores que combinam com o gênero musical)

**Necessidades Específicas:**
- Micro configurações para diferentes tipos de tarefa (25min para tarefas simples, 50min para arquitetura complexa, 2h para deep work quando possível)
- Controle total sobre todos os aspectos visuais e funcionais
- Integração Spotify para contexto emocional
- Personalidade forte que crie conexão emocional com a ferramenta

#### Persona 2: Estudantes Universitários

**Contexto e Background:**
- Estudam para provas, trabalhos e projetos acadêmicos
- Precisam manter foco por longos períodos de estudo
- Muitos estudam em casa ou bibliotecas, precisando de estrutura para evitar distrações

**Experiência do Problema:**
- Dificuldade em manter foco durante sessões longas de estudo
- Procrastinação antes de começar a estudar
- Necessidade de pausas estruturadas para evitar burnout
- Diferentes tempos de foco (alguns conseguem 2h, outros apenas 25min)

**Visão de Sucesso:**
- Estrutura clara para sessões de estudo
- Sensação de progresso e controle sobre o tempo
- Ferramenta que se adapta ao seu ritmo pessoal de foco

**Necessidades Específicas:**
- Flexibilidade de tempos (não apenas 25min padrão)
- Personalização para diferentes matérias/tipos de estudo
- Estatísticas que mostrem progresso ao longo do tempo

#### Persona 3: Freelancers e Profissionais Remotos

**Contexto e Background:**
- Trabalham de casa ou em espaços compartilhados
- Precisam gerenciar múltiplos projetos e clientes
- Lutam com limites entre trabalho e vida pessoal

**Experiência do Problema:**
- Dificuldade em manter foco com interrupções domésticas
- Necessidade de estruturar o dia de trabalho
- Diferentes projetos requerem diferentes níveis de foco

**Visão de Sucesso:**
- Estrutura clara para o dia de trabalho
- Separação mental entre trabalho e descanso
- Ferramenta que se adapta a diferentes tipos de projeto

**Necessidades Específicas:**
- Múltiplas configurações de pomodoro para diferentes projetos
- Integração com ferramentas de trabalho
- Estatísticas que ajudem a entender padrões de produtividade

### Secondary Users

N/A - O produto é focado em uso pessoal individual. Não há usuários secundários (admin, suporte, etc.) no escopo do MVP.

### User Journey

#### Descoberta
- Usuário busca ativamente por ferramentas de Pomodoro (pesquisa online, recomendações, redes sociais)
- Encontra pomodoro-app através de busca ou recomendação
- Interesse despertado por: personalidade forte, integração Spotify, controle total sem limitações

#### Onboarding
- Primeira experiência: interface com personalidade forte que cria conexão imediata
- Configuração inicial guiada mas não intrusiva: escolha de tempos padrão, preferências visuais básicas
- Opção de conectar Spotify desde o início (mas não obrigatório)
- Demonstração sutil dos gatilhos mentais (ex: animação ao iniciar primeiro pomodoro)

#### Core Usage (Dia a Dia)
- **Início do dia**: Abre o app, configura pomodoros para o dia (diferentes tempos conforme tarefas)
- **Antes de focar**: Ritual de preparação (opcional) - respiração guiada, checklist de ambiente, preparação mental
- **Durante pomodoro**: 
  - Visual imersivo que minimiza distrações
  - Integração Spotify mostra música atual (se conectado)
  - Gatilhos visuais mantêm o foco (cores, animações sutis)
  - Notificações bloqueadas ou minimizadas
- **Break**: Transição suave para descanso, estatísticas rápidas do progresso
- **Múltiplos pomodoros**: Sensação de progresso e controle aumentando ao longo do dia

#### Success Moment ("Aha!")
- **Momento de realização**: Quando consegue usar por um dia inteiro sem abandonar
- **Sensação**: Controle sobre próprio foco e produtividade
- **Indicadores**: Estatísticas mostram progresso consistente, sensação de "workflow state" mais fácil de alcançar
- **Validação**: A ferramenta realmente ajuda a entrar em foco absoluto com 0 distrações

#### Long-term (Rotina Estabelecida)
- **Integração na rotina**: App se torna parte essencial de momentos de foco absoluto
- **Personalização contínua**: Usuário ajusta configurações conforme descobre o que funciona melhor
- **Dependência positiva**: Ferramenta se torna ritual de foco - abrir o app já cria sensação de "é hora de focar"
- **Evolução**: Quando presença compartilhada for adicionada, usuário descobre novo valor através de sensação de não estar sozinho

---

## Success Metrics

### User Success Metrics

**Outcomes Almejados:**
- **Entrar em foco profundo**: Usuários conseguem alcançar estado de "workflow state" mais facilmente
- **Reduzir procrastinação**: Diminuição no tempo entre intenção de focar e início efetivo do pomodoro
- **Manter foco por períodos maiores**: Aumento progressivo na capacidade de manter foco durante pomodoros

**Indicadores de Sucesso do Usuário:**
- **Uso consistente**: Usuários completam 3-4 pomodoros por dia (mínimo de sucesso)
- **Controle percebido**: Usuários utilizam micro configurações e personalização (indicador de que sentem controle)
- **Satisfação**: Feedback qualitativo dos usuários indicando que a ferramenta está resolvendo seus problemas
- **Comportamento de valor**: Usuários completam múltiplos pomodoros consecutivos, indicando que estão obtendo valor real

**Métricas de Engajamento (Estilo Duolingo):**
- **Usuários Ativos Diários (DAU)**: Número de usuários únicos que abrem o app diariamente
- **Pomodoros Completos por Semana**: Média de pomodoros completados por usuário por semana
- **Streaks (Sequências)**: Dias consecutivos de uso - indicador de hábito estabelecido
- **Retenção**: 
  - Retenção de 1 dia: % de usuários que retornam no dia seguinte
  - Retenção de 7 dias: % de usuários que ainda usam após uma semana
  - Retenção de 30 dias: % de usuários que ainda usam após um mês
- **Taxa de Completação**: % de pomodoros iniciados que são completados (vs. abandonados)
- **Tempo até Primeiro Pomodoro**: Tempo entre abrir o app e iniciar o primeiro pomodoro (quanto menor, melhor)

**Métricas de Qualidade:**
- **Insights dos Usuários**: Feedback qualitativo coletado através de pesquisas, reviews e interações
- **Uso de Personalização**: % de usuários que utilizam micro configurações (indica que estão encontrando valor)
- **Integração Spotify**: % de usuários que conectam Spotify (indica uso do diferencial)
- **Abandono de Pomodoros**: Taxa de pomodoros iniciados mas não completados (quanto menor, melhor)

### Business Objectives

**Objetivo de 3 Meses (MVP Completo):**
- **Ferramenta completa para workflow principal**: Todas as funcionalidades essenciais implementadas e funcionais
  - Pomodoro funcional com personalização básica
  - Integração Spotify operacional
  - Micro configurações disponíveis
  - Personalidade forte presente no design e microinterações
- **Base sólida estabelecida**: Arquitetura preparada para evoluir para presença compartilhada futura
- **Satisfação pessoal**: Ferramenta resolve problemas reais do criador e usuários iniciais

**Objetivo de 12 Meses (Maturidade):**
- **Maturidade muito maior**: Produto evoluído com todas as funcionalidades planejadas
  - Presença compartilhada anônima passiva implementada
  - Gamificação sutil baseada em progresso pessoal
  - Feed durante breaks com estatísticas agregadas
  - Badges, streaks e estatísticas visuais
- **Potencial de mercado**: Produto validado e pronto para crescimento (se houver interesse)
- **Comunidade estabelecida**: Base de usuários engajados que encontram valor real na ferramenta

**Filosofia de Métricas:**
- **Satisfação pessoal primeiro**: Métricas focam em resolver problemas reais antes de pensar em mercado
- **Uso como métrica principal**: Engajamento e uso são os indicadores primários de sucesso
- **Insights qualitativos**: Feedback dos usuários é tão importante quanto métricas quantitativas

### Key Performance Indicators

**KPIs Principais (Estilo Duolingo):**

1. **Engajamento Diário**
   - **Meta**: 80% dos usuários ativos completam pelo menos 3 pomodoros por dia
   - **Medição**: Pomodoros completos / Usuários ativos diários
   - **Frequência**: Diária

2. **Retenção de 7 Dias**
   - **Meta**: > 60% dos novos usuários ainda usam após 7 dias
   - **Medição**: Usuários que retornam no dia 7 / Usuários novos
   - **Frequência**: Semanal

3. **Streaks Médios**
   - **Meta**: Streak médio de 5+ dias consecutivos
   - **Medição**: Média de dias consecutivos de uso por usuário
   - **Frequência**: Semanal

4. **Taxa de Completação de Pomodoros**
   - **Meta**: > 85% dos pomodoros iniciados são completados
   - **Medição**: Pomodoros completos / Pomodoros iniciados
   - **Frequência**: Diária

5. **Pomodoros Completos por Semana**
   - **Meta**: Média de 15+ pomodoros completos por usuário ativo por semana
   - **Medição**: Total de pomodoros completos / Usuários ativos semanais
   - **Frequência**: Semanal

6. **Uso de Personalização**
   - **Meta**: > 70% dos usuários utilizam pelo menos uma micro configuração
   - **Medição**: Usuários que personalizam / Total de usuários ativos
   - **Frequência**: Mensal

7. **Integração Spotify**
   - **Meta**: > 50% dos usuários conectam Spotify
   - **Medição**: Usuários com Spotify conectado / Total de usuários
   - **Frequência**: Mensal

**Indicadores de Liderança (Leading Indicators):**
- **Tempo até Primeiro Pomodoro**: < 30 segundos (indica facilidade de uso)
- **Taxa de Abandono no Primeiro Dia**: < 20% (indica onboarding eficaz)
- **Uso de Gatilhos Mentais**: % de usuários que utilizam recursos de preparação mental

**Métricas de Qualidade (Qualitative):**
- **Satisfação do Usuário**: Coletada através de pesquisas, reviews e feedback direto
- **Insights Qualitativos**: Entendimento profundo de como usuários estão usando a ferramenta e que valor estão obtendo
- **Momentos "Aha!"**: Histórias de usuários que conseguiram usar por um dia inteiro ou alcançaram foco profundo

### Strategic Alignment

**Conexão com Visão do Produto:**
- Métricas de engajamento validam que a personalidade forte e gatilhos mentais estão funcionando
- Uso de personalização valida que o controle total está sendo valorizado
- Integração Spotify valida que o diferencial está sendo utilizado
- Retenção e streaks validam que a ferramenta está se tornando parte da rotina

**Conexão com Sucesso do Usuário:**
- Pomodoros completos por dia conectam diretamente com "usar por um dia inteiro"
- Retenção conecta com "sensação de controle" e "satisfação"
- Streaks conectam com "entrar em workflow state mais facilmente"
- Taxa de completação conecta com "manter foco por períodos maiores"

**Foco em Valor Real:**
- Todas as métricas medem comportamentos que indicam valor real para o usuário
- Evita métricas de vaidade que não impulsionam decisões
- Combina métricas quantitativas (uso, retenção) com qualitativas (insights, satisfação)

---

## MVP Scope

### Core Features

**Funcionalidade Central:**
- **Timer de Pomodoro Funcional**: Sistema completo de cronometragem com início, pausa, reset e notificações de conclusão
- **Configuração do Timer**: Usuário pode configurar duração do pomodoro, duração dos breaks (curto e longo), e número de pomodoros antes do break longo
- **Ciclo Completo**: Suporte completo ao método Pomodoro tradicional (25min trabalho + 5min break, com break longo a cada 4 pomodoros)

**Diferenciação e Personalidade:**
- **Personalidade Forte**: Design único com identidade visual consistente, microinterações que criam conexão emocional, e experiência que vai além de um timer simples
- **Gatilhos Mentais**: Elementos psicológicos que facilitam entrada em workflow state:
  - Transições visuais ao iniciar pomodoro (mudança de cores, animações sutis)
  - Sons ambiente opcionais (ou silêncio total) para criar ritual de foco
  - Sequência de preparação opcional (respiração guiada, checklist de ambiente)
  - Contador visual que "respira" com o tempo restante
- **Integração Spotify**: 
  - Conexão com conta Spotify do usuário
  - Exibição da música atual que está sendo ouvida (similar ao Discord)
  - Contexto emocional através da música

**Essenciais para Completude:**
- Configuração do timer do pomodoro (duração personalizável)
- Interface intuitiva que não requer tutorial extenso
- Estatísticas básicas de uso (pomodoros completos, tempo total focado)
- Persistência de configurações e dados do usuário

**Arquitetura Preparada:**
- Estrutura de código que permite adicionar presença compartilhada futura sem refatoração massiva
- Separação entre lógica pessoal e futura camada social
- Design que sugere "você não está sozinho" mesmo sem dados reais ainda (através de elementos visuais)

### Out of Scope for MVP

**Funcionalidades Deferidas para Versão 2.0:**
- **Presença Compartilhada**: Feed durante breaks mostrando que outras pessoas estão focando (será adicionado após validação do MVP)
- **Gamificação**: Badges, streaks visuais, competições, e elementos de gamificação (será adicionado após estabelecer base sólida)
- **Personalização Avançada da UI**: Customização profunda de cores, temas, layouts avançados (versão básica de personalização estará no MVP, versão avançada para depois)

**Funcionalidades Fora do Escopo Atual:**
- **Grupos Fechados de Pomodoro**: Funcionalidade para equipes ou grupos de estudo (não é foco agora, pode ser considerado no futuro distante)
- **B2B / Enterprise**: Versão para empresas ou equipes (não é foco do produto atual, que é pessoal primeiro)

**Racional para Deferir:**
- MVP foca em resolver problema pessoal primeiro (satisfação pessoal antes de mercado)
- Presença compartilhada e gamificação requerem infraestrutura adicional e validação de que o core funciona
- Personalização avançada pode ser adicionada incrementalmente após validar que personalização básica é valorizada
- Grupos e B2B são mercados diferentes que requerem repensar o produto completamente

### MVP Success Criteria

**Critérios de Sucesso Quantitativos:**
- **Engajamento**: Usuários completam 3-4 pomodoros por dia (mínimo de sucesso)
- **Retenção**: Retenção de 7 dias > 60% (indica que usuários estão encontrando valor)
- **Uso Consistente**: Usuários retornam diariamente e completam múltiplos pomodoros

**Critérios de Sucesso Qualitativos:**
- **Feedback dos Usuários**: Usuários confirmam que a ferramenta ajudou ou não ajudou a resolver seus problemas de foco
- **Momentos "Aha!"**: Histórias de usuários que conseguiram usar por um dia inteiro ou alcançaram foco profundo
- **Satisfação**: Feedback positivo sobre personalidade forte, gatilhos mentais e integração Spotify

**Gates de Decisão para Pós-MVP:**
- Se métricas de engajamento e retenção forem atingidas → Proceed com presença compartilhada e gamificação
- Se feedback qualitativo for positivo → Investir em personalização avançada da UI
- Se MVP validar necessidade de grupos → Considerar funcionalidade de grupos fechados no futuro distante

**Validação de Abordagem:**
- Usuários conseguem configurar e usar o timer facilmente
- Integração Spotify funciona e é valorizada pelos usuários
- Gatilhos mentais realmente ajudam a entrar em workflow state
- Personalidade forte cria conexão emocional com a ferramenta

### Future Vision

**Visão de 2-3 Anos (Se MVP for Bem-Sucedido):**

**Evolução do Produto:**
- **Presença Compartilhada**: Feed durante breaks mostrando que outras pessoas estão focando, criando sensação de "não estar sozinho" na jornada de foco
- **Gamificação Completa**: Badges, streaks visuais, estatísticas de progresso, descobertas de música através de outros usuários focando
- **Comunidade Estabelecida**: Base de usuários engajados que encontram valor real, com potencial para evoluir para comunidade de pessoas focadas

**Expansão de Mercado:**
- Produto validado e pronto para crescimento (se houver interesse de mercado)
- Potencial para grupos fechados se houver demanda validada
- Consideração de modelos B2B se mercado validar necessidade

**Capabilities Avançadas:**
- Personalização avançada da UI baseada em feedback dos usuários
- Integrações adicionais além do Spotify (se fizer sentido)
- Analytics avançados para entender padrões de produtividade pessoal
- Recursos de descoberta de música e playlists de foco através da comunidade

**Filosofia Mantida:**
- Satisfação pessoal continua sendo prioridade
- Controle total do usuário mantido (filosofia "quase open source")
- Personalidade forte e gatilhos mentais continuam sendo diferenciais
- Simplicidade com poder - não adicionar complexidade desnecessária

**Evolução Incremental:**
- Cada nova funcionalidade adicionada após validar que core funciona
- Presença compartilhada adicionada quando MVP validar necessidade
- Gamificação adicionada quando base de usuários estiver estabelecida
- Expansão de mercado apenas se houver demanda validada
