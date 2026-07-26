# Product Experience Specification — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-PXD-001
**Version:** 1.0
**Last Updated:** 2026-07-25
**Author Role:** Lead Product Designer & Principal UX Architect, Honeywell Process Solutions
**Audience:** Frontend Engineering Team, UX Review Board, Product Management
**Status:** Specification — Ready for Engineering Handoff

> [!IMPORTANT]
> This document specifies the **complete product experience** for the GCI Platform. It contains no application code. It is intended as the definitive reference for a frontend engineering team to implement every screen, interaction, and visual element.

---

# TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Design System](#2-design-system)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Screen Specifications](#4-screen-specifications)
   - 4.1 Login & Authentication
   - 4.2 Overview Dashboard
   - 4.3 Live Grade Change (Primary Operational Screen)
   - 4.4 Prediction Center
   - 4.5 Recommendation Center
   - 4.6 Digital Twin Simulator
   - 4.7 Historical Analysis
   - 4.8 Similarity Search
   - 4.9 Machine Detail
   - 4.10 Operator Feedback Review
   - 4.11 Alerts & Alarms
   - 4.12 Reports
   - 4.13 Model Health & Admin
   - 4.14 Settings
   - 4.15 Audit Log
5. [Chart Specifications](#5-chart-specifications)
6. [User Journeys](#6-user-journeys)
7. [State Specifications](#7-state-specifications)
8. [Screen Prioritization](#8-screen-prioritization)

---

# 1. Design Philosophy

## 1.1 Core Principles

| # | Principle | Rationale |
|---|---|---|
| P1 | **Glanceability First** | Control room operators monitor 20+ parameters simultaneously. Every element must communicate its state within 1 second of visual contact. Color, size, and position — not labels — convey urgency. |
| P2 | **Trust Through Transparency** | Operators will not follow AI advice they don't understand. Every prediction shows its evidence. Every recommendation shows its reasoning. Confidence is always visible. |
| P3 | **Minimal Cognitive Load** | During a grade change, operators are under time pressure. The UI surfaces exactly what's needed for the current phase. Information not relevant to the current context is suppressed, not deleted. |
| P4 | **Progressive Disclosure** | Operators see a 2-sentence summary. Engineers see full SHAP waterfalls, DTW alignments, and simulation parameters. Both work from the same screen — detail expands on demand. |
| P5 | **Zero-Ambiguity Risk Communication** | A risk indicator must never require interpretation. GREEN/YELLOW/ORANGE/RED with text labels. Never rely on color alone (accessibility). Never show a number without context. |
| P6 | **Muscle Memory** | Action buttons (ACCEPT/REJECT) are always in the same position, same size, same color. Operators build reflexive trust in the interface geometry. |
| P7 | **Operator Sovereignty** | The AI advises. The operator decides. The interface never auto-executes. Every recommendation requires explicit human action with a physical click. |

## 1.2 Design Context: Control Room Environment

| Factor | Constraint | Design Response |
|---|---|---|
| **Viewing Distance** | 2–4 meters from display (55" wall-mounted panels) | Minimum 16px body text; 28px+ for status indicators; 48px+ for KPI values |
| **Ambient Light** | Low-light control rooms with multiple monitors | Dark theme; high-contrast text; no bright white surfaces |
| **Multitasking** | Operator monitors DCS, QCS, GCI simultaneously | GCI must be scannable in peripheral vision; pulsing animations for alerts |
| **Shift Duration** | 8–12 hour shifts | Reduce eye strain: dark background, muted secondary text, no visual noise |
| **Gloves** | Some operators wear gloves near machinery | Touch targets minimum 44×44px; generous button padding |
| **Noise** | Mill floor is loud | No audio-only alerts; all alerts are visual with optional audio |

## 1.3 Comparison to Honeywell Forge

| Honeywell Forge Pattern | GCI Adoption | GCI Extension |
|---|---|---|
| Dark canvas with card-based layout | ✅ Adopted | Cards are context-aware: expand during active transitions |
| Left sidebar navigation | ✅ Adopted | Sidebar collapses to icon-only mode for more chart space |
| Status indicator dots | ✅ Adopted | Extended with pulsing animation for real-time data feed |
| KPI cards in header row | ✅ Adopted | Cards show AI-specific metrics: confidence, stabilization time |
| Trend charts with overlays | ✅ Adopted | Extended with prediction trajectories and confidence bands |
| Alert banner | ✅ Adopted | Extended with AI-generated advisory explanations |

---

# 2. Design System

## 2.1 Color Palette

### Semantic Colors

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `--bg-primary` | `#0D1117` | 13, 17, 23 | Page background; deepest layer |
| `--bg-surface` | `#161B22` | 22, 27, 34 | Card backgrounds; sidebar; panels |
| `--bg-elevated` | `#1C2128` | 28, 33, 40 | Elevated cards; modal backgrounds; hover states |
| `--bg-overlay` | `#21262D` | 33, 38, 45 | Dropdown menus; tooltip backgrounds; popover surfaces |
| `--border-default` | `rgba(255,255,255,0.08)` | — | Card borders; dividers; separators |
| `--border-active` | `rgba(255,255,255,0.16)` | — | Active card borders; focused input borders |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#E6EDF3` | Body text; labels; headings |
| `--text-secondary` | `#8B949E` | Descriptions; timestamps; helper text |
| `--text-muted` | `#484F58` | Disabled text; placeholder text; de-emphasized content |
| `--text-inverse` | `#0D1117` | Text on bright backgrounds (buttons, badges) |

### Status Colors

| Token | Hex | Usage | Accessible Pair |
|---|---|---|---|
| `--status-safe` | `#3FB950` | SAFE risk level; successful transitions; on-spec | ✅ 5.2:1 on `--bg-surface` |
| `--status-warning` | `#D29922` | WARNING risk level; medium confidence; approaching limit | ✅ 4.8:1 on `--bg-surface` |
| `--status-danger` | `#F85149` | BREACH risk level; alarms; off-spec; failures | ✅ 5.6:1 on `--bg-surface` |
| `--status-info` | `#58A6FF` | Informational notices; links; active states | ✅ 5.4:1 on `--bg-surface` |
| `--status-insufficient` | `#F0883E` | LOW/INSUFFICIENT confidence; caution indicators | ✅ 5.1:1 on `--bg-surface` |

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--honeywell-blue` | `#2B7CD4` | Primary accent; active nav items; primary buttons; header logo accent |
| `--honeywell-blue-hover` | `#3A8DE0` | Hover state for primary interactive elements |
| `--honeywell-blue-muted` | `rgba(43,124,212,0.15)` | Active nav item background; selected state fill |

### Chart Colors (Data Series)

| Token | Hex | Purpose |
|---|---|---|
| `--chart-live` | `#58A6FF` | Live/actual process data line |
| `--chart-predicted` | `#BC8CF2` | Predicted trajectory (dashed line) |
| `--chart-target` | `#3FB950` | Target value reference line |
| `--chart-limit` | `#F85149` | ±2.5% limit lines (dashed) |
| `--chart-historical` | `#8B949E` | Historical overlay data |
| `--chart-simulation` | `#F0883E` | Digital Twin simulated trajectory |
| `--chart-confidence` | `rgba(188,140,242,0.12)` | Confidence band fill (semi-transparent) |
| `--chart-grid` | `rgba(255,255,255,0.06)` | Chart gridlines |

## 2.2 Typography

| Element | Font | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **Page Title** | Inter | 700 (Bold) | 24px | 32px | -0.02em |
| **Section Header** | Inter | 600 (Semi-Bold) | 18px | 24px | -0.01em |
| **Card Title** | Inter | 600 (Semi-Bold) | 14px | 20px | 0 |
| **Body** | Inter | 400 (Regular) | 14px | 20px | 0 |
| **KPI Value** | Inter | 700 (Bold) | 48px | 56px | -0.02em |
| **KPI Label** | Inter | 500 (Medium) | 12px | 16px | 0.04em (uppercase) |
| **Status Badge** | Inter | 600 (Semi-Bold) | 11px | 16px | 0.06em (uppercase) |
| **Timestamp** | JetBrains Mono | 400 (Regular) | 12px | 16px | 0 |
| **Data Value** | JetBrains Mono | 500 (Medium) | 14px | 20px | 0 |
| **Chart Axis** | Inter | 400 (Regular) | 11px | 14px | 0 |
| **Tooltip** | Inter | 400 (Regular) | 12px | 16px | 0 |
| **Button** | Inter | 600 (Semi-Bold) | 14px | 20px | 0.02em |
| **Explanation Text** | Inter | 400 (Regular) | 15px | 24px | 0.01em |

**Why Inter?** — Designed for UI legibility at small sizes; excellent numeral disambiguation (1, l, I are distinct); variable font enables smooth weight transitions; widely deployed in enterprise software.

**Why JetBrains Mono for data?** — Monospaced digits align vertically in tables; decimal points align naturally; clear distinction between 0/O and 1/l.

## 2.3 Spacing System

Base unit: **4px**

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Tight spacing: badge padding, icon-to-text gap |
| `--space-sm` | 8px | Compact spacing: between status items, inner card padding |
| `--space-md` | 16px | Standard spacing: card padding, between form elements |
| `--space-lg` | 24px | Section spacing: between card groups, panel margins |
| `--space-xl` | 32px | Major section separation; page margins |
| `--space-2xl` | 48px | Top-level section breaks |

### Card Dimensions

| Component | Padding | Border Radius | Border | Shadow |
|---|---|---|---|---|
| **KPI Card** | 16px 20px | 8px | 1px `--border-default` | `0 1px 3px rgba(0,0,0,0.3)` |
| **Panel Card** | 20px 24px | 8px | 1px `--border-default` | `0 2px 8px rgba(0,0,0,0.4)` |
| **Modal** | 24px 32px | 12px | 1px `--border-active` | `0 8px 32px rgba(0,0,0,0.6)` |
| **Tooltip** | 8px 12px | 6px | 1px `--border-default` | `0 4px 16px rgba(0,0,0,0.5)` |

## 2.4 Iconography

| Category | Icon Set | Examples |
|---|---|---|
| **Navigation** | Lucide Icons (outlined, 20px) | Home, BarChart3, History, Search, Settings, Shield, Bell |
| **Status** | Custom SVG (filled, 12px) | Pulsing dot (live), Static dot (stale), Triangle (warning) |
| **Actions** | Lucide Icons (outlined, 18px) | Check (accept), X (reject), Play (simulate), Download (export) |
| **Process Variables** | Custom SVG (16px) | Thermometer (steam), Droplet (moisture), Gauge (pressure), Ruler (caliper) |

**Icon color** inherits `--text-secondary` by default; `--text-primary` on hover; status colors for status icons.

## 2.5 Animations & Transitions

| Animation | Duration | Easing | Trigger | Purpose |
|---|---|---|---|---|
| **Live Pulse** | 2000ms infinite | ease-in-out | Data feed active | Pulsing green dot indicates real-time data flow; operator sees the system is alive |
| **Card State Change** | 200ms | ease-out | Risk level change | Background color and border transition smoothly when risk state changes |
| **Panel Expand** | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Click "View Detail" | Panel smoothly expands to reveal engineering-level detail |
| **Chart Draw** | 500ms | ease-out | Initial load / new data | Line chart draws from left to right on first render |
| **Badge Flash** | 400ms × 3 | ease-in-out | New alert or risk escalation | Badge background flashes 3 times to draw attention, then settles |
| **Hover Lift** | 150ms | ease-out | Mouse hover on card | Card lifts 2px with enhanced shadow; signals interactivity |
| **Skeleton Shimmer** | 1500ms infinite | linear | Loading state | Light shimmer across placeholder cards; indicates content is loading |
| **Fade In** | 200ms | ease-out | New content appears | Prevents jarring content pops; smooth appearance |
| **Notification Slide** | 300ms | ease-out | Toast notification | Slides in from top-right; auto-dismisses after 5 seconds |

**Why these specific durations?** — Under 200ms feels instant (status changes must feel immediate). 300ms provides visible but unobtrusive transitions. Infinite loops (pulse, shimmer) provide ambient status without distraction.

## 2.6 Accessibility

| Requirement | Implementation |
|---|---|
| **WCAG 2.1 AA** | All text meets 4.5:1 contrast ratio against its background |
| **Color Independence** | Risk states use color + icon + text label (never color alone) |
| **Keyboard Navigation** | All interactive elements reachable via Tab; Enter/Space to activate; Escape to close modals |
| **Focus Indicators** | 2px `--honeywell-blue` outline with 2px offset on all focusable elements |
| **Screen Reader** | ARIA labels on all charts, status indicators, and dynamic content regions |
| **Reduced Motion** | `prefers-reduced-motion` media query disables all animations except live pulse |
| **Font Scaling** | Layout adapts to 200% browser zoom without horizontal scrolling |

## 2.7 Responsive Behavior

| Viewport | Layout | Use Case |
|---|---|---|
| **≥ 1920px** (Primary) | Full layout: sidebar + 3-column content area | Control room 55" displays |
| **1440–1919px** | Full layout with narrower cards | Engineering workstation 27" monitors |
| **1024–1439px** | Collapsed sidebar (icon-only) + 2-column content | Laptop during field visits |
| **< 1024px** | Not supported — display "Use desktop display" message | This is a control room product, not a mobile app |

**Why no mobile support?** — This is an industrial control product operated from fixed workstations. Mobile-responsive design adds complexity without serving the control room use case. A separate mobile notification app (Phase 3) would serve field operators with a purpose-built UX.

---

# 3. Navigation Architecture

## 3.1 Application Shell

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─ TOP BAR (56px height) ─────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │  🔷 GCI      │   PM-3 Paper Machine   │   OP-1042 (J. Smith)   │ 🔔 ⚙  │ │
│ │              │   ● Machine Running     │   Shift: Day (06-18)   │       │ │
│ │              │                          │                        │       │ │
│ └──────────────┴──────────────────────────┴────────────────────────┴───────┘ │
│                                                                             │
│ ┌─ SIDEBAR ──┐  ┌─ MAIN CONTENT ────────────────────────────────────────┐  │
│ │ (64px/     │  │                                                        │  │
│ │  200px)    │  │  ┌─ BREADCRUMB (optional) ───────────────────────────┐ │  │
│ │            │  │  │  Dashboard  ▸  Live Grade Change                   │ │  │
│ │ [Icon]     │  │  └───────────────────────────────────────────────────┘ │  │
│ │ Overview   │  │                                                        │  │
│ │            │  │  (Screen content renders here)                         │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Live GC    │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Predict    │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ History    │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Twin       │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Reports    │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ ────────── │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Alerts     │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Model      │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Audit      │  │                                                        │  │
│ │            │  │                                                        │  │
│ │ [Icon]     │  │                                                        │  │
│ │ Settings   │  │                                                        │  │
│ │            │  │                                                        │  │
│ └────────────┘  └────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ STATUS BAR (32px height) ──────────────────────────────────────────────┐ │
│ │  ● Data Feed: LIVE │ Model: v2.3.1 │ Latency: 342ms │ Queue: 0 │ 14:32 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Top Bar Specification

| Element | Position | Content | Interaction |
|---|---|---|---|
| **Logo & Title** | Left | "🔷 GCI" wordmark + "GradeChange Intelligence" on hover tooltip | Click → navigate to Overview Dashboard |
| **Machine Selector** | Center-Left | Machine ID (PM-3) + machine status (● Running / ○ Stopped / ⚠ Alarm) | Dropdown to switch machines (multi-machine Phase 3) |
| **Operator Badge** | Center-Right | Operator ID + name + current shift | Click → operator profile / shift history |
| **Notification Bell** | Right | Bell icon + unread count badge (red circle) | Click → notification drawer (slide-in from right) |
| **Settings Gear** | Far Right | Gear icon | Click → navigate to Settings |

**Why show operator identity prominently?** — 21 CFR Part 11 compliance requires all actions to be attributable. The operator badge reinforces accountability and enables automatic audit trail tagging.

## 3.3 Sidebar Navigation

| Position | Icon | Label | Route | Badge | Role Access |
|---|---|---|---|---|---|
| 1 | `LayoutDashboard` | Overview | `/` | — | All |
| 2 | `Activity` | Live Grade Change | `/live` | 🔴 Active transition indicator | All |
| 3 | `BrainCircuit` | Prediction Center | `/predictions` | — | All |
| 4 | `History` | Historical Analysis | `/history` | — | All |
| 5 | `FlaskConical` | Digital Twin | `/twin` | — | Engineer, Admin |
| 6 | `FileBarChart` | Reports | `/reports` | — | All |
| — | **Divider** | — | — | — | — |
| 7 | `Bell` | Alerts & Alarms | `/alerts` | Count of unacknowledged alarms | All |
| 8 | `HeartPulse` | Model Health | `/model-health` | 🟡 if drift detected | Engineer, Admin |
| 9 | `ScrollText` | Audit Log | `/audit` | — | Admin |
| 10 | `Settings` | Settings | `/settings` | — | Admin |

**Sidebar behavior:**
- Default: Collapsed (64px wide, icon-only) to maximize chart space
- Toggle: Click hamburger icon or press `[` keyboard shortcut to expand (200px, icon + label)
- Active state: Blue left border (3px `--honeywell-blue`) + muted blue background fill
- Hover state: Background lightens to `--bg-elevated`

**Why collapsed by default?** — In control rooms, every pixel of chart space matters. Operators learn icon positions within days. The keyboard shortcut `[` enables quick expansion when needed.

## 3.4 Status Bar

| Element | Data Source | Refresh | Purpose |
|---|---|---|---|
| **Data Feed Indicator** | M1 Ingestion heartbeat | 1 second | ● LIVE (green pulsing) / ● STALE (yellow, >5s gap) / ● OFFLINE (red) |
| **Model Version** | M8 MLOps model registry | On change | Shows active model version; yellow text if shadow challenger is active |
| **Inference Latency** | M3 Prediction Engine metrics | 5 seconds | p95 latency of last 100 predictions; green < 200ms, yellow < 500ms, red ≥ 500ms |
| **Message Queue Depth** | Kafka consumer lag | 10 seconds | Consumer lag across all topics; alerts if > 100 |
| **Clock** | Local system | 1 second | 24-hour format; operator's local timezone |

**Why a status bar?** — Operators need passive assurance that the system is functioning. A dead data feed indicator is the first sign of a connectivity issue. This bar provides at-a-glance system health without consuming vertical space.

---

# 4. Screen Specifications

---

## 4.1 Login & Authentication

| Attribute | Specification |
|---|---|
| **Purpose** | Authenticate operator identity for audit trail attribution (21 CFR Part 11) |
| **Primary User** | All users (Operators, Engineers, Admins) |
| **Route** | `/login` |
| **Priority** | Must Have |

### Information Displayed

- Honeywell GCI logo and product name (centered)
- Machine identification (e.g., "PM-3 — Paper Machine 3")
- Login form: Employee ID + Password
- "Remember this workstation" checkbox (for shared control room terminals)
- Last login info: "Last login: OP-1042 (J. Smith) at 05:58 today"
- System status indicator (showing if backend services are reachable)

### Widgets & Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│            🔷                               │
│       GradeChange Intelligence              │
│       Honeywell Process Solutions            │
│                                             │
│       ─────────────────────────             │
│                                             │
│       Machine: PM-3                         │
│                                             │
│       ┌───────────────────────┐             │
│       │ Employee ID           │             │
│       └───────────────────────┘             │
│       ┌───────────────────────┐             │
│       │ Password              │             │
│       └───────────────────────┘             │
│                                             │
│       ☐ Remember this workstation           │
│                                             │
│       ┌───────────────────────┐             │
│       │      SIGN IN          │             │
│       └───────────────────────┘             │
│                                             │
│       Last login: OP-1042 at 05:58          │
│       System: ● All services operational    │
│                                             │
└─────────────────────────────────────────────┘
```

### Actions

| Action | Trigger | Result |
|---|---|---|
| Sign In | Click button / press Enter | Authenticate via Active Directory / LDAP; redirect to Overview |
| Forgot Password | Link below form | Redirect to corporate password reset portal |

### States

| State | Display |
|---|---|
| **Loading** | "SIGN IN" button shows spinner; inputs disabled |
| **Error (wrong credentials)** | Red banner: "Invalid employee ID or password. Please try again." Input fields get red border. |
| **Error (service down)** | Red banner: "Unable to connect to GCI services. Contact system administrator." System status shows ● Offline (red). |
| **Success** | Brief green checkmark animation, then redirect to Overview |

### Design Rationale

**Why Employee ID instead of email?** — Mill operators don't use email at their workstations. Employee ID is printed on their badge and memorized. This is standard Honeywell practice for process control logins.

---

## 4.2 Overview Dashboard

| Attribute | Specification |
|---|---|
| **Purpose** | At-a-glance operational status: Is there an active grade change? What is the current risk? How has the shift performed? |
| **Primary User** | Operators (start-of-shift), Shift Supervisors |
| **Route** | `/` |
| **Priority** | Must Have |

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OVERVIEW DASHBOARD                               │
│                                                                          │
│  ┌─ ROW 1: MACHINE STATUS ──────────────────────────────────────────┐   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐        │   │
│  │  │ MACHINE STATE  │ │ CURRENT GRADE  │ │ SHIFT PERF     │        │   │
│  │  │                │ │                │ │                │        │   │
│  │  │  ● RUNNING     │ │  90 GSM        │ │  3 transitions │        │   │
│  │  │  Speed: 685    │ │  On-Grade      │ │  2 ✅  1 ⚠     │        │   │
│  │  │  m/min         │ │  Since 14:12   │ │  Avg stab: 192s│        │   │
│  │  └────────────────┘ └────────────────┘ └────────────────┘        │   │
│  │                                                                    │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐        │   │
│  │  │ ACTIVE ALERTS  │ │ AI CONFIDENCE  │ │ MODEL STATUS   │        │   │
│  │  │                │ │                │ │                │        │   │
│  │  │  2 HIGH        │ │  Overall: 87%  │ │  v2.3.1        │        │   │
│  │  │  5 MEDIUM      │ │  HIGH          │ │  ● Healthy     │        │   │
│  │  │  0 CRITICAL    │ │                │ │  No drift      │        │   │
│  │  └────────────────┘ └────────────────┘ └────────────────┘        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─ ROW 2: KEY PROCESS TRENDS (50%) ───┐ ┌─ ACTIVE GC BANNER (50%) ──┐ │
│  │                                      │ │                            │ │
│  │  BW + Moisture + Steam Press         │ │  IF active transition:     │ │
│  │  4-variable sparkline strip          │ │    Large card showing       │ │
│  │  Last 30 minutes                     │ │    transition status,       │ │
│  │                                      │ │    risk level, timeline,    │ │
│  │  Click any variable → Machine Detail │ │    "GO TO LIVE VIEW ▸"     │ │
│  │                                      │ │                            │ │
│  │                                      │ │  IF idle:                   │ │
│  │                                      │ │    "No active transition"   │ │
│  │                                      │ │    Last transition summary  │ │
│  └──────────────────────────────────────┘ └────────────────────────────┘ │
│                                                                          │
│  ┌─ ROW 3: SHIFT HISTORY ───────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  Timeline of today's grade changes:                                   │ │
│  │  ●──────●──────●──────●──────────────────────────────────            │ │
│  │  06:15   08:42   11:30   14:12                                       │ │
│  │  70→80✅  80→90✅  90→70⚠   70→90 (active)                          │ │
│  │                                                                       │ │
│  │  Click any node → Historical detail for that transition              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─ ROW 4: RECENT FEEDBACK ────────────┐ ┌─ QUICK ACTIONS ────────────┐ │
│  │                                      │ │                            │ │
│  │  Last 5 feedback entries             │ │  ▸ Start Similarity Search │ │
│  │  OP-1042 ACCEPTED at 11:32           │ │  ▸ Run What-If Simulation  │ │
│  │  OP-1038 REJECTED at 08:45           │ │  ▸ Generate Shift Report   │ │
│  │  ...                                 │ │  ▸ View Model Health       │ │
│  └──────────────────────────────────────┘ └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Widgets

| Widget | Data Source | Refresh | Interaction |
|---|---|---|---|
| **Machine State Card** | M1 Ingestion (speed, status) | 1s WebSocket | Click → Machine Detail screen |
| **Current Grade Card** | M2 Context Engine | Event-driven | Shows time-on-grade; click → grade recipe detail |
| **Shift Performance Card** | M7 Knowledge Base (transition history) | 30s poll | Shows transition count, success rate, avg stabilization |
| **Active Alerts Card** | M1 Ingestion alarm feed | Real-time event | Click → Alerts & Alarms screen; shows count by severity |
| **AI Confidence Card** | M10 Confidence Engine | Per prediction cycle | Shows overall system confidence; color-coded |
| **Model Status Card** | M8 MLOps | 60s poll | Shows model version, health, drift status |
| **Key Process Trends** | M1 Ingestion (Redis hot cache) | 1s WebSocket | 4-variable sparkline strip; click variable → full trend |
| **Active GC Banner** | M2 Context Engine + M3 Prediction | 1s WebSocket (when active) | Large call-to-action card; "GO TO LIVE VIEW" button |
| **Shift History Timeline** | M7 Knowledge Base | 60s poll | Horizontal timeline of today's transitions; click node → detail |
| **Recent Feedback** | M6 Feedback | 30s poll | Last 5 operator feedback entries |
| **Quick Actions** | Static | N/A | Shortcut links to common workflows |

### Empty State

"No grade changes have occurred during this shift. The AI system is monitoring process data and will alert you when a transition is detected."

### Design Rationale

**Why the "Active GC Banner" is 50% width?** — During a transition, this card becomes the visual center of gravity, pulling the operator's attention to the live view. When idle, it shrinks to a summary, keeping the overview balanced.

**Why Shift Performance?** — Operators care about their shift's performance. Showing transition success rate motivates consistent engagement with AI recommendations.

---

## 4.3 Live Grade Change (Primary Operational Screen)

| Attribute | Specification |
|---|---|
| **Purpose** | Real-time operational command center during an active grade transition. This is the most critical screen in the application. |
| **Primary User** | Machine Operator (during transition) |
| **Route** | `/live` |
| **Priority** | Must Have |
| **Auto-Navigation** | System auto-navigates to this screen when a grade change is detected (configurable) |

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     LIVE GRADE CHANGE — 70 GSM → 90 GSM                  │
│                                                                          │
│  ┌─ STATUS STRIP (Row 1, fixed) ────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │   │
│  │  │ PHASE       │ │ RISK        │ │ CONFIDENCE  │ │ TIME        │ │   │
│  │  │ ● RAMPING   │ │ ⚠ WARNING  │ │ 82% MEDIUM  │ │ Est: 3:15   │ │   │
│  │  │ Step 2 of 4 │ │ Score: 78   │ │ [████████░] │ │ Elapsed: 47s│ │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─ TRAJECTORY CHART (Row 2, 60%) ─────┐ ┌─ RIGHT PANEL (40%) ──────┐  │
│  │                                      │ │                           │  │
│  │  BW Trajectory:                      │ │  ┌─ ROOT CAUSE ─────────┐│  │
│  │                                      │ │  │ Steam Press    38% ↑ ││  │
│  │  Actual ────── Predicted ─ ─ ─       │ │  │ ████████████████     ││  │
│  │  Target ─·─·─  Band ░░░░░░          │ │  │ Stock Flow     23% ↑ ││  │
│  │  Limits ─ ─    Simulation ·····      │ │  │ ██████████           ││  │
│  │                                      │ │  │ Moisture       18% ↑ ││  │
│  │       ╱──────╲                       │ │  │ ████████             ││  │
│  │      ╱   ░░░░ ╲──────── ── ── ──    │ │  │ Machine Spd    10% ↑ ││  │
│  │  ───╱    ░░░░░  ╲── ── ── ── ── ──  │ │  │ ████                 ││  │
│  │  ─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─  │ │  │ Others          7%  ││  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │ │  │ ███                  ││  │
│  │                                      │ │  └──────────────────────┘│  │
│  │  TIMELINE BAR:                       │ │                           │  │
│  │  ●━━━━━━●━━━━●━━━━━●━━━━●           │ │  ┌─ CONFIDENCE DETAIL ──┐│  │
│  │  NOW   PEAK  REC  STAB DONE         │ │  │ Prediction:    89%   ││  │
│  │                                      │ │  │ Historical:    85%   ││  │
│  │  Toggle: [Sim] [Hist] [Band]        │ │  │ Simulation:    76%   ││  │
│  └──────────────────────────────────────┘ │  │ Recommendation: 78%  ││  │
│                                            │  │ Limiting: Simulation ││  │
│                                            │  └──────────────────────┘│  │
│                                            └──────────────────────────┘  │
│                                                                          │
│  ┌─ RECOMMENDATION (Row 3, 45%) ────┐ ┌─ EXPLANATION (Row 3, 55%) ──┐  │
│  │                                    │ │                              │  │
│  │  RECOMMENDED ACTION                │ │  "BW predicted to exceed     │  │
│  │                                    │ │   +2.8% at t+60s.            │  │
│  │  Reduce Steam Pressure SP          │ │                              │  │
│  │    485 kPa  →  470 kPa            │ │   Primary driver: Steam      │  │
│  │    ▼ Change: -15 kPa (-3.1%)      │ │   Pressure ramp rate is too  │  │
│  │                                    │ │   aggressive (38%).          │  │
│  │  Expected Outcome:                 │ │                              │  │
│  │    BW within ±2.0%                 │ │   Reducing SP to 470 kPa     │  │
│  │    Stabilize 45s faster            │ │   matches the action taken   │  │
│  │    On-spec probability: 94%        │ │   in 3 of 5 similar past     │  │
│  │                                    │ │   transitions (89% avg       │  │
│  │  ┌──────────┐  ┌──────────┐       │ │   similarity)."              │  │
│  │  │ ✓ ACCEPT │  │ ✕ REJECT │       │ │                              │  │
│  │  └──────────┘  └──────────┘       │ │  Confidence: 82% ████████░   │  │
│  │                                    │ │  [View Engineering Detail ▸] │  │
│  │  [Run Simulation ▸]               │ │                              │  │
│  └────────────────────────────────────┘ └──────────────────────────────┘  │
│                                                                          │
│  ┌─ HISTORICAL MATCHES (Row 4, collapsible) ────────────────────────┐   │
│  │  #1  89%  GC-2025-11-14  ✅ Reduced steam ramp → 185s stab.      │   │
│  │  #2  82%  GC-2025-09-22  ✅ Proactive stock adj → 160s stab.     │   │
│  │  #3  74%  GC-2026-01-08  ❌ No action → BW exceeded +3.4%        │   │
│  │  [Expand All ▾]                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─ ALARM FEED (Row 5, collapsible, max 3 visible) ─────────────────┐   │
│  │  ⚠ 14:31:42  PIC-301 Steam Pressure HIGH  │ ACK                   │   │
│  │  ℹ 14:30:15  Grade Change Initiated 70→90  │                       │   │
│  │  [Show All Alarms ▸]                                                │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Refresh Strategy

| Component | Method | Rate | Rationale |
|---|---|---|---|
| Status Strip | WebSocket push | 1 second | Operator must see current phase/risk at all times |
| Trajectory Chart | WebSocket push | 1 second | Real-time BW tracking is the core monitoring need |
| Root Cause Ranking | gRPC poll | Per prediction cycle (~5s) | Updates when M3 recomputes |
| Confidence Detail | gRPC poll | Per prediction cycle (~5s) | Tied to M10 output |
| Recommendation Panel | Event-driven | On WARNING/BREACH only | Appears only when action is needed |
| Explanation Panel | Event-driven | On each prediction cycle | Tracks latest explanation from M5 |
| Historical Matches | Event-driven | On transition start (once) | Computed once by M11 at detection |
| Alarm Feed | WebSocket push | Real-time event-driven | Alarms must appear instantly |
| Timeline Bar | gRPC poll | 5 seconds | M13 recomputes periodically |

### Actions

| Action | Element | Behavior |
|---|---|---|
| **ACCEPT** | Green button in Recommendation Panel | Opens confirmation modal: "Apply recommendation: Reduce Steam Pressure SP to 470 kPa?" → Sends feedback to M6; logs to audit |
| **REJECT** | Red-outlined button in Recommendation Panel | Opens modal with optional reject reason dropdown (Too aggressive / Not applicable / Operator override / Other); Sends feedback to M6 |
| **Run Simulation** | Text link in Recommendation Panel | Navigates to Digital Twin screen pre-loaded with the recommendation for simulation |
| **Toggle Chart Layers** | Buttons below chart: [Sim] [Hist] [Band] | Toggle visibility of simulation overlay, historical BW overlay, and confidence band |
| **Expand Historical Match** | Click on any match row | Expands inline to show full match detail: operator action, outcome, key lesson |
| **View Engineering Detail** | Link in Explanation Panel | Opens full-screen engineering detail view (SHAP waterfall, constraint tables, per-variable trends) |
| **Acknowledge Alarm** | ACK button on alarm row | Marks alarm as acknowledged; removes from active feed; logs to audit |

### Empty State (No Active Transition)

```
┌─────────────────────────────────────────────────┐
│                                                   │
│         NO ACTIVE GRADE CHANGE                    │
│                                                   │
│  The machine is running steadily on 90 GSM.       │
│  The AI system is monitoring process data.        │
│                                                   │
│  Last transition: 70 GSM → 90 GSM                 │
│  Completed: 14:18 (32 minutes ago)                │
│  Outcome: ✅ On-spec, stabilized in 185s          │
│                                                   │
│  [View Last Transition Detail ▸]                  │
│                                                   │
│  You will be automatically navigated here         │
│  when the next grade change is detected.          │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Loading State
All panels show skeleton shimmer cards (dark animated placeholder blocks). Status strip shows "Connecting..." with spinning indicator. Chart area shows empty axes with "Waiting for data..." message.

### Error State
If WebSocket connection drops: Yellow banner at top — "⚠ Live data connection lost. Attempting to reconnect... Last update: 14:31:42". Data freezes at last known state; all values show "STALE" badge. Reconnection auto-retries with exponential backoff.

### Design Rationale

**Why is the Recommendation Panel below the chart?** — The operator's first question is "What's happening?" (chart). Only then do they ask "What should I do?" (recommendation). The layout follows the decision sequence.

**Why are ACCEPT/REJECT always in the same position?** — Muscle memory. The operator should be able to act without searching for the button. Fixed position reduces decision time under pressure.

**Why show only 3 alarms?** — During a grade change, dozens of alarms may fire. Showing all creates visual noise. The top 3 (by severity then time) surface what matters. "Show All" provides full access.

---

## 4.4 Prediction Center

| Attribute | Specification |
|---|---|
| **Purpose** | Centralized view of all AI predictions: current and historical. Allows operators and engineers to review prediction accuracy and calibration over time. |
| **Primary User** | Process Engineers, Shift Supervisors |
| **Route** | `/predictions` |
| **Priority** | Should Have |

### Information Displayed

| Section | Content |
|---|---|
| **Active Prediction** | Current BW trajectory forecast (t+30, t+60, t+90, t+120) with confidence intervals |
| **Prediction History Table** | Sortable table of past predictions: timestamp, grade pair, risk class, predicted max deviation, actual max deviation, accuracy verdict |
| **Accuracy Metrics** | Rolling accuracy (7/30/90 day), RMSE, MAPE, F1 score for risk classification |
| **Calibration Chart** | Predicted confidence vs. actual coverage (ideally on the 45° diagonal) |
| **SHAP Summary** | Global feature importance ranking across all predictions (not just current) |

### Charts

| Chart | Type | Purpose |
|---|---|---|
| **BW Forecast** | Multi-line time series (actual vs. predicted at each horizon) | See real-time prediction vs. ground truth |
| **Prediction Scatter** | Scatter plot: predicted max deviation (x) vs. actual max deviation (y) | Assess prediction calibration; points near diagonal = good |
| **Accuracy Trend** | Line chart: rolling accuracy over 90 days | Detect long-term accuracy trends or degradation |
| **Calibration Plot** | Reliability diagram (line chart) | 90% prediction intervals should contain 90% of observations |
| **Feature Importance** | Horizontal bar chart (global SHAP values) | Understand which variables the model relies on most |

### Filters

| Filter | Options | Default |
|---|---|---|
| Date Range | Last 7d / 30d / 90d / Custom | Last 30d |
| Grade Pair | All / Specific source→target | All |
| Risk Class | All / SAFE / WARNING / BREACH | All |
| Shift | All / Day / Night / Evening | All |

### Empty State
"No predictions have been generated yet. Predictions are computed during active grade transitions."

---

## 4.5 Recommendation Center

| Attribute | Specification |
|---|---|
| **Purpose** | Review all past recommendations: what was advised, what the operator did, and what actually happened. This is the feedback learning dashboard. |
| **Primary User** | Process Engineers, Shift Supervisors |
| **Route** | `/recommendations` (accessible from Prediction Center sub-nav) |
| **Priority** | Should Have |

### Information Displayed

| Section | Content |
|---|---|
| **Recommendation Table** | Timestamp, grade pair, setpoint changes, operator decision (Accept/Reject/Ignore), predicted outcome, actual outcome, accuracy |
| **Decision Analysis** | Accept rate by operator, by grade pair, by shift; heatmap of acceptance patterns |
| **Outcome Comparison** | Bar chart: predicted stabilization time vs. actual, grouped by Accept/Reject |
| **Feedback Quality** | Distribution of feedback weights from E7 Smart Safeguards (when enabled) |

### Actions

| Action | Purpose |
|---|---|
| **Export to CSV** | Download recommendation history for offline analysis |
| **Flag for Review** | Mark a recommendation as requiring engineering review |
| **Filter by Operator** | View a specific operator's feedback history |

---

## 4.6 Digital Twin Simulator

| Attribute | Specification |
|---|---|
| **Purpose** | Interactive what-if simulation. Engineers can adjust any setpoint and see the predicted process response before committing changes. |
| **Primary User** | Process Engineers (primary), Operators (via "Run Simulation" link) |
| **Route** | `/twin` |
| **Priority** | Should Have |

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DIGITAL TWIN SIMULATOR                                │
│                                                                          │
│  ┌─ CONTROLS (Left Panel, 30%) ──────────┐ ┌─ SIMULATION (Right, 70%)──┐│
│  │                                        │ │                            ││
│  │  SCENARIO SETUP                        │ │  ┌─ TRAJECTORY CHART ────┐ ││
│  │                                        │ │  │                        │ ││
│  │  Base State: Current Process State     │ │  │  Baseline ──────       │ ││
│  │  (auto-loaded)                         │ │  │  Scenario A ─ ─ ─      │ ││
│  │                                        │ │  │  Scenario B · · · ·    │ ││
│  │  ┌─ SETPOINT ADJUSTMENTS ─────────┐   │ │  │                        │ ││
│  │  │                                │   │ │  │  BW, Moisture, Ash,    │ ││
│  │  │  Steam Pressure SP            │   │ │  │  Caliper trajectories   │ ││
│  │  │  Current: 485 kPa             │   │ │  │                        │ ││
│  │  │  New: [___470___] kPa         │   │ │  │                        │ ││
│  │  │  ─●───────── [slider]         │   │ │  └────────────────────────┘ ││
│  │  │                                │   │ │                            ││
│  │  │  Stock Flow SP                 │   │ │  ┌─ METRICS TABLE ───────┐ ││
│  │  │  Current: 240 kg/min           │   │ │  │                        │ ││
│  │  │  New: [___240___] kg/min       │   │ │  │         Base  A     B  │ ││
│  │  │  ─────●─────── [slider]        │   │ │  │ MaxDev  3.2%  2.0%  .. │ ││
│  │  │                                │   │ │  │ Stab    210s  165s  .. │ ││
│  │  │  Machine Speed SP              │   │ │  │ OffSpec 35s   0s    .. │ ││
│  │  │  Current: 685 m/min            │   │ │  │ Valid   —     PASS  .. │ ││
│  │  │  New: [___685___] m/min        │   │ │  │                        │ ││
│  │  │  ─────────●─── [slider]        │   │ │  └────────────────────────┘ ││
│  │  │                                │   │ │                            ││
│  │  │  Filler Flow SP                │   │ │  ┌─ VALIDATION ──────────┐ ││
│  │  │  Current: 12 kg/min            │   │ │  │ ● Hard constraints: OK │ ││
│  │  │  New: [___12____] kg/min       │   │ │  │ ● Stability: PASS     │ ││
│  │  │  ──●──────────── [slider]      │   │ │  │ ● Plausibility: PASS  │ ││
│  │  └────────────────────────────────┘   │ │  │ ● Confidence: 78%     │ ││
│  │                                        │ │  └────────────────────────┘ ││
│  │  Simulation Horizon: [300] seconds    │ │                            ││
│  │                                        │ │                            ││
│  │  ┌──────────────────────────────┐     │ │                            ││
│  │  │  ▶ RUN SIMULATION           │     │ │                            ││
│  │  └──────────────────────────────┘     │ │                            ││
│  │                                        │ │                            ││
│  │  ┌──────────────────────────────┐     │ │                            ││
│  │  │  + ADD SCENARIO              │     │ │                            ││
│  │  └──────────────────────────────┘     │ │                            ││
│  │                                        │ │                            ││
│  │  ┌──────────────────────────────┐     │ │                            ││
│  │  │  LOAD AI RECOMMENDATION     │     │ │                            ││
│  │  └──────────────────────────────┘     │ │                            ││
│  └────────────────────────────────────────┘ └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Interactions

| Interaction | Behavior |
|---|---|
| **Slider drag** | Adjusts setpoint value; shows %-change from current in real-time |
| **Numeric input** | Type exact value; validates against hard limits (red border if invalid) |
| **RUN SIMULATION** | Calls M9 `SimulateScenario`; chart draws trajectory over 500ms; metrics table updates |
| **ADD SCENARIO** | Adds a new scenario column (max 5); each with its own setpoint configuration |
| **LOAD AI RECOMMENDATION** | Auto-fills the setpoint fields with M4's latest recommended values |
| **Chart hover** | Tooltip shows exact values at any time point for all scenarios simultaneously |
| **Chart zoom** | Scroll to zoom into specific time range; drag to pan |

### Empty State
"Configure setpoint adjustments in the left panel and click RUN SIMULATION to see the predicted process response."

### Loading State
"Simulating..." with progress bar (estimated 2–5 seconds). Trajectory chart shows the baseline trajectory immediately while computing the scenario.

### Error State
"Simulation failed: [reason]." Most common: "Setpoint exceeds safety limits" (hard constraint violation). Shows which constraint was violated and the limit value.

### Design Rationale

**Why sliders AND numeric inputs?** — Sliders provide intuitive proportional adjustment; numeric inputs allow precise engineering values. Both are needed for different tasks (quick exploration vs. specific tuning).

**Why load from the left, results on the right?** — The natural workflow is: configure → execute → observe. Left-to-right matches this flow and matches standard engineering simulation tool conventions.

---

## 4.7 Historical Analysis

| Attribute | Specification |
|---|---|
| **Purpose** | Explore and analyze past grade transitions. Compare outcomes across grades, operators, shifts, and time periods. |
| **Primary User** | Process Engineers, Quality Managers |
| **Route** | `/history` |
| **Priority** | Must Have |

### Information Displayed

| Section | Content |
|---|---|
| **Transition Table** | Sortable, filterable table: Date, Grade Pair, Operator, Shift, Duration, Max BW Deviation, Off-Spec Time, Outcome, AI Prediction Accuracy |
| **Outcome Distribution** | Donut chart: % successful vs. failed transitions |
| **Performance Over Time** | Line chart: rolling average stabilization time (30-day window) |
| **Grade Pair Heatmap** | Matrix: source grade (rows) × target grade (columns), cell color = average success rate |
| **Operator Comparison** | Grouped bar chart: stabilization time by operator (anonymized option available) |

### Filters

| Filter | Options | Default |
|---|---|---|
| Date Range | Last 7d / 30d / 90d / 1y / Custom | Last 90d |
| Grade Pair | All / Specific | All |
| Operator | All / Specific ID | All |
| Shift | All / Day / Night / Evening | All |
| Outcome | All / Success / Failed | All |
| AI Used | All / With AI / Without AI | All |

### Actions

| Action | Element | Behavior |
|---|---|---|
| **Click Row** | Table row | Expands to show transition detail: full BW trajectory replay, setpoint changes, alarms, AI prediction, operator feedback |
| **Export** | Button (top-right) | Export filtered data to CSV or PDF |
| **Compare** | Checkbox + "Compare Selected" button | Select 2–3 transitions and overlay their BW trajectories on a single chart |

### Design Rationale

**Why a Grade Pair Heatmap?** — Some grade transitions are inherently more difficult than others (e.g., large BW jumps). The heatmap instantly shows which transitions need the most AI support, guiding process improvement priorities.

---

## 4.8 Similarity Search

| Attribute | Specification |
|---|---|
| **Purpose** | Ad-hoc search for similar historical transitions. Allows engineers to find precedents for a specific scenario without waiting for an active transition. |
| **Primary User** | Process Engineers |
| **Route** | `/similarity` |
| **Priority** | Should Have |

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SIMILARITY SEARCH                                                │
│                                                                   │
│  ┌─ SEARCH CRITERIA (Top) ────────────────────────────────────┐  │
│  │                                                              │  │
│  │  Source Grade: [70 GSM ▾]    Target Grade: [90 GSM ▾]       │  │
│  │  Date Range: [Last 1 year ▾]  Min Similarity: [50% ▾]      │  │
│  │  [🔍 SEARCH]                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ RESULTS ──────────────────────────────────────────────────┐  │
│  │  Found 47 transitions matching 70→90 GSM                    │  │
│  │  Showing top 10 by similarity score                         │  │
│  │                                                              │  │
│  │  ┌─ MATCH CARD ────────────────────────────────────────────┐ │  │
│  │  │  GC-2025-11-14-003   │  89% SIMILAR  │  ✅ SUCCESS      │ │  │
│  │  │  Operator: J. Smith  │  Shift: Day   │  185s stab.     │ │  │
│  │  │  Action: Reduced steam ramp by 15%                      │ │  │
│  │  │  Lesson: Slower steam ramp prevented overshoot          │ │  │
│  │  │  [View Full Detail ▸]  [Compare ▸]                      │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  ┌─ MATCH CARD ────────────────────────────────────────────┐ │  │
│  │  │  GC-2025-09-22-007   │  82% SIMILAR  │  ✅ SUCCESS      │ │  │
│  │  │  ...                                                    │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │  ...                                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ PATTERN SUMMARY ─────────────────────────────────────────┐   │
│  │  "Of 47 similar transitions, 38 (81%) succeeded.           │   │
│  │   Most common successful strategy: Reduce steam ramp rate  │   │
│  │   by 10-15% (used in 24 transitions)."                     │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Design Rationale

**Why a dedicated Similarity screen?** — During the Live Grade Change view, similarity is shown reactively. This screen enables proactive research — engineers can study transition patterns before a grade change is scheduled, improving shift planning.

---

## 4.9 Machine Detail

| Attribute | Specification |
|---|---|
| **Purpose** | Deep-dive into current process variable values, trends, and health for the paper machine. |
| **Primary User** | Operators, Process Engineers |
| **Route** | `/machine` |
| **Priority** | Should Have |

### Information Displayed

| Section | Content |
|---|---|
| **Process Variable Grid** | 4×3 grid of sparkline cards: BW, Moisture, Ash, Caliper, Stock Flow (PV/SP), Filler Flow (PV/SP), Steam Pressure (PV/SP), Machine Speed (PV/SP), + 2 configurable |
| **Full Trend View** | Click any sparkline → full-screen trend chart with 1h/4h/8h/24h zoom |
| **Current Setpoints Table** | Table: Variable, Current SP, Current PV, Error (PV-SP), Normal Range, Status |
| **Sensor Health** | Table: Tag name, last update timestamp, data quality flag, imputation rate |

### Refresh Strategy
All sparklines: 1-second WebSocket push. Full trend view: 1-second WebSocket for visible range.

---

## 4.10 Operator Feedback Review

| Attribute | Specification |
|---|---|
| **Purpose** | Review all operator feedback records. Analyze patterns in acceptance/rejection. Surface feedback quality issues (E7 safeguards). |
| **Primary User** | Shift Supervisors, Process Engineers |
| **Route** | `/feedback` (accessible from Overview quick actions or sidebar when E7 is enabled) |
| **Priority** | Should Have (basic), Future (with E7 analytics) |

### Information Displayed

| Section | Content |
|---|---|
| **Feedback Table** | Timestamp, Operator, Transition, Decision (Accept/Reject), Reject Reason, Response Time, Feedback Weight (E7), Outcome Verification |
| **Accept Rate Trend** | Line chart: rolling 30-day accept rate |
| **Operator Trust Scores** | Table: Operator ID, Trust Score, Total Feedbacks, Validated %, Consistency Score (visible to supervisors only) |
| **Feedback Quality Distribution** | Histogram: distribution of feedback weights (E7) |
| **Flagged Feedback** | List of feedback records flagged by E7 gates (habitual clicking, inconsistency, outcome mismatch) |

---

## 4.11 Alerts & Alarms

| Attribute | Specification |
|---|---|
| **Purpose** | Centralized alarm management. View, filter, acknowledge, and analyze process alarms. |
| **Primary User** | Operators (acknowledging), Engineers (analyzing) |
| **Route** | `/alerts` |
| **Priority** | Must Have |

### Information Displayed

| Section | Content |
|---|---|
| **Active Alarms Table** | Timestamp, Tag, Description, Priority (CRITICAL/HIGH/MEDIUM/LOW/INFO), State (Active/Acknowledged), Duration |
| **Alarm Timeline** | Horizontal timeline showing alarm occurrences over last 8 hours |
| **Alarm Statistics** | Cards: Total alarms, Unacknowledged count, Most frequent alarm, Chattering alarms |
| **AI-Correlated Alarms** | Alarms that correlate with AI-predicted deviations (highlighted) |

### Actions

| Action | Element | Behavior |
|---|---|---|
| **Acknowledge** | Button per row | Marks alarm as ACK'd; logs operator ID + timestamp |
| **Acknowledge All** | Button (top) | Bulk acknowledge all non-critical alarms |
| **Shelve** | Button per row | Temporarily suppress alarm for configurable duration (1h/4h/shift) |
| **Filter** | Priority dropdown + tag search | Narrow displayed alarms |

### Refresh Strategy
Real-time event-driven via WebSocket. New alarms animate in with a slide-down + flash effect.

---

## 4.12 Reports

| Attribute | Specification |
|---|---|
| **Purpose** | Generate and download structured reports for management, quality assurance, and continuous improvement. |
| **Primary User** | Shift Supervisors, Quality Managers, Plant Management |
| **Route** | `/reports` |
| **Priority** | Should Have |

### Available Reports

| Report | Content | Generation |
|---|---|---|
| **Shift Summary** | All transitions during shift: outcomes, AI usage, operator feedback, alarms | Auto-generated at shift end + on-demand |
| **Transition Detail** | Deep-dive on single transition: full trajectories, AI predictions, recommendations, feedback, root cause | On-demand (select from history) |
| **Grade Performance** | Aggregate metrics for a specific grade pair over time | On-demand with grade pair filter |
| **AI Accuracy Report** | Prediction accuracy, recommendation acceptance, model calibration | Weekly auto + on-demand |
| **Compliance Audit** | Full audit trail for a date range (21 CFR Part 11) | On-demand by authorized personnel only |

### Actions

| Action | Behavior |
|---|---|
| **Generate** | Triggers server-side report generation; shows progress bar |
| **Download PDF** | Downloads formatted PDF with embedded charts |
| **Download CSV** | Downloads raw data for external analysis |
| **Schedule** | Configure recurring report generation (daily/weekly/monthly) |

---

## 4.13 Model Health & Admin

| Attribute | Specification |
|---|---|
| **Purpose** | Monitor AI model performance, detect drift, manage model lifecycle. |
| **Primary User** | Process Engineers, Data Scientists, System Administrators |
| **Route** | `/model-health` |
| **Priority** | Should Have |

### Information Displayed

| Section | Content |
|---|---|
| **Model Registry** | Table: Model name, version, deployed date, status (Champion/Challenger/Retired) |
| **Prediction Accuracy** | Time series: MAE, RMSE over rolling 30 days |
| **Data Drift Monitor** | PSI values per feature; bar chart; red threshold line at 0.2 |
| **Concept Drift Monitor** | Page-Hinkley statistic time series; alert indicators |
| **Inference Performance** | Latency histogram; throughput counter; error rate |
| **Retraining Log** | Table: Retrain ID, trigger reason, start/end time, dataset size, validation metrics, promotion status |

### Actions

| Action | Access | Behavior |
|---|---|---|
| **Trigger Retraining** | Admin only | Manually trigger model retraining pipeline |
| **Promote Challenger** | Admin only | Promote challenger model to champion after review |
| **Rollback** | Admin only | Roll back to previous model version |
| **View Training Report** | All engineers | View training metrics, validation curves, feature importance |

---

## 4.14 Settings

| Attribute | Specification |
|---|---|
| **Purpose** | Configure platform behavior: thresholds, notification preferences, display options, feature flags. |
| **Primary User** | System Administrators, Shift Supervisors |
| **Route** | `/settings` |
| **Priority** | Must Have |

### Settings Categories

| Category | Settings |
|---|---|
| **Alert Preferences** | Notification channels (in-app, email, SMS); severity thresholds for notification |
| **Display** | Temperature unit (°C/°F); time format (12h/24h); chart default zoom; auto-navigate on grade change (on/off) |
| **Prediction** | Risk threshold for WARNING/BREACH; confidence threshold for INSUFFICIENT |
| **Recommendation** | Auto-display on WARNING (on/off); require confirmation on ACCEPT (on/off) |
| **Feature Flags** | Enable/disable Digital Twin, Timeline Predictor, Smart Feedback (admin only) |
| **Machine Config** | Tag mappings; variable display names; recipe management (admin only) |
| **User Management** | Operator accounts; role assignments (Operator/Engineer/Admin) |

---

## 4.15 Audit Log

| Attribute | Specification |
|---|---|
| **Purpose** | Immutable record of all system actions for 21 CFR Part 11 compliance. |
| **Primary User** | Quality Assurance, Regulatory Auditors, Plant Management |
| **Route** | `/audit` |
| **Priority** | Must Have |

### Information Displayed

| Column | Content |
|---|---|
| **Timestamp** | ISO-8601 with millisecond precision |
| **User** | Operator ID + name |
| **Action** | LOGIN / ACCEPT_RECOMMENDATION / REJECT_RECOMMENDATION / ACK_ALARM / CONFIG_CHANGE / MODEL_PROMOTION / REPORT_GENERATED |
| **Details** | JSON-formatted details of the action (recommendation ID, setpoint values, etc.) |
| **Model Version** | Which model version was active at the time of action |
| **Transition ID** | Associated transition (if applicable) |
| **IP Address** | Source workstation |

### Actions

| Action | Access | Behavior |
|---|---|---|
| **Search** | All authorized | Full-text search across all audit fields |
| **Filter** | All authorized | Filter by action type, user, date range |
| **Export** | Admin only | Export filtered audit log to signed PDF (tamper-evident) |
| **Verify Integrity** | Admin only | Run hash chain verification to confirm log has not been tampered with |

---

# 5. Chart Specifications

## 5.1 Chart Catalog

| # | Chart Name | Type | Screen(s) | Data Source | Update Freq |
|---|---|---|---|---|---|
| C1 | BW Trajectory | Multi-line time series | Live GC, Overview | M1 + M3 + M9 | 1s (WebSocket) |
| C2 | Root Cause Bar | Horizontal bar | Live GC | M12 | Per prediction cycle |
| C3 | Confidence Gauge | Arc gauge (4 segments) | Live GC | M10 | Per prediction cycle |
| C4 | Timeline Progress | Segmented progress bar | Live GC | M13 | 5s |
| C5 | Process Sparklines | Mini line charts (12) | Overview, Machine Detail | M1 | 1s (WebSocket) |
| C6 | Shift Timeline | Horizontal node timeline | Overview | M7 | 60s |
| C7 | Prediction Scatter | Scatter plot | Prediction Center | M7 (historical) | On filter change |
| C8 | Accuracy Trend | Line chart | Prediction Center | M8 | 60s |
| C9 | Calibration Plot | Reliability diagram | Prediction Center | M8 | On filter change |
| C10 | SHAP Waterfall | Waterfall chart | Prediction Center, Live GC (detail) | M12 | Per prediction cycle |
| C11 | Grade Pair Heatmap | Matrix heatmap | Historical Analysis | M7 | On filter change |
| C12 | Outcome Donut | Donut chart | Historical Analysis | M7 | On filter change |
| C13 | Stabilization Trend | Line chart | Historical Analysis | M7 | On filter change |
| C14 | Simulation Trajectory | Multi-line time series | Digital Twin | M9 | On simulation run |
| C15 | Alarm Timeline | Horizontal event timeline | Alerts & Alarms | M1 | Real-time |
| C16 | Drift Monitor | Multi-line with threshold | Model Health | M8 | 60s |
| C17 | Latency Histogram | Histogram | Model Health | M8 | 60s |
| C18 | Accept Rate Trend | Line chart | Feedback Review | M6 | 30s |
| C19 | Feedback Weight Distribution | Histogram | Feedback Review | M6 | 30s |

## 5.2 Detailed Chart Specifications

### C1: BW Trajectory Chart (Most Critical)

| Attribute | Specification |
|---|---|
| **Type** | Multi-line time series with confidence band fill |
| **Purpose** | Real-time visualization of Basis Weight: actual values, predicted trajectory, target, and limits |
| **X-Axis** | Time (relative: t-300s to t+120s); current time at center with scrollable past |
| **Y-Axis** | Basis Weight (g/m²); auto-scaled with 10% padding; always shows target ±5% range minimum |
| **Update** | 1-second WebSocket push for actual data; prediction updates per M3 cycle |

**Data Series:**

| Series | Color | Style | Width | Purpose |
|---|---|---|---|---|
| Actual BW | `--chart-live` (#58A6FF) | Solid line | 2.5px | Real-time measured BW from QCS |
| Predicted BW | `--chart-predicted` (#BC8CF2) | Dashed line (8px dash, 4px gap) | 2px | M3 forecast at t+30, t+60, t+90, t+120 |
| Target BW | `--chart-target` (#3FB950) | Dot-dash line | 1.5px | Recipe target value |
| Upper Limit | `--chart-limit` (#F85149) | Dashed line (4px dash) | 1px | Target + 2.5% |
| Lower Limit | `--chart-limit` (#F85149) | Dashed line (4px dash) | 1px | Target - 2.5% |
| Confidence Band | `--chart-confidence` | Filled area (12% opacity) | — | 90% conformal prediction interval |
| Simulation (toggle) | `--chart-simulation` (#F0883E) | Dotted line (3px dot, 3px gap) | 2px | M9 Digital Twin simulated trajectory |
| Historical (toggle) | `--chart-historical` (#8B949E) | Solid line (50% opacity) | 1.5px | Best historical match BW overlay |

**Interactions:**

| Interaction | Behavior |
|---|---|
| **Hover** | Vertical crosshair; tooltip shows time + all visible series values at that point |
| **Click & Drag** | Zoom into selected time range |
| **Scroll** | Zoom in/out on time axis (centered on cursor position) |
| **Double-click** | Reset zoom to default range |
| **Toggle buttons** | [Sim] [Hist] [Band] buttons below chart toggle series visibility |
| **Right-click** | Context menu: "Export chart as PNG", "View data table" |

**Annotations:**

| Annotation | Trigger | Display |
|---|---|---|
| Grade change start | M2 transition detection | Vertical dashed line + label "GC Start" |
| Peak deviation | M13 timeline | Vertical dotted line + label "Expected Peak" |
| Stabilization point | M13 timeline | Vertical dotted line + label "Expected Stable" |
| Limit breach | BW crosses ±2.5% line | Breach region highlighted with red 5% opacity fill |

### C2: Root Cause Horizontal Bar Chart

| Attribute | Specification |
|---|---|
| **Type** | Horizontal bar chart |
| **Purpose** | Rank process variables by their contribution to predicted deviation |
| **X-Axis** | Contribution percentage (0–50%) |
| **Y-Axis** | Variable names (sorted by contribution descending) |
| **Update** | Per M3 prediction cycle (~5 seconds) |

**Bar Styling:**

| Contribution Range | Color | Actionability |
|---|---|---|
| ≥ 25% | `--status-danger` (#F85149) | Dominant contributor |
| 15–24% | `--status-warning` (#D29922) | Significant contributor |
| 5–14% | `--status-info` (#58A6FF) | Moderate contributor |
| < 5% | `--text-muted` (#484F58) | Minor contributor |

**Interactions:**

| Interaction | Behavior |
|---|---|
| **Hover on bar** | Tooltip: Current value, Normal range, % deviation from normal, Engineering context sentence |
| **Click on bar** | Expands inline to show SHAP waterfall for that variable |
| **Direction arrow** | ↑ or ↓ icon after bar label indicates whether variable is increasing or decreasing risk |

### C10: SHAP Waterfall Chart

| Attribute | Specification |
|---|---|
| **Type** | Waterfall chart (horizontal cascading bars) |
| **Purpose** | Show how each feature's SHAP value pushes the prediction from the base value to the final risk score |
| **X-Axis** | Risk score (0–100) |
| **Y-Axis** | Features (sorted by |SHAP| descending) |
| **Positive bars** | `--status-danger` (increasing risk) |
| **Negative bars** | `--status-safe` (decreasing risk) |
| **Base value line** | Dashed vertical line at the average prediction |
| **Final value line** | Solid vertical line at the current prediction |

---

# 6. User Journeys

## 6.1 Journey: Operator Start of Shift

```
┌──────────────┐
│  1. LOGIN    │  Operator scans badge or enters Employee ID + Password
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  2. OVERVIEW │  System shows: machine state, current grade, shift history
│  DASHBOARD   │  of predecessor shift, unacknowledged alarms count,
│              │  and model health status
└──────┬───────┘
       │  Operator reviews: "2 transitions last shift, both successful"
       │  Operator acknowledges: 3 carry-over alarms
       ▼
┌──────────────┐
│  3. MACHINE  │  Operator clicks Machine Detail to check process state
│  DETAIL      │  Reviews: all PV vs SP values, sensor health
│              │  Confirms: no stuck sensors, no unusual trends
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  4. READY    │  Operator returns to Overview
│              │  System monitors passively; no active transitions
│              │  Operator performs other control room duties
└──────────────┘

Duration: 2-3 minutes
Purpose: Build situational awareness at shift start
```

**Why this journey matters:** Shift handover is the highest-risk period for errors. The Overview Dashboard provides the incoming operator with immediate context about the machine's recent history and current state.

## 6.2 Journey: Active Grade Change (Primary Journey)

```
┌──────────────┐
│  1. ALERT    │  DCS initiates grade change 70→90 GSM
│              │  GCI detects via M2 within 1 second
│              │  System auto-navigates operator to Live Grade Change screen
│              │  Notification toast: "Grade Change Detected: 70→90 GSM"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  2. OBSERVE  │  Live Grade Change screen activates
│              │  Status strip: PHASE: RAMPING │ RISK: SAFE │ CONF: 87%
│              │  BW trajectory chart begins tracking live data
│              │  Historical matches load: "3 similar transitions found"
│              │  Timeline shows: estimated 5:15 total transition time
└──────┬───────┘
       │  30 seconds into transition...
       │  M3 predicts BW will exceed +2.8% at t+60s
       │  Risk escalates: SAFE → WARNING
       ▼
┌──────────────┐
│  3. PREDICT  │  Status strip flashes: RISK: ⚠ WARNING │ Score: 78
│              │  Root cause panel updates: "Steam Pressure 38%"
│              │  Explanation appears: "BW predicted to exceed +2.8%..."
│              │  Recommendation panel slides in (was hidden during SAFE)
└──────┬───────┘
       │  Operator reads explanation (8-10 seconds)
       │  Operator reviews root cause ranking
       ▼
┌──────────────┐
│  4. EVALUATE │  Operator reviews recommendation:
│              │    "Reduce Steam Press SP: 485→470 kPa"
│              │  Operator checks confidence: 82% MEDIUM
│              │  Operator sees historical precedent:
│              │    "3 of 5 similar transitions used this strategy"
│              │
│  (Optional)  │  Operator clicks [Run Simulation ▸]
│              │  → Digital Twin opens, pre-loaded with recommendation
│              │  → Sees trajectory comparison: "With" vs "Without"
│              │  → Validation: PASS on all gates
│              │  → Returns to Live screen
└──────┬───────┘
       │  Operator is convinced (or not)
       │
       ├──────── [ACCEPT] ─────────────────┐
       │                                     │
       │  Confirmation modal appears:        │
       │  "Apply: Reduce Steam Press SP      │
       │   from 485 to 470 kPa?"             │
       │  [Confirm] [Cancel]                 │
       │                                     ▼
       │                             ┌──────────────┐
       │                             │  5a. ACCEPT  │
       │                             │              │
       │                             │  Feedback recorded to M6
       │                             │  Audit log entry created
       │                             │  Recommendation badge: "ACCEPTED ✓"
       │                             │  Operator manually implements SP
       │                             │  change on the DCS
       │                             └──────┬───────┘
       │                                     │
       ├──────── [REJECT] ─────────────────┐ │
       │                                     │ │
       │  Reject reason modal:               │ │
       │  [Too aggressive]                   │ │
       │  [Not applicable]                   │ │
       │  [Operator override]               │ │
       │  [Other: ________]                 │ │
       │                                     ▼ │
       │                             ┌──────────────┐
       │                             │  5b. REJECT  │
       │                             │              │
       │                             │  Feedback recorded to M6
       │                             │  Audit log entry created
       │                             │  Recommendation badge: "REJECTED ✕"
       │                             └──────┬───────┘
       │                                     │
       └─────────────────────────────────────┘
                                              │
                                              ▼
                                     ┌──────────────┐
                                     │  6. MONITOR  │
                                     │              │
                                     │  System continues monitoring
                                     │  BW trajectory updates in real-time
                                     │  Timeline progresses: PEAK → RECOVERY → STABLE
                                     │  Risk level re-evaluated each cycle
                                     └──────┬───────┘
                                              │
                                              ▼
                                     ┌──────────────┐
                                     │  7. COMPLETE │
                                     │              │
                                     │  M2 detects stabilization
                                     │  Status: PHASE: COMPLETE │ RISK: SAFE
                                     │  Summary card appears:
                                     │    "Transition complete: 70→90 GSM"
                                     │    "Stabilization: 185s │ Max deviation: +2.1%"
                                     │    "Outcome: ✅ On-spec"
                                     │
                                     │  E7 Outcome Verification runs async:
                                     │    Compares operator's decision to outcome
                                     │    Updates feedback weight
                                     └──────────────┘

Total journey: 3-7 minutes
Decision point: Step 4-5 (15-30 seconds)
```

**Why this journey is designed this way:**

1. **Auto-navigation** removes the risk of the operator missing the event entirely
2. **Progressive risk escalation** (SAFE → WARNING) prevents alarm fatigue — the recommendation only appears when needed
3. **Evidence before action** — the operator sees prediction, root cause, and historical evidence before the ACCEPT/REJECT decision
4. **Optional simulation** — advanced operators can verify via Digital Twin; less experienced operators can rely on confidence score and history
5. **Reject reason capture** — provides the learning system with structured feedback beyond binary accept/reject

## 6.3 Journey: Engineer Investigates Process Improvement

```
┌──────────────┐
│  1. HISTORY  │  Engineer opens Historical Analysis
│              │  Filters: Last 90 days, Grade 70→90 GSM
│              │  Sees: 32 transitions, 26 successful (81%)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  2. PATTERN  │  Reviews Grade Pair Heatmap
│              │  Identifies: 70→90 is the most problematic pair (81% vs 94% avg)
│              │  Clicks on cell → filtered transition list
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  3. COMPARE  │  Selects 3 failed transitions + 3 successful ones
│              │  Opens comparison view: overlaid BW trajectories
│              │  Observes: failures all have aggressive steam ramps
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  4. SIMULATE │  Opens Digital Twin
│              │  Sets up: 70→90 GSM scenario
│              │  Tests: Scenario A (current ramp) vs Scenario B (15% slower ramp)
│              │  Result: Scenario B reduces peak deviation from 3.2% to 1.8%
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  5. REPORT   │  Generates Grade Performance Report for 70→90 GSM
│              │  Downloads PDF with evidence
│              │  Schedules meeting with shift supervisors to update SOPs
└──────────────┘

Duration: 20-40 minutes
Outcome: Data-driven process improvement recommendation
```

## 6.4 Journey: Shift Supervisor Reviews AI Performance

```
┌──────────────┐
│  1. MODEL    │  Supervisor opens Model Health
│  HEALTH      │  Reviews: prediction accuracy 91% (30-day), no drift detected
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  2. FEEDBACK │  Opens Operator Feedback Review
│              │  Reviews: accept rate by operator
│              │  Notices: OP-1055 has rejected last 8 recommendations
│              │  E7 flag: "Habitual Reject pattern detected"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  3. AUDIT    │  Opens Audit Log filtered for OP-1055
│              │  Reviews rejection reasons: all "Not applicable"
│              │  Decision: Schedule 1:1 coaching session
└──────────────┘
```

---

# 7. State Specifications

## 7.1 Universal State Patterns

### Loading State

| Component Type | Loading Display | Duration Threshold |
|---|---|---|
| **KPI Card** | Skeleton card with shimmer animation; exact same dimensions as loaded card | < 2 seconds |
| **Chart** | Empty axis frame with "Loading data..." centered; skeleton shimmer across chart area | < 3 seconds |
| **Table** | 5 skeleton rows with shimmer; column headers visible | < 3 seconds |
| **Panel** | Skeleton block matching panel height | < 2 seconds |
| **Full Page** | All above combined; sidebar and top bar remain active | < 5 seconds |

**If loading exceeds threshold:** Show timeout message: "Data is taking longer than expected. [Retry] [Report Issue]"

### Empty State

Every screen that can be empty has a designed empty state with:
1. **Relevant illustration** (abstract geometric, not cartoon — matches industrial tone)
2. **Descriptive message** explaining why it's empty
3. **Suggested action** (if applicable)
4. **No broken layouts** — empty state fills the same space as populated content

### Error State

| Error Type | Display | Recovery |
|---|---|---|
| **Data feed offline** | Yellow banner: "⚠ Live data feed interrupted. Last update: [timestamp]". Data freezes at last known values with "STALE" badges. | Auto-retry every 5 seconds with exponential backoff. "Retry Now" button. |
| **Service unavailable** | Red banner: "A service is experiencing issues. Some features may be unavailable." Affected panels show error icon + "Service Temporarily Unavailable". | Auto-retry. Unaffected panels continue to function. |
| **Authentication expired** | Modal overlay: "Your session has expired. Please sign in again." | Redirect to login. Preserve current URL for post-login redirect. |
| **Prediction failed** | Prediction-specific banner: "Prediction engine returned an error. Manual monitoring recommended." Root cause and recommendation panels show fallback. | Auto-retry on next cycle. Alert admin via notification. |
| **Network timeout** | Toast notification: "Network request timed out. Retrying..." | Auto-retry with exponential backoff (max 30s). |

---

# 8. Screen Prioritization

## Must Have (Phase 1)

| Screen | Justification |
|---|---|
| **Login & Authentication** | Required for 21 CFR Part 11 compliance; identity attribution for all actions |
| **Overview Dashboard** | Entry point; shift handover context; machine status at a glance |
| **Live Grade Change** | Core product value — real-time AI advisory during the most critical operational event |
| **Historical Analysis** | Operators and engineers need to review past transitions; provides training data visibility |
| **Alerts & Alarms** | Alarm management is a baseline requirement for any process control application |
| **Audit Log** | Required for regulatory compliance (21 CFR Part 11); immutable action trail |
| **Settings** | Minimum: display preferences, alert thresholds, user management |

## Should Have (Phase 2)

| Screen | Justification |
|---|---|
| **Prediction Center** | Builds trust through transparency; engineers validate model accuracy |
| **Recommendation Center** | Feedback analysis enables continuous improvement of AI recommendations |
| **Digital Twin Simulator** | Allows verification before action; high operator confidence value |
| **Similarity Search** | Proactive research tool for engineers; extends the reactive similarity in Live GC |
| **Machine Detail** | Deep process monitoring; replaces need to switch to separate DCS trending tools |
| **Reports** | Structured reporting for management and quality reviews |
| **Operator Feedback Review** | Feedback analysis; E7 safeguard visibility for supervisors |
| **Model Health & Admin** | Essential for production AI management; drift detection visibility |

## Future (Phase 3)

| Screen | Justification |
|---|---|
| **Multi-Machine View** | Aggregate dashboard across multiple paper machines at same site |
| **Multi-Mill Federation** | Cross-site analytics and model sharing |
| **Mobile Notifications** | Push alerts to operators' mobile devices for field awareness |
| **Natural Language Query** | "Show me all failed transitions in the last 3 months with steam pressure as root cause" |
| **Recipe Optimization Studio** | AI-assisted recipe development using Digital Twin and historical data |
| **Training Mode** | Replay historical transitions for new operator training with AI advisory simulation |

---

# Appendix A: Widget Interaction Summary

| Widget | Primary Interaction | Secondary Interaction | Keyboard Shortcut |
|---|---|---|---|
| KPI Card | Click → expand detail | — | — |
| Chart | Hover → tooltip | Click+drag → zoom; scroll → zoom | `R` to reset zoom |
| Table Row | Click → expand/navigate | Shift+Click → multi-select | Arrow keys to navigate |
| ACCEPT Button | Click → confirm modal | — | `A` (when recommendation panel is focused) |
| REJECT Button | Click → reason modal | — | `X` (when recommendation panel is focused) |
| Sidebar Nav | Click → navigate | — | `1`–`0` for nav items 1–10 |
| Toggle Button | Click → toggle | — | — |
| Filter Dropdown | Click → open options | Type to search | — |
| Notification Bell | Click → open drawer | — | `N` |
| Sidebar Collapse | Click hamburger | — | `[` to toggle |

---

# Appendix B: Data Flow Summary per Screen

| Screen | Real-Time (WebSocket) | Polling (REST/gRPC) | Event-Driven | Static |
|---|---|---|---|---|
| Login | — | — | — | Machine config |
| Overview | M1 process data | M7 shift history (30s), M8 model status (60s) | M2 transition events | Quick action links |
| Live GC | M1 BW data (1s), Alarms | M3 prediction (5s), M10 confidence (5s), M12 root cause (5s), M13 timeline (5s) | M2 transition state, M4 recommendation | M11 similarity (once) |
| Prediction Center | — | M8 accuracy metrics (60s) | — | M7 historical predictions |
| Digital Twin | — | M9 simulation (on-demand) | — | M7 process constraints |
| Historical Analysis | — | — | — | M7 transition history |
| Similarity Search | — | M11 similarity (on-demand) | — | — |
| Machine Detail | M1 all process data (1s) | — | — | Tag config |
| Alerts | Alarm events (real-time) | — | — | — |
| Feedback Review | — | M6 feedback records (30s) | — | — |
| Reports | — | Report generation (on-demand) | — | — |
| Model Health | — | M8 all metrics (60s) | Drift alerts | — |
| Audit Log | — | Audit records (on-demand) | — | — |
| Settings | — | — | — | Config values |
