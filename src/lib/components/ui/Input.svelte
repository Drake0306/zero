<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = '',
    type = 'text',
  }: {
    value?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password';
  } = $props();
</script>

<input class="input" bind:value {placeholder} {type} />

<style>
  .input {
    width: 100%;
    padding: var(--spacing-s) var(--spacing-m);
    border: 1px solid var(--neutral-stroke-1);
    border-radius: var(--radius-medium);
    background: var(--neutral-background-1);
    color: var(--neutral-foreground-1);
    font-size: var(--font-size-300);
    line-height: var(--line-height-300);
    min-height: 32px;
    transition: border-color var(--duration-fast) var(--curve-easy-ease);
  }

  .input::placeholder {
    color: var(--neutral-foreground-3);
  }

  .input:hover {
    border-color: var(--neutral-stroke-accessible);
  }

  .input:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 1px var(--brand-primary);
  }
</style>
