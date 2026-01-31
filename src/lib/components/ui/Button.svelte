<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'primary',
    onclick,
    disabled = false,
    children,
  }: {
    variant?: 'primary' | 'secondary' | 'subtle';
    onclick?: () => void;
    disabled?: boolean;
    children: Snippet;
  } = $props();
</script>

<button class="btn btn-{variant}" {onclick} {disabled}>
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-s);
    padding: var(--spacing-s) var(--spacing-l);
    border-radius: var(--radius-medium);
    font-size: var(--font-size-300);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-300);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background var(--duration-fast) var(--curve-easy-ease),
                border-color var(--duration-fast) var(--curve-easy-ease);
    min-height: 32px;
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .btn-primary {
    background: var(--brand-primary);
    color: var(--brand-primary-text);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--brand-primary-hover);
  }
  .btn-primary:active:not(:disabled) {
    background: var(--brand-primary-active);
  }

  .btn-secondary {
    background: var(--neutral-background-1);
    color: var(--neutral-foreground-1);
    border-color: var(--neutral-stroke-1);
  }
  .btn-secondary:hover:not(:disabled) {
    background: var(--neutral-background-subtle-hover);
  }
  .btn-secondary:active:not(:disabled) {
    background: var(--neutral-background-subtle-active);
  }

  .btn-subtle {
    background: var(--neutral-background-subtle);
    color: var(--neutral-foreground-1);
  }
  .btn-subtle:hover:not(:disabled) {
    background: var(--neutral-background-subtle-hover);
  }
  .btn-subtle:active:not(:disabled) {
    background: var(--neutral-background-subtle-active);
  }
</style>
