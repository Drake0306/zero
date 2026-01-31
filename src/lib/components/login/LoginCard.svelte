<script lang="ts">
  import GoogleButton from './GoogleButton.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Divider from '$lib/components/ui/Divider.svelte';
  import { login } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';

  function handleLogin() {
    login('User');
    goto('/dashboard');
  }
</script>

<div class="card">
  <div class="logo">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="var(--brand-primary)"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
            fill="var(--brand-primary-text)" font-size="20" font-weight="700">Z</text>
    </svg>
  </div>

  <h1 class="title">Zero</h1>
  <p class="subtitle">Sign in to continue to Zero</p>

  <div class="actions">
    <GoogleButton onclick={handleLogin} />

    <Divider label="or" />

    <Button variant="secondary" onclick={handleLogin}>
      Continue with Email
    </Button>
  </div>

  <p class="signup">
    Don't have an account? <a href="/" onclick={handleLogin}>Sign up</a>
  </p>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xxl);
    width: 100%;
    max-width: 400px;
    padding: var(--spacing-xxxl) var(--spacing-xxl);
    background: var(--neutral-background-1);
    border: 1px solid var(--neutral-stroke-2);
    border-radius: var(--radius-xlarge);
    box-shadow: var(--shadow-16);
  }

  .logo {
    display: flex;
  }

  .title {
    font-size: var(--font-size-700);
    font-weight: var(--font-weight-bold);
    color: var(--neutral-foreground-1);
    margin-top: calc(-1 * var(--spacing-l));
  }

  .subtitle {
    font-size: var(--font-size-300);
    color: var(--neutral-foreground-2);
    margin-top: calc(-1 * var(--spacing-l));
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-l);
    width: 100%;
  }

  .actions :global(.btn) {
    width: 100%;
  }

  .signup {
    font-size: var(--font-size-200);
    color: var(--neutral-foreground-2);
  }

  .signup a {
    color: var(--brand-primary);
    font-weight: var(--font-weight-semibold);
  }
</style>
