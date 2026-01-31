<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte';

  let {
    content,
    sender,
    initials,
    timestamp,
    isStreaming = false,
  }: {
    content: string;
    sender: 'user' | 'assistant' | 'tool';
    initials: string;
    timestamp: string;
    isStreaming?: boolean;
  } = $props();
</script>

{#if sender === 'tool'}
  <!-- Tool messages are hidden from chat display -->
{:else}
  <div class="message message-{sender}">
    <Avatar {initials} size="small" />
    <div class="bubble">
      <p class="text">{content}{#if isStreaming}<span class="cursor">|</span>{/if}</p>
      <span class="time">{timestamp}</span>
    </div>
  </div>
{/if}

<style>
  .message {
    display: flex;
    gap: var(--spacing-s);
    max-width: 70%;
    align-items: flex-start;
  }

  .message-user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .message-assistant {
    align-self: flex-start;
  }

  .bubble {
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: var(--radius-large);
    word-break: break-word;
  }

  .message-user .bubble {
    background: var(--brand-primary);
    color: var(--brand-primary-text);
    border-bottom-right-radius: var(--radius-small);
  }

  .message-assistant .bubble {
    background: var(--neutral-background-3);
    color: var(--neutral-foreground-1);
    border-bottom-left-radius: var(--radius-small);
  }

  .text {
    margin: 0;
    font-size: var(--font-size-300);
    line-height: var(--line-height-300);
    white-space: pre-wrap;
  }

  .cursor {
    animation: blink 0.8s step-end infinite;
    font-weight: var(--font-weight-bold);
    color: var(--brand-primary);
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .time {
    display: block;
    font-size: var(--font-size-100);
    color: var(--neutral-foreground-3);
    margin-top: var(--spacing-xs);
    text-align: right;
  }

  .message-user .time {
    color: rgba(255, 255, 255, 0.7);
  }
</style>
