<script lang="ts">
  import { getPermissionMode, setPermissionMode } from '$lib/stores/agent.svelte';

  let mode = $derived(getPermissionMode());

  function toggle() {
    setPermissionMode(mode === 'ask' ? 'auto' : 'ask');
  }
</script>

<button class="permission-toggle" class:auto={mode === 'auto'} onclick={toggle} title="Toggle permission mode: {mode}">
  {#if mode === 'ask'}
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a4 4 0 0 0-4 4v3H3.5A1.5 1.5 0 0 0 2 9.5v5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12.5 8H12V5a4 4 0 0 0-4-4zm3 7H5V5a3 3 0 1 1 6 0v3z"/>
    </svg>
    <span class="mode-label">Ask</span>
  {:else}
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 1a3 3 0 0 0-3 3v4H3.5A1.5 1.5 0 0 0 2 9.5v5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12.5 8H9V4a2 2 0 1 1 4 0v1a.5.5 0 0 0 1 0V4a3 3 0 0 0-3-3z"/>
    </svg>
    <span class="mode-label">Auto</span>
  {/if}
</button>

<style>
  .permission-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-s);
    border: 1px solid var(--neutral-stroke-1);
    border-radius: var(--radius-medium);
    background: var(--neutral-background-1);
    color: var(--neutral-foreground-2);
    font-size: var(--font-size-200);
    cursor: pointer;
    transition: all var(--duration-fast) var(--curve-easy-ease);
  }

  .permission-toggle:hover {
    background: var(--neutral-background-subtle-hover);
    color: var(--neutral-foreground-1);
  }

  .permission-toggle.auto {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
  }

  .mode-label {
    font-weight: var(--font-weight-semibold);
  }
</style>
