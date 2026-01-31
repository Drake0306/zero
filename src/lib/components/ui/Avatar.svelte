<script lang="ts">
  let {
    initials,
    size = 'medium',
  }: {
    initials: string;
    size?: 'small' | 'medium';
  } = $props();
</script>

<div class="avatar avatar-{size}">
  <span>{initials}</span>
</div>

<style>
  .avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-circular);
    background: var(--brand-primary);
    color: var(--brand-primary-text);
    font-weight: var(--font-weight-semibold);
    flex-shrink: 0;
    user-select: none;
  }

  .avatar-small {
    width: 24px;
    height: 24px;
    font-size: var(--font-size-100);
  }

  .avatar-medium {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-200);
  }
</style>
