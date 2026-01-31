import type { AgentTask, PermissionMode } from '$lib/types';

let tasks = $state<AgentTask[]>([]);
let permissionMode = $state<PermissionMode>('ask');
let agentRunning = $state(false);

// Confirmation state for ask mode
let pendingConfirmation = $state<AgentTask | null>(null);
let confirmationResolver: ((approved: boolean) => void) | null = null;

export function getTasks(): AgentTask[] {
  return tasks;
}

export function addTask(task: AgentTask) {
  tasks.push(task);
}

export function updateTaskStatus(
  id: string,
  status: AgentTask['status'],
  extra?: { result?: string; error?: string }
) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], status, ...extra };
  }
}

export function clearTasks() {
  tasks = [];
}

export function getPermissionMode(): PermissionMode {
  return permissionMode;
}

export function setPermissionMode(mode: PermissionMode) {
  permissionMode = mode;
}

export function getIsAgentRunning(): boolean {
  return agentRunning;
}

export function setAgentRunning(running: boolean) {
  agentRunning = running;
}

export function getPendingConfirmation(): AgentTask | null {
  return pendingConfirmation;
}

export function requestConfirmation(task: AgentTask): Promise<boolean> {
  pendingConfirmation = task;
  return new Promise<boolean>((resolve) => {
    confirmationResolver = resolve;
  });
}

export function respondToConfirmation(approved: boolean) {
  if (confirmationResolver) {
    confirmationResolver(approved);
    confirmationResolver = null;
  }
  pendingConfirmation = null;
}
