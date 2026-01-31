<script lang="ts">
  import { getTasks } from '$lib/stores/agent.svelte';
  import { getMessages, getSelectedModel } from '$lib/stores/chat.svelte';

  let tasks = $derived(getTasks());
  let messageCount = $derived(getMessages().length);
  let currentModel = $derived(getSelectedModel());
</script>

<div class="activity-panel">
  <div class="activity-top">
    <h3 class="panel-heading">Agent Activity</h3>
    <div class="task-list">
      {#each tasks as task (task.id)}
        <div class="task-item task-{task.status}">
          <span class="task-icon">
            {#if task.status === 'pending' || task.status === 'in-progress'}
              <svg class="spinner" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="8" stroke-linecap="round" />
              </svg>
            {:else if task.status === 'completed'}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.354 4.354a.5.5 0 0 0-.708-.708L5.5 8.793 3.354 6.646a.5.5 0 1 0-.708.708l2.5 2.5a.5.5 0 0 0 .708 0l5.5-5.5z"/>
              </svg>
            {:else}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L7 6.293l1.646-1.647a.5.5 0 0 1 .708.708L7.707 7l1.647 1.646a.5.5 0 0 1-.708.708L7 7.707 5.354 9.354a.5.5 0 0 1-.708-.708L6.293 7 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            {/if}
          </span>
          <span class="task-label" title={task.label}>{task.label}</span>
        </div>
      {:else}
        <p class="empty-state">No agent activity</p>
      {/each}
    </div>
  </div>

  <div class="activity-bottom">
    <div class="detail-row">
      <span class="detail-label">Model</span>
      <span class="detail-value">{currentModel}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Messages</span>
      <span class="detail-value">{messageCount}</span>
    </div>
  </div>
</div>

<style>
  .activity-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }

  .panel-heading {
    font-size: var(--font-size-400);
    font-weight: var(--font-weight-semibold);
    color: var(--neutral-foreground-1);
    margin-bottom: var(--spacing-s);
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
    padding: var(--spacing-xs) var(--spacing-s);
    border-radius: var(--radius-medium);
    font-size: var(--font-size-200);
    color: var(--neutral-foreground-2);
  }

  .task-completed {
    color: #107c10;
  }

  .task-failed {
    color: #d13438;
  }

  .task-in-progress {
    color: var(--brand-primary);
  }

  .task-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .task-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .empty-state {
    font-size: var(--font-size-200);
    color: var(--neutral-foreground-3);
    padding: var(--spacing-m) 0;
  }

  .activity-bottom {
    border-top: 1px solid var(--neutral-stroke-2);
    padding-top: var(--spacing-m);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-xs) 0;
    font-size: var(--font-size-200);
  }

  .detail-label {
    color: var(--neutral-foreground-2);
  }

  .detail-value {
    color: var(--neutral-foreground-1);
    font-weight: var(--font-weight-semibold);
  }
</style>
