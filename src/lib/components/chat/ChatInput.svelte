<script lang="ts">
  import IconButton from '$lib/components/ui/IconButton.svelte';

  let {
    value = $bindable(''),
    onSend,
    disabled = false,
  }: {
    value?: string;
    onSend?: (message: string) => void;
    disabled?: boolean;
  } = $props();

  function handleSend() {
    const trimmed = value.trim();
    if (trimmed && onSend && !disabled) {
      onSend(trimmed);
      value = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="chat-input">
  <textarea
    class="textarea"
    bind:value
    placeholder={disabled ? 'Agent is thinking...' : 'Type a message...'}
    rows="1"
    onkeydown={handleKeydown}
    {disabled}
  ></textarea>
  <IconButton ariaLabel="Send message" onclick={handleSend} disabled={disabled || !value.trim()}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.724 2.053a.5.5 0 0 1 .547-.03l14.5 8.5a.5.5 0 0 1 0 .854l-14.5 8.5a.5.5 0 0 1-.737-.48V12.5l8.5-2.5-8.5-2.5V2.534a.5.5 0 0 1 .19-.48z"/>
    </svg>
  </IconButton>
</div>

<style>
  .chat-input {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-s);
    padding: var(--spacing-m) var(--spacing-l);
    border-top: 1px solid var(--neutral-stroke-2);
    background: var(--neutral-background-1);
  }

  .textarea {
    flex: 1;
    resize: none;
    border: 1px solid var(--neutral-stroke-1);
    border-radius: var(--radius-medium);
    padding: var(--spacing-s) var(--spacing-m);
    font-size: var(--font-size-300);
    line-height: var(--line-height-300);
    background: var(--neutral-background-1);
    color: var(--neutral-foreground-1);
    min-height: 36px;
    max-height: 120px;
    field-sizing: content;
  }

  .textarea::placeholder {
    color: var(--neutral-foreground-3);
  }

  .textarea:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 1px var(--brand-primary);
  }

  .textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
