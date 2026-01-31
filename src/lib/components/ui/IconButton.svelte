<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick,
    ariaLabel,
    disabled = false,
    children,
  }: {
    onclick?: () => void;
    ariaLabel: string;
    disabled?: boolean;
    children: Snippet;
  } = $props();
</script>

<button class="icon-btn" {onclick} aria-label={ariaLabel} {disabled}>
  {@render children()}
</button>

<style>
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-medium);
    background: var(--neutral-background-subtle);
    color: var(--neutral-foreground-1);
    cursor: pointer;
    transition: background var(--duration-fast) var(--curve-easy-ease);
  }

  .icon-btn:hover:not(:disabled) {
    background: var(--neutral-background-subtle-hover);
  }

  .icon-btn:active:not(:disabled) {
    background: var(--neutral-background-subtle-active);
  }

  .icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
