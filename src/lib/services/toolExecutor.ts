import { invoke } from '@tauri-apps/api/core';
import { getWorkspacePath } from '$lib/stores/chat.svelte';

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const workspace = getWorkspacePath();
  if (!workspace) {
    return 'Error: No workspace path set. Please select a workspace folder first.';
  }

  try {
    switch (name) {
      case 'read_file': {
        const content = await invoke<string>('read_file', {
          workspace,
          path: args.path as string,
        });
        return content;
      }
      case 'write_file': {
        await invoke('write_file', {
          workspace,
          path: args.path as string,
          content: args.content as string,
        });
        return `Successfully wrote to ${args.path}`;
      }
      case 'list_directory': {
        const entries = await invoke<{ name: string; is_dir: boolean }[]>(
          'list_directory',
          { workspace, path: args.path as string }
        );
        return entries
          .map((e) => `${e.is_dir ? '[dir]' : '[file]'} ${e.name}`)
          .join('\n');
      }
      case 'create_directory': {
        await invoke('create_directory', {
          workspace,
          path: args.path as string,
        });
        return `Successfully created directory ${args.path}`;
      }
      case 'delete_file': {
        await invoke('delete_file', {
          workspace,
          path: args.path as string,
        });
        return `Successfully deleted ${args.path}`;
      }
      case 'run_python': {
        const result = await invoke<{ stdout: string; stderr: string; code: number }>('run_command', {
          workspace,
          command: args.command as string,
        });
        let output = '';
        if (result.stdout) output += result.stdout;
        if (result.stderr) output += (output ? '\n' : '') + result.stderr;
        if (result.code !== 0) {
          output += `\nProcess exited with code ${result.code}`;
        }
        return output || 'Command completed with no output.';
      }
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Error: ${err}`;
  }
}

