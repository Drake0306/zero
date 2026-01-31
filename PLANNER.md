# Zero — Project Tracker

## Status: Ollama Agent Integration Complete

---

## Phase 1 — MVP (Complete)

- [x] Fluent Design System 2 tokens (light + dark mode)
- [x] Global CSS resets and typography
- [x] Mock auth store with Svelte 5 runes
- [x] UI primitives: Button, Input, Divider, Avatar, IconButton
- [x] Login page with Google sign-in and email buttons
- [x] Dashboard layout: AppShell + TopBar + collapsible Sidebars
- [x] Chat components: ChatWindow, ChatMessage, ChatInput
- [x] Dashboard page with mock chat, sidebar history, and details panel
- [x] Auth guard routing (login ↔ dashboard)
- [x] Tauri window config (1200×800)
- [x] Inline SVG icons (hamburger, send, settings, logout, Google G, plus)
- [x] Sidebar slide transitions
- [x] Dark mode via `prefers-color-scheme`

---

## Phase 2 — Ollama Agent Integration (Complete)

### Types & Stores
- [x] Shared TypeScript types (`src/lib/types.ts`) — Message, AgentTask, PermissionMode, Ollama types
- [x] Chat store (`src/lib/stores/chat.svelte.ts`) — messages, workspace path
- [x] Agent store (`src/lib/stores/agent.svelte.ts`) — tasks, permission mode, confirmation Promise flow

### Rust Backend — File Commands
- [x] Path traversal guard (`resolve_safe_path`) via `canonicalize` check
- [x] 5 Tauri commands: `read_file`, `write_file`, `list_directory`, `create_directory`, `delete_file`
- [x] `tauri-plugin-dialog` added (Cargo.toml + capabilities + npm)
- [x] Removed old `greet` command

### Ollama Integration
- [x] Tool definitions (`src/lib/services/tools.ts`) — 5 tools in Ollama JSON schema format
- [x] Tool executor (`src/lib/services/toolExecutor.ts`) — frontend-to-Tauri invoke bridge
- [x] Streaming HTTP client (`src/lib/services/ollama.ts`) — fetch + ReadableStream for `/api/chat`
- [x] Agent loop orchestrator (`src/lib/services/agentLoop.ts`) — stream + tool call loop with ask/auto modes

### Agent UI Components
- [x] `AgentActivityPanel.svelte` — right sidebar task list with status icons (spinner/check/x)
- [x] `PermissionToggle.svelte` — ask/auto toggle button in TopBar
- [x] `ToolConfirmationDialog.svelte` — modal for ask-mode tool approval

### Wiring & Modifications
- [x] `ChatMessage.svelte` — streaming cursor, tool message hiding, `white-space: pre-wrap`
- [x] `ChatWindow.svelte` — uses shared `Message` type, disables input while agent runs
- [x] `ChatInput.svelte` — added `disabled` prop
- [x] `IconButton.svelte` — added `disabled` prop
- [x] `TopBar.svelte` — PermissionToggle + workspace folder picker (native OS dialog)
- [x] `+page.svelte` (dashboard) — replaced mock chat with `runAgentLoop()`, right sidebar = AgentActivityPanel, ToolConfirmationDialog overlay

### Verification
- [x] `npm run check` — 0 errors, 0 warnings
- [x] `cargo check` — compiles cleanly

---

## Architecture
- **Frontend:** SvelteKit 2 + Svelte 5 (Runes) + TypeScript
- **Backend:** Tauri 2 (Rust)
- **LLM:** Ollama (`llama3.2:1b`) via streaming HTTP (`localhost:11434`)
- **Styling:** Custom CSS with Fluent Design System 2 tokens
- **Auth:** Mock (UI only)
- **Agent Tools:** Filesystem ops (read, write, list, mkdir, delete) via Tauri commands
- **Permission Modes:** Ask (confirmation dialog) / Auto (immediate execution)

## Routes
| Route | Page |
|-------|------|
| `/` | Login |
| `/dashboard` | Chat Dashboard + Agent |

## Key Files
- `src/lib/styles/tokens.css` — Design tokens
- `src/lib/types.ts` — Shared TypeScript types
- `src/lib/stores/auth.svelte.ts` — Auth state
- `src/lib/stores/chat.svelte.ts` — Chat messages + workspace path
- `src/lib/stores/agent.svelte.ts` — Agent tasks + permission mode
- `src/lib/services/ollama.ts` — Ollama streaming client
- `src/lib/services/agentLoop.ts` — Agent orchestrator
- `src/lib/services/tools.ts` — Tool definitions
- `src/lib/services/toolExecutor.ts` — Tool execution bridge
- `src/lib/components/agent/` — AgentActivityPanel, PermissionToggle, ToolConfirmationDialog
- `src/lib/components/chat/` — ChatWindow, ChatMessage, ChatInput
- `src/lib/components/layout/` — AppShell, Sidebar, TopBar
- `src-tauri/src/lib.rs` — Rust file commands + dialog plugin
- `src/routes/dashboard/+page.svelte` — Dashboard page

## Notes
- `llama3.2:1b` may produce unreliable tool calls — upgrade to 3b+ if tools don't trigger consistently
- Ollama calls go directly from frontend (Tauri CSP is null) — no proxy needed
- Workspace folder selected via native OS picker (`@tauri-apps/plugin-dialog`)
