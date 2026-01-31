<script lang="ts">
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import { logout, getUserName } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';

  let {
    onToggleSidebar,
  }: {
    onToggleSidebar?: () => void;
  } = $props();

  function handleLogout() {
    logout();
    goto('/');
  }

  let initials = $derived(
    getUserName()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  );
</script>

<header class="topbar">
  <div class="topbar-left">
    <IconButton ariaLabel="Toggle sidebar" onclick={onToggleSidebar}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 4.5h16a.5.5 0 0 1 0 1H2a.5.5 0 0 1 0-1zm0 5h16a.5.5 0 0 1 0 1H2a.5.5 0 0 1 0-1zm0 5h16a.5.5 0 0 1 0 1H2a.5.5 0 0 1 0-1z"/>
      </svg>
    </IconButton>
    <span class="brand">Zero</span>
  </div>

  <div class="topbar-right">
    <IconButton ariaLabel="Settings">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm1.433-7.926a.5.5 0 0 1 .497.435l.216 1.61a5.53 5.53 0 0 1 1.15.665l1.533-.541a.5.5 0 0 1 .607.22l1.433 2.483a.5.5 0 0 1-.11.655l-1.317 1.07a5.6 5.6 0 0 1 0 1.33l1.317 1.069a.5.5 0 0 1 .11.655l-1.433 2.483a.5.5 0 0 1-.607.22l-1.534-.541a5.53 5.53 0 0 1-1.149.665l-.216 1.61a.5.5 0 0 1-.497.435h-2.866a.5.5 0 0 1-.497-.435l-.216-1.61a5.53 5.53 0 0 1-1.15-.665l-1.533.541a.5.5 0 0 1-.607-.22L4.131 13.92a.5.5 0 0 1 .11-.655l1.317-1.07a5.6 5.6 0 0 1 0-1.33L4.24 9.798a.5.5 0 0 1-.11-.655l1.434-2.483a.5.5 0 0 1 .607-.22l1.533.542a5.53 5.53 0 0 1 1.15-.666l.216-1.61a.5.5 0 0 1 .497-.435h2.866z"/>
      </svg>
    </IconButton>
    <Avatar {initials} size="small" />
    <IconButton ariaLabel="Logout" onclick={handleLogout}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.5 3a.5.5 0 0 0 0 1h4a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-4a.5.5 0 0 0 0 1h4A1.5 1.5 0 0 0 16 15.5v-11A1.5 1.5 0 0 0 14.5 3h-4zm-3.146 2.146a.5.5 0 0 1 .708.708L5.707 8.207h6.793a.5.5 0 0 1 0 1H5.707l2.355 2.354a.5.5 0 0 1-.708.708l-3.207-3.208a.497.497 0 0 1 0-.707l3.207-3.208z" fill-rule="evenodd" clip-rule="evenodd"/>
      </svg>
    </IconButton>
  </div>
</header>

<style>
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 var(--spacing-m);
    background: var(--neutral-background-1);
    border-bottom: 1px solid var(--neutral-stroke-2);
    flex-shrink: 0;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-m);
  }

  .brand {
    font-size: var(--font-size-400);
    font-weight: var(--font-weight-bold);
    color: var(--neutral-foreground-1);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
  }
</style>
