<script lang="ts">
  import '../app.css';
  import { isLoggedIn } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    const path = page.url.pathname;
    if (path.startsWith('/dashboard') && !isLoggedIn()) {
      goto('/');
    }
  });
</script>

{@render children()}
