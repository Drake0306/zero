<script lang="ts">
  import type { Message } from "$lib/types";
  import ChatMessage from "./ChatMessage.svelte";
  import ChatInput from "./ChatInput.svelte";
  import ModelSelector from "./ModelSelector.svelte";
  import CapabilityToggles from "./CapabilityToggles.svelte";
  import PermissionToggle from "$lib/components/agent/PermissionToggle.svelte";
  import { getIsAgentRunning } from "$lib/stores/agent.svelte";
  import { getWorkspacePath, setWorkspacePath } from "$lib/stores/chat.svelte";

  let {
    messages,
    onSend,
  }: {
    messages: Message[];
    onSend?: (message: string) => void;
  } = $props();

  let scrollContainer: HTMLDivElement;
  let inputValue = $state("");
  let isRunning = $derived(getIsAgentRunning());
  let hasWorkspace = $derived(!!getWorkspacePath());
  let workspaceName = $derived(() => {
    const wp = getWorkspacePath();
    if (!wp) return "";
    const parts = wp.split(/[\\/]/);
    return parts[parts.length - 1] || wp;
  });

  $effect(() => {
    // Track messages length to auto-scroll
    messages.length;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });

  async function pickWorkspace() {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        directory: true,
        title: "Select Workspace Folder",
      });
      if (selected && typeof selected === "string") {
        setWorkspacePath(selected);
      }
    } catch {
      // Browser fallback: File System Access API
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: "read",
        });
        setWorkspacePath(dirHandle.name);
      } catch {
        // User cancelled the picker
      }
    }
  }
</script>

<div class="chat-window">
  {#if !hasWorkspace}
    <div class="welcome">
      <div class="welcome-content">
        <div class="welcome-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
            <path
              d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 36c-8.837 0-16-7.163-16-16S15.163 8 24 8s16 7.163 16 16-7.163 16-16 16z"
            />
            <path d="M24 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-1 8v10h2V22h-2z" />
          </svg>
        </div>
        <h2 class="welcome-title">Welcome to Zero</h2>
        <p class="welcome-subtitle">Select a workspace folder to get started</p>
        <button class="welcome-btn" onclick={pickWorkspace}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M1 4.5A2.5 2.5 0 0 1 3.5 2h3.672a1.5 1.5 0 0 1 1.06.44l1.122 1.12A.5.5 0 0 0 9.707 3.7H16.5A2.5 2.5 0 0 1 19 6.2v8.3a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 1 14.5v-10z"
            />
          </svg>
          Open Folder
        </button>
      </div>
    </div>
    <ChatInput bind:value={inputValue} {onSend} disabled={true} />
  {:else}
    <div class="messages" bind:this={scrollContainer}>
      {#each messages as msg (msg.id)}
        <ChatMessage
          content={msg.content}
          sender={msg.sender}
          initials={msg.initials}
          timestamp={msg.timestamp}
          isStreaming={msg.isStreaming}
        />
      {/each}
      {#if messages.length === 0}
        <div class="empty">
          <p class="empty-title">No messages yet</p>
          <p class="empty-subtitle">
            Start a conversation by typing a message below.
          </p>
        </div>
      {/if}
    </div>
    <div class="chat-toolbar">
      <div class="toolbar-left">
        <button
          class="workspace-btn"
          onclick={pickWorkspace}
          title={getWorkspacePath() || "Select workspace"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.172a1.5 1.5 0 0 1 1.06.44l.829.828a.5.5 0 0 0 .354.147H13.5A1.5 1.5 0 0 1 15 4.915V12.5A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5v-9z"
            />
          </svg>
          <span class="workspace-name">{workspaceName() || "No workspace"}</span
          >
        </button>
        <CapabilityToggles />
      </div>
      <PermissionToggle />
    </div>
    <ModelSelector />
    <ChatInput bind:value={inputValue} {onSend} disabled={isRunning} />
  {/if}
</div>

<style>
  .chat-window {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-l);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    color: var(--neutral-foreground-3);
  }

  .empty-title {
    font-size: var(--font-size-400);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-xs);
  }

  .empty-subtitle {
    font-size: var(--font-size-300);
  }

  .chat-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-xs) var(--spacing-l);
    gap: var(--spacing-m);
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
    flex-wrap: wrap;
  }

  .workspace-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-s);
    border: 1px solid var(--neutral-stroke-2);
    border-radius: var(--radius-medium);
    background: var(--neutral-background-subtle);
    color: var(--neutral-foreground-2);
    font-size: var(--font-size-200);
    cursor: pointer;
    transition: all var(--duration-fast) var(--curve-easy-ease);
    max-width: 200px;
  }

  .workspace-btn:hover {
    background: var(--neutral-background-subtle-hover);
    color: var(--neutral-foreground-1);
  }

  .workspace-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .welcome {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--spacing-m);
  }

  .welcome-icon {
    color: var(--brand-primary);
  }

  .welcome-title {
    font-size: var(--font-size-600);
    font-weight: var(--font-weight-bold);
    color: var(--neutral-foreground-1);
    margin: 0;
  }

  .welcome-subtitle {
    font-size: var(--font-size-300);
    color: var(--neutral-foreground-3);
    margin: 0;
  }

  .welcome-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
    padding: var(--spacing-s) var(--spacing-l);
    border: none;
    border-radius: var(--radius-medium);
    background: var(--brand-primary);
    color: white;
    font-size: var(--font-size-300);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: background var(--duration-fast) var(--curve-easy-ease);
  }

  .welcome-btn:hover {
    background: var(--brand-hover);
  }
</style>
