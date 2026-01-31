import type { ModelInfo, OllamaMessage, OllamaStreamChunk, OllamaTool, OllamaToolCall } from '$lib/types';

const OLLAMA_BASE = 'http://localhost:11434';

export async function showModel(name: string): Promise<ModelInfo> {
  const response = await fetch(`${OLLAMA_BASE}/api/show`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`Ollama /api/show returned status ${response.status}`);
  const data = await response.json();

  // Use the capabilities array directly from Ollama API
  const capabilities: string[] = data.capabilities ?? [];

  const supportsTools = capabilities.includes('tools');
  const supportsVision = capabilities.includes('vision');
  const supportsThinking = capabilities.includes('thinking');

  return { name, supportsTools, supportsVision, supportsThinking };
}

export async function fetchModels(): Promise<string[]> {
  const response = await fetch(`${OLLAMA_BASE}/api/tags`);
  if (!response.ok) throw new Error(`Ollama returned status ${response.status}`);
  const data = await response.json();
  return (data.models ?? []).map((m: { name: string }) => m.name);
}

export async function fetchModelsWithInfo(): Promise<ModelInfo[]> {
  const names = await fetchModels();
  const results = await Promise.allSettled(names.map((n) => showModel(n)));
  return results
    .filter((r): r is PromiseFulfilledResult<ModelInfo> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export type StreamCallbacks = {
  onToken: (token: string) => void;
  onToolCalls: (toolCalls: OllamaToolCall[]) => void;
  onDone: () => void;
  onError: (error: string) => void;
};

export async function streamChat(
  messages: OllamaMessage[],
  tools: OllamaTool[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  model?: string
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model ?? 'llama3.2:1b',
        messages,
        tools: tools.length > 0 ? tools : undefined,
        stream: true,
      }),
      signal,
    });
    console.log('[Ollama] Request sent to', model ?? 'llama3.2:1b', 'with', tools.length, 'tools');
  } catch (err) {
    callbacks.onError(
      `Failed to connect to Ollama at ${OLLAMA_BASE}. Is Ollama running?`
    );
    return;
  }

  if (!response.ok) {
    // Some models don't support tools — retry without them
    if (response.status === 500 && tools.length > 0) {
      let errText = '';
      try { errText = await response.text(); } catch { }
      console.warn(`Ollama 500 with tools (${errText.slice(0, 200)}), retrying without tools`);
      return streamChat(messages, [], callbacks, signal, model);
    }
    let detail = '';
    try { detail = await response.text(); } catch { }
    callbacks.onError(`Ollama returned status ${response.status}${detail ? ': ' + detail.slice(0, 300) : ''}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response body from Ollama');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let receivedFirstChunk = false;

  // Timeout for initial response (60 seconds)
  const timeout = setTimeout(() => {
    if (!receivedFirstChunk) {
      console.error('[Ollama] Timeout: No response received in 60 seconds');
      callbacks.onError('Model is not responding. It may have run out of memory. Try a smaller model like llama3.2:1b');
      reader.cancel();
    }
  }, 60000);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (!receivedFirstChunk) {
        receivedFirstChunk = true;
        clearTimeout(timeout);
        console.log('[Ollama] Received first chunk');
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let chunk: OllamaStreamChunk;
        try {
          chunk = JSON.parse(trimmed);
        } catch {
          continue;
        }

        if (chunk.message?.content) {
          callbacks.onToken(chunk.message.content);
        }

        if (chunk.message?.tool_calls && chunk.message.tool_calls.length > 0) {
          console.log('[Ollama] Received tool_calls:', JSON.stringify(chunk.message.tool_calls));
          callbacks.onToolCalls(chunk.message.tool_calls);
        }

        if (chunk.done) {
          console.log('[Ollama] Stream done, reason:', chunk.done_reason);
          callbacks.onDone();
          return;
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const chunk: OllamaStreamChunk = JSON.parse(buffer.trim());
        if (chunk.message?.content) {
          callbacks.onToken(chunk.message.content);
        }
        if (chunk.message?.tool_calls && chunk.message.tool_calls.length > 0) {
          callbacks.onToolCalls(chunk.message.tool_calls);
        }
      } catch {
        // ignore partial JSON
      }
    }

    callbacks.onDone();
  } catch (err) {
    if (signal?.aborted) return;
    callbacks.onError(`Stream error: ${err}`);
  }
}
