// Shared TypeScript types for Zero agent

export type ModelInfo = {
  name: string;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsThinking: boolean;
};

export type Message = {
  id: number;
  content: string;
  sender: 'user' | 'assistant' | 'tool';
  initials: string;
  timestamp: string;
  isStreaming?: boolean;
  toolCalls?: OllamaToolCall[];
  toolCallId?: string;
};

export type AgentTask = {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  toolName: string;
  args: Record<string, unknown>;
  result?: string;
  error?: string;
};

export type PermissionMode = 'ask' | 'auto';

// Ollama API types

export type OllamaMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: OllamaToolCall[];
};

export type OllamaToolCall = {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
};

export type OllamaTool = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
};

export type OllamaStreamChunk = {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
    tool_calls?: OllamaToolCall[];
  };
  done: boolean;
  done_reason?: string;
};
