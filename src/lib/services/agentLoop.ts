import type { OllamaMessage, OllamaToolCall, AgentTask } from '$lib/types';
import { addMessage, appendToMessage, updateMessage, getMessages, getSelectedModel, getSelectedModelInfo, getToolsEnabled } from '$lib/stores/chat.svelte';
import {
  addTask,
  updateTaskStatus,
  getPermissionMode,
  requestConfirmation,
  setAgentRunning,
} from '$lib/stores/agent.svelte';
import { streamChat } from './ollama';
import { AGENT_TOOLS } from './tools';
import { executeTool } from './toolExecutor';

const SYSTEM_PROMPT_WITH_TOOLS = `You are Zero, a helpful AI assistant with filesystem and Python execution tools.

Available tools:
- read_file(path): Read contents of a file. Example: {"path": "src/main.py"}
- write_file(path, content): Write content to a file. Example: {"path": "hello.txt", "content": "Hello World"}
- list_directory(path): List files and folders. Use "." for current directory. Example: {"path": "."}
- create_directory(path): Create a folder. Example: {"path": "new_folder"}
- delete_file(path): Delete a file or folder. Example: {"path": "old_file.txt"}
- run_python(command): Execute Python commands. Example: {"command": "python script.py"}

IMPORTANT: When calling tools, provide arguments as a flat object like {"path": "."} not nested structures.

Rules:
- Use tools when the user asks to read, write, list, create, delete files, or run Python code.
- For normal questions or conversation, respond in plain text with NO tool calls.
- When you use a tool, wait for the result before responding.
- After receiving a tool result, summarize what happened in plain text.

Be concise and helpful.`;

const SYSTEM_PROMPT_NO_TOOLS = `You are Zero, a helpful AI assistant. Tool calling is currently disabled. Respond to all questions in plain text. If the user asks for file operations or code execution, explain that tools are not enabled and suggest enabling the "Tools" toggle.

Be concise and helpful.`;

/**
 * Normalize malformed tool call arguments from models that return wrong structures.
 * Some models return {"function": "name", "parameters": {...}} instead of just the args.
 */
function normalizeToolCall(tc: OllamaToolCall): { name: string; args: Record<string, unknown> } {
  let name = tc.function.name;
  let args = tc.function.arguments;

  // Handle case where model returns function name in arguments
  if (args && typeof args === 'object') {
    // Case 1: {"function": "list_directory", "parameters": {...}}
    if ('function' in args && typeof args.function === 'string') {
      name = args.function as string;
      const params = (args as Record<string, unknown>).parameters;
      if (params && typeof params === 'object') {
        args = params as Record<string, unknown>;
      } else {
        args = {};
      }
    }

    // Case 2: Nested paths array like {"paths": [{"path": ""}]}
    if ('paths' in args && Array.isArray(args.paths) && args.paths.length > 0) {
      const firstPath = args.paths[0];
      if (firstPath && typeof firstPath === 'object' && 'path' in firstPath) {
        args = { path: firstPath.path || '.' };
      }
    }

    // Case 3: Empty path - default to current directory
    if ('path' in args && (args.path === '' || args.path === undefined)) {
      args = { ...args, path: '.' };
    }
  }

  return { name, args: args || {} };
}

/** Known tool names for validation */
const TOOL_NAMES = ['read_file', 'write_file', 'list_directory', 'create_directory', 'delete_file', 'run_python'];

/**
 * Try to parse tool calls from message content when model outputs JSON text
 * instead of using the proper tool_calls field.
 */
function parseToolCallFromContent(content: string): OllamaToolCall | null {
  if (!content) return null;

  // Try to find JSON object in the content
  const jsonMatch = content.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Look for tool name in various formats
    let toolName = parsed.name || parsed.function || parsed.tool;
    let args = parsed.parameters || parsed.arguments || parsed.args || {};

    // Handle nested structure: {"name": "tool", "parameters": {"path": "."}}
    if (typeof toolName === 'string' && TOOL_NAMES.includes(toolName)) {
      return {
        function: {
          name: toolName,
          arguments: args
        }
      };
    }

    // Handle flat structure: {"path": "."} - need to infer tool from context
    if ('path' in parsed && !toolName) {
      return {
        function: {
          name: 'list_directory', // Default assumption
          arguments: { path: parsed.path || '.' }
        }
      };
    }

    // Handle command structure for run_python
    if ('command' in parsed && !toolName) {
      return {
        function: {
          name: 'run_python',
          arguments: { command: parsed.command }
        }
      };
    }
  } catch {
    // Not valid JSON
  }

  return null;
}

function now(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildOllamaMessages(): OllamaMessage[] {
  // Use tools system prompt only if user has enabled tools AND model supports it
  const modelInfo = getSelectedModelInfo();
  const toolsActive = getToolsEnabled() && modelInfo?.supportsTools;
  const systemPrompt = toolsActive ? SYSTEM_PROMPT_WITH_TOOLS : SYSTEM_PROMPT_NO_TOOLS;
  const msgs: OllamaMessage[] = [{ role: 'system', content: systemPrompt }];

  for (const msg of getMessages()) {
    if (msg.sender === 'user') {
      msgs.push({ role: 'user', content: msg.content });
    } else if (msg.sender === 'assistant') {
      const m: OllamaMessage = { role: 'assistant', content: msg.content };
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        m.tool_calls = msg.toolCalls;
      }
      msgs.push(m);
    } else if (msg.sender === 'tool') {
      msgs.push({ role: 'tool', content: msg.content });
    }
  }

  return msgs;
}

