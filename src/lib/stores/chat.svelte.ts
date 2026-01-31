import type { Message, ModelInfo } from '$lib/types';

let messages = $state<Message[]>([]);
let nextId = $state(1);
let workspacePath = $state('');
let selectedModel = $state('llama3.2:1b');
let modelInfoMap = $state<Map<string, ModelInfo>>(new Map());

// Capability toggles - user can enable/disable features the model supports
let toolsEnabled = $state(false);
let visionEnabled = $state(false);
let thinkingEnabled = $state(false);

export function getMessages(): Message[] {
  return messages;
}

export function addMessage(msg: Omit<Message, 'id'>): number {
  const id = nextId++;
  messages.push({ ...msg, id });
  return id;
}

export function updateMessage(id: number, updates: Partial<Message>) {
  const idx = messages.findIndex((m) => m.id === id);
  if (idx !== -1) {
    messages[idx] = { ...messages[idx], ...updates };
  }
}

export function appendToMessage(id: number, token: string) {
  const idx = messages.findIndex((m) => m.id === id);
  if (idx !== -1) {
    messages[idx].content += token;
  }
}

export function clearMessages() {
  messages = [];
  nextId = 1;
}

export function getWorkspacePath(): string {
  return workspacePath;
}

export function setWorkspacePath(path: string) {
  workspacePath = path;
}

export function getSelectedModel(): string {
  return selectedModel;
}

export function setSelectedModel(model: string) {
  selectedModel = model;
  // Reset all capability toggles when model changes
  resetCapabilityToggles();
}

export function getModelInfoMap(): Map<string, ModelInfo> {
  return modelInfoMap;
}

export function setModelInfoMap(map: Map<string, ModelInfo>) {
  modelInfoMap = map;
}

export function getSelectedModelInfo(): ModelInfo | undefined {
  return modelInfoMap.get(selectedModel);
}

// Capability toggle getters
export function getToolsEnabled(): boolean {
  return toolsEnabled;
}

export function getVisionEnabled(): boolean {
  return visionEnabled;
}

export function getThinkingEnabled(): boolean {
  return thinkingEnabled;
}

// Capability toggle setters
export function setToolsEnabled(enabled: boolean) {
  toolsEnabled = enabled;
}

export function setVisionEnabled(enabled: boolean) {
  visionEnabled = enabled;
}

export function setThinkingEnabled(enabled: boolean) {
  thinkingEnabled = enabled;
}

// Reset all toggles to disabled
export function resetCapabilityToggles() {
  toolsEnabled = false;
  visionEnabled = false;
  thinkingEnabled = false;
}

