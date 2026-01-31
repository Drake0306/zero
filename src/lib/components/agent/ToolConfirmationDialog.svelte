<script lang="ts">
  import { getPendingConfirmation, respondToConfirmation } from '$lib/stores/agent.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let pending = $derived(getPendingConfirmation());
</script>

{#if pending}
  <div class="overlay">
    <div class="dialog">
      <h3 class="dialog-title">Tool Confirmation</h3>
      <p class="dialog-desc">The agent wants to execute:</p>
      <div class="tool-info">
        <span class="tool-name">{pending.toolName}</span>
        <pre class="tool-args">{JSON.stringify(pending.args, null, 2)}</pre>
      </div>
      <div class="dialog-actions">
        <Button variant="secondary" onclick={() => respondToConfirmation(false)}>Deny</Button>
        <Button variant="primary" onclick={() => respondToConfirmation(true)}>Allow</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: var(--neutral-background-1);
    border-radius: var(--radius-xlarge);
    padding: var(--spacing-xxl);
    max-width: 440px;
    width: 90%;
    box-shadow: var(--shadow-28);
  }

  .dialog-title {
    font-size: var(--font-size-500);
    font-weight: var(--font-weight-semibold);
    color: var(--neutral-foreground-1);
    margin-bottom: var(--spacing-s);
  }

  .dialog-desc {
    font-size: var(--font-size-300);
    color: var(--neutral-foreground-2);
    margin-bottom: var(--spacing-m);
  }

  .tool-info {
    background: var(--neutral-background-3);
    border-radius: var(--radius-medium);
    padding: var(--spacing-m);
    margin-bottom: var(--spacing-l);
  }

  .tool-name {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-300);
    font-weight: var(--font-weight-semibold);
    color: var(--brand-primary);
  }

  .tool-args {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-200);
    color: var(--neutral-foreground-2);
    margin-top: var(--spacing-s);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-s);
  }
</style>