let abortController: AbortController | null = null;

export function stopAgent() {
  abortController?.abort();
  abortController = null;
  setAgentRunning(false);
}

export async function runAgentLoop(userMessage: string): Promise<void> {
  setAgentRunning(true);
  abortController = new AbortController();

  // Add user message
  addMessage({
    content: userMessage,
    sender: 'user',
    initials: 'U',
    timestamp: now(),
  });

  try {
    await agentTurn(abortController.signal, false);
  } catch (err) {
    if (!abortController?.signal.aborted) {
      addMessage({
        content: `Error: ${err}`,
        sender: 'assistant',
        initials: 'Z',
        timestamp: now(),
      });
    }
  } finally {
    setAgentRunning(false);
    abortController = null;
  }
}

async function agentTurn(signal: AbortSignal, forceTools = false): Promise<void> {
  // Create empty assistant message for streaming
  const assistantId = addMessage({
    content: '',
    sender: 'assistant',
    initials: 'Z',
    timestamp: now(),
    isStreaming: true,
  });

  const ollamaMessages = buildOllamaMessages();
  // Remove the empty assistant message we just added from the ollama context
  ollamaMessages.pop();

  // Determine if tools should be sent: only if user has enabled the tools toggle AND model supports them
  const modelInfo = getSelectedModelInfo();
  const useTools = getToolsEnabled() && modelInfo?.supportsTools && (forceTools || true);

  let pendingToolCalls: OllamaToolCall[] = [];

  await new Promise<void>((resolve, reject) => {
    streamChat(
      ollamaMessages,
      useTools ? AGENT_TOOLS : [],
      {
        onToken(token) {
          appendToMessage(assistantId, token);
        },
        onToolCalls(toolCalls) {
          pendingToolCalls = toolCalls;
        },
        onDone() {
          resolve();
        },
        onError(error) {
          reject(new Error(error));
        },
      },
      signal,
      getSelectedModel()
    );
  });

  updateMessage(assistantId, {
    isStreaming: false,
    ...(pendingToolCalls.length > 0 ? { toolCalls: pendingToolCalls } : {}),
  });

  if (signal.aborted) return;

  console.log('[AgentLoop] Stream complete. Pending tool calls:', pendingToolCalls.length);

  // Fallback: If tools are enabled but model didn't use tool_calls field,
  // try to parse tool call from message content (for models like llama3.2:1b)
  if (pendingToolCalls.length === 0 && useTools) {
    const msgs = getMessages();
    const lastMsg = msgs.find(m => m.id === assistantId);
    console.log('[AgentLoop] No tool_calls, checking content fallback. Content:', lastMsg?.content?.substring(0, 200));
    if (lastMsg?.content) {
      const parsedTool = parseToolCallFromContent(lastMsg.content);
      if (parsedTool) {
        console.log('[AgentLoop] Parsed tool from content:', JSON.stringify(parsedTool));
        pendingToolCalls = [parsedTool];
        // Clear the message content since it was just the JSON tool call
        updateMessage(assistantId, { content: 'Executing tool...', toolCalls: pendingToolCalls });
      } else {
        console.log('[AgentLoop] Could not parse tool from content');
      }
    }
  }

  // Process tool calls if any
  if (pendingToolCalls.length > 0) {
    console.log('[AgentLoop] Processing', pendingToolCalls.length, 'tool calls');
    for (const tc of pendingToolCalls) {
      // Normalize the tool call to handle malformed model responses
      const { name: toolName, args: toolArgs } = normalizeToolCall(tc);
      console.log('[AgentLoop] Executing tool:', toolName, 'with args:', JSON.stringify(toolArgs));

      const taskId = crypto.randomUUID();
      const task: AgentTask = {
        id: taskId,
        label: `${toolName}(${Object.values(toolArgs).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(', ')})`,
        status: 'pending',
        toolName: toolName,
        args: toolArgs,
      };

      addTask(task);

      // Ask mode: wait for user confirmation
      if (getPermissionMode() === 'ask') {
        const approved = await requestConfirmation(task);
        if (!approved) {
          updateTaskStatus(taskId, 'failed', { error: 'Denied by user' });
          addMessage({
            content: `Tool call "${toolName}" was denied by user.`,
            sender: 'tool',
            initials: 'T',
            timestamp: now(),
          });
          continue;
        }
      }

      // Execute the tool
      updateTaskStatus(taskId, 'in-progress');

      try {
        const result = await executeTool(toolName, toolArgs);
        updateTaskStatus(taskId, 'completed', { result });
        addMessage({
          content: result,
          sender: 'tool',
          initials: 'T',
          timestamp: now(),
        });
      } catch (err) {
        const error = `${err}`;
        updateTaskStatus(taskId, 'failed', { error });
        addMessage({
          content: `Error executing ${toolName}: ${error}`,
          sender: 'tool',
          initials: 'T',
          timestamp: now(),
        });
      }
    }

    if (signal.aborted) return;

    // Continue the loop — let the model respond to tool results
    await agentTurn(signal, true);
  }
}
