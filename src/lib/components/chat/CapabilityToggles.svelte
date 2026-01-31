<script lang="ts">
    import {
        getSelectedModelInfo,
        getToolsEnabled,
        getVisionEnabled,
        getThinkingEnabled,
        setToolsEnabled,
        setVisionEnabled,
        setThinkingEnabled,
    } from "$lib/stores/chat.svelte";

    let modelInfo = $derived(getSelectedModelInfo());
    let toolsEnabled = $derived(getToolsEnabled());
    let visionEnabled = $derived(getVisionEnabled());
    let thinkingEnabled = $derived(getThinkingEnabled());

    function toggleTools() {
        setToolsEnabled(!toolsEnabled);
    }

    function toggleVision() {
        setVisionEnabled(!visionEnabled);
    }

    function toggleThinking() {
        setThinkingEnabled(!thinkingEnabled);
    }
</script>

<div class="capability-toggles">
    {#if modelInfo?.supportsTools}
        <button
            class="toggle-btn"
            class:toggle-active={toolsEnabled}
            onclick={toggleTools}
            title={toolsEnabled
                ? "Disable tool calling"
                : "Enable tool calling"}
        >
            <span class="toggle-indicator"></span>
            <span class="toggle-label">Tools</span>
        </button>
    {/if}

    {#if modelInfo?.supportsVision}
        <button
            class="toggle-btn"
            class:toggle-active={visionEnabled}
            onclick={toggleVision}
            title={visionEnabled ? "Disable vision" : "Enable vision"}
        >
            <span class="toggle-indicator"></span>
            <span class="toggle-label">Vision</span>
        </button>
    {/if}

    {#if modelInfo?.supportsThinking}
        <button
            class="toggle-btn"
            class:toggle-active={thinkingEnabled}
            onclick={toggleThinking}
            title={thinkingEnabled
                ? "Disable thinking mode"
                : "Enable thinking mode"}
        >
            <span class="toggle-indicator"></span>
            <span class="toggle-label">Thinking</span>
        </button>
    {/if}
</div>

<style>
    .capability-toggles {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }

    .toggle-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border: 1px solid var(--neutral-stroke-2);
        border-radius: 9999px;
        background: var(--neutral-background-subtle);
        color: var(--neutral-foreground-3);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--duration-fast) var(--curve-easy-ease);
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .toggle-btn:hover {
        border-color: var(--neutral-foreground-3);
        color: var(--neutral-foreground-2);
    }

    .toggle-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--neutral-stroke-2);
        transition: all var(--duration-fast) var(--curve-easy-ease);
    }

    .toggle-active {
        border-color: var(--brand-primary);
        background: rgba(0, 120, 212, 0.08);
        color: var(--brand-primary);
    }

    .toggle-active .toggle-indicator {
        background: var(--brand-primary);
        box-shadow: 0 0 6px rgba(0, 120, 212, 0.5);
    }

    .toggle-active:hover {
        border-color: var(--brand-hover);
        color: var(--brand-hover);
    }
</style>
