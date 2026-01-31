<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    topbar,
    leftSidebar,
    rightSidebar,
    children,
  }: {
    topbar: Snippet;
    leftSidebar?: Snippet;
    rightSidebar?: Snippet;
    children: Snippet;
  } = $props();
</script>

<div class="app-shell">
  <div class="app-shell-topbar">
    {@render topbar()}
  </div>
  <div class="app-shell-body">
    {#if leftSidebar}
      {@render leftSidebar()}
    {/if}
    <main class="app-shell-content">
      {@render children()}
    </main>
    {#if rightSidebar}
      {@render rightSidebar()}
    {/if}
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .app-shell-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .app-shell-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
