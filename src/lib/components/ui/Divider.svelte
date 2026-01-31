<script lang="ts">
  let { label = '' }: { label?: string } = $props();
</script>

<div class="divider" role="separator">
  {#if label}
    <span class="divider-label">{label}</span>
  {/if}
</div>

<style>
  .divider {
    display: flex;
    align-items: center;
    width: 100%;
    gap: var(--spacing-m);
    color: var(--neutral-foreground-3);
    font-size: var(--font-size-200);
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--neutral-stroke-2);
  }

  .divider:not(:has(.divider-label))::after {
    display: none;
  }

  .divider-label {
    white-space: nowrap;
  }
</style>
