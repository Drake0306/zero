<script lang="ts">
  import LoginCard from '$lib/components/login/LoginCard.svelte';
  import { isLoggedIn } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';

  $effect(() => {
    if (isLoggedIn()) {
      goto('/dashboard');
    }
  });
</script>

<div class="login-page">
  <LoginCard />
</div>

<style>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background: var(--neutral-background-2);
  }
</style>
