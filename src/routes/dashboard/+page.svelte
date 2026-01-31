<script lang="ts">
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import TopBar from '$lib/components/layout/TopBar.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import AgentActivityPanel from '$lib/components/agent/AgentActivityPanel.svelte';
  import ToolConfirmationDialog from '$lib/components/agent/ToolConfirmationDialog.svelte';
  import { isLoggedIn } from '$lib/stores/auth.svelte';
  import { getMessages, clearMessages } from '$lib/stores/chat.svelte';
  import { clearTasks } from '$lib/stores/agent.svelte';
  import { runAgentLoop } from '$lib/services/agentLoop';
  import { goto } from '$app/navigation';

  $effect(() => {
    if (!isLoggedIn()) {
      goto('/');
    }
  });

  let leftOpen = $state(true);
  let rightOpen = $state(true);

  let messages = $derived(getMessages());

  const chatHistory = [
    { id: 1, title: 'Getting started with Zero', date: 'Today' },
    { id: 2, title: 'Project architecture', date: 'Today' },
    { id: 3, title: 'Design system tokens', date: 'Yesterday' },
    { id: 4, title: 'Deployment strategy', date: 'Yesterday' },
    { id: 5, title: 'API integration notes', date: 'Last week' },
  ];

  function handleSend(content: string) {
    runAgentLoop(content);
  }

  function handleNewChat() {
    clearMessages();
    clearTasks();
  }
</script>

<AppShell>
  {#snippet topbar()}
    <TopBar onToggleSidebar={() => (leftOpen = !leftOpen)} />
  {/snippet}

  {#snippet leftSidebar()}
    <Sidebar side="left" width={260} bind:open={leftOpen}>
      <Button variant="primary" onclick={handleNewChat}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 4px">
          <path d="M8 2.5a.5.5 0 0 1 .5.5v4.5H13a.5.5 0 0 1 0 1H8.5V13a.5.5 0 0 1-1 0V8.5H3a.5.5 0 0 1 0-1h4.5V3a.5.5 0 0 1 .5-.5z"/>
        </svg>
        New Chat
      </Button>

      <div class="chat-history">
        {#each chatHistory as chat (chat.id)}
          <button class="chat-history-item">
            <span class="chat-title">{chat.title}</span>
            <span class="chat-date">{chat.date}</span>
          </button>
        {/each}
      </div>
    </Sidebar>
  {/snippet}

  {#snippet rightSidebar()}
    <Sidebar side="right" width={240} bind:open={rightOpen}>
      <AgentActivityPanel />
    </Sidebar>
  {/snippet}

  <ChatWindow {messages} onSend={handleSend} />
</AppShell>

<ToolConfirmationDialog />

<style>
  .chat-history {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xxs);
  }

  .chat-history-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xxs);
    padding: var(--spacing-s) var(--spacing-m);
    border: none;
    border-radius: var(--radius-medium);
    background: transparent;
    color: var(--neutral-foreground-1);
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background var(--duration-fast) var(--curve-easy-ease);
  }

  .chat-history-item:hover {
    background: var(--neutral-background-subtle-hover);
  }

  .chat-title {
    font-size: var(--font-size-300);
    line-height: var(--line-height-300);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .chat-date {
    font-size: var(--font-size-100);
    color: var(--neutral-foreground-3);
  }
</style>
