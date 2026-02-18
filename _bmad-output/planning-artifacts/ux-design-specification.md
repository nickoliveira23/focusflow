---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience', 'step-04-emotional-response', 'step-05-inspiration', 'step-06-design-system', 'step-07-defining-experience', 'step-08-visual-foundation', 'step-09-design-directions', 'step-10-user-journeys', 'step-11-component-strategy', 'step-12-ux-patterns', 'step-13-responsive-accessibility', 'step-14-complete']
inputDocuments: ['product-brief-pomodoro-app-2026-02-05.md', 'prd.md', 'architecture.md', 'epics.md']
workflowType: 'ux-design'
date: 2026-02-17
project_name: pomodoro-app
author: Nicko
---

# UX Design Specification pomodoro-app

**Author:** Nicko  
**Date:** 2026-02-17

## 1. UX Goals

- Reduzir fricção entre abrir o app e iniciar foco (< 30s).
- Reforçar sensação de controle com micro-configurações claras.
- Criar experiência imersiva sem sacrificar clareza operacional.

## 2. Core Experience Principles

- Simplicidade primeiro: timer sempre protagonista na tela.
- Feedback imediato: cada ação responde com estado visual claro.
- Ritual opcional: ajuda a entrar em foco, nunca bloqueia fluxo.
- Quiet UI: durante foco, reduzir ruído e distração visual.

## 3. Emotional Design Direction

- Personalidade: firme, focada, energética, sem excesso de gamificação no MVP.
- Durante foco: tom visual concentrado, contraste alto, interface minimalista.
- Durante pausa: alívio visual e microcelebração discreta.

## 4. UX Scope (MVP)

- Timer com start/pause/resume/reset.
- Configuração de duração de foco, pausa curta/longa e ciclo.
- Estatísticas básicas (hoje/semana).
- Integração Spotify opcional com now playing.
- Ritual de preparação opcional.

## 5. Information Architecture

- `Focus` (home): timer + controles + now playing + ritual.
- `Settings`: parâmetros do ciclo e personalização.
- `Stats`: progresso diário/semanal.
- `Connection`: estado Spotify e ações conectar/desconectar.

## 6. Key User Flows

### Flow A: Primeiro pomodoro

1. Usuário abre app.
2. Vê timer pronto com valor padrão.
3. (Opcional) ativa ritual rápido.
4. Inicia sessão.
5. Recebe transição visual para modo foco.

### Flow B: Ajuste rápido de configuração

1. Usuário abre Settings.
2. Ajusta tempos e ciclo.
3. Salva.
4. Retorna ao Focus com mudanças aplicadas.

### Flow C: Spotify opcional

1. Usuário acessa Connection.
2. Clica em conectar Spotify.
3. Conclui OAuth.
4. Retorna ao app e now playing aparece no Focus.

## 7. Screen Blueprint

### Focus Screen (primária)

- Header compacto com estado da sessão.
- Timer central grande.
- Controles principais logo abaixo.
- Faixa secundária: progresso do dia + now playing.

### Settings Screen

- Blocos por tema: duração, ciclo, ritual, aparência.
- Controles deslizantes/campos numéricos com validação imediata.

### Stats Screen

- KPIs: pomodoros completos, tempo focado, sequência.
- Resumo por período (hoje/7 dias).

## 8. Interaction Patterns

- Botão principal contextual: Start -> Pause -> Resume.
- Reset com confirmação leve para evitar perda acidental.
- Transições foco/pausa de 200ms-400ms, sem bloquear interação.
- Teclas de atalho (MVP básico): `Space` start/pause, `R` reset.

## 9. Visual Foundation (MVP)

- Tipografia legível e forte para o timer.
- Escala de contraste alta para estado foco.
- Cores por estado:
  - Foco: neutro escuro + acento quente.
  - Pausa curta: acento frio leve.
  - Pausa longa: variação relaxada de baixa excitação.

## 10. Component Strategy

- `TimerDisplay`
- `SessionControls`
- `CycleProgress`
- `RitualPanel`
- `NowPlayingCard`
- `SettingsForm`
- `StatsSummaryCards`

Cada componente com variações por estado (focus/break/paused) e contratos de props claros.

## 11. UX Patterns and Error States

- Offline:
  - Timer continua funcional.
  - Mensagem discreta de “sem conexão”, sem interromper sessão.
- Spotify indisponível:
  - Card mostra estado degradado e ação de retry.
- Falha de persistência:
  - Toast de erro + tentativa automática.

## 12. Responsive and Accessibility

### Responsive

- Desktop-first com adaptação para tablet/mobile.
- Em mobile, timer e controles ficam sempre acima da dobra.
- Painéis secundários podem colapsar em abas.

### Accessibility (MVP)

- Navegação por teclado em todos os controles principais.
- Labels e roles ARIA em botões e timer.
- Contraste mínimo AA para texto funcional.
- Não depender apenas de cor para estados.

## 13. Handoff Constraints for Engineering

- Timer visual nunca deve depender de polling de API.
- Mudanças visuais não podem reduzir legibilidade do tempo.
- Ritual e Spotify são opcionais; fluxo principal funciona sem ambos.
- UX deve permanecer consistente com latência baixa (< 100ms interação).

## 14. Validation Plan

- Teste de usabilidade com foco em “tempo até primeiro pomodoro”.
- Verificação de clareza das transições foco/pausa.
- Validação de compreensão das configurações por usuários novos.
- Checagem de acessibilidade básica (teclado + contraste + leitura de rótulos).
