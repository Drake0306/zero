<script lang="ts">
  import type { Snippet } from 'svelte';
  import { slide } from 'svelte/transition';

  let {
    side = 'left',
    width = 260,
    open = $bindable(true),
    children,
  }: {
    side?: 'left' | 'right';
    width?: number;
    open?: boolean;
    children: Snippet;
  } = $props();
</script>

{#if open}
  <aside
    class="sidebar sidebar-{side}"
    style="width: {width}px"
    transition:slide={{ axis: 'x', duration: 200 }}
  >
    <div class="sidebar-content">
      {@render children()}
    </div>
  </aside>
{/if}

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--neutral-background-2);
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
  }

  .sidebar-left {
    border-right: 1px solid var(--neutral-stroke-2);
  }

  .sidebar-right {
    border-left: 1px solid var(--neutral-stroke-2);
  }

  .sidebar-content {
    padding: var(--spacing-l);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
  }
</style>
