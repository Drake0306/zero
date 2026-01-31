<script lang="ts">
  import { onMount } from "svelte";
  import { fetchModelsWithInfo } from "$lib/services/ollama";
  import {
    getSelectedModel,
    setSelectedModel,
    getModelInfoMap,
    setModelInfoMap,
  } from "$lib/stores/chat.svelte";
  import type { ModelInfo } from "$lib/types";

  let models = $state<ModelInfo[]>([]);
  let loading = $state(true);
  let error = $state("");
  let open = $state(false);
  let current = $derived(getSelectedModel());
  let currentInfo = $derived(getModelInfoMap().get(current));
  let dropdownRef: HTMLDivElement;

  async function loadModels() {
    loading = true;
    error = "";
    try {
      const infos = await fetchModelsWithInfo();
      models = infos;
      const map = new Map<string, ModelInfo>();
      for (const info of infos) {
        map.set(info.name, info);
      }
      setModelInfoMap(map);
      if (
        infos.length > 0 &&
        !infos.some((m) => m.name === getSelectedModel())
      ) {
        setSelectedModel(infos[0].name);
      }
    } catch (err) {
      error = "Could not connect to Ollama";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadModels();

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
        open = false;
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  function selectModel(name: string) {
    setSelectedModel(name);
    open = false;
  }

  function toggleDropdown() {
    open = !open;
  }
</script>

<div class="model-selector" bind:this={dropdownRef}>
  {#if loading}
    <div class="model-loading">
      <svg
        class="spinner"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <circle
          cx="7"
          cy="7"
          r="6"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="28"
          stroke-dashoffset="8"
          stroke-linecap="round"
        />
      </svg>
      <span>Loading models...</span>
    </div>
  {:else if error}
    <button class="model-error" onclick={loadModels} title="Click to retry">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path
          d="M7 1a6 6 0 1 0 6 6A6 6 0 0 0 7 1zm0 11a5 5 0 1 1 5-5 5 5 0 0 1-5 5zm-.5-8h1v4h-1zm0 5h1v1h-1z"
        />
      </svg>
      <span>{error}</span>
    </button>
  {:else}
    <div class="dropdown-wrapper">
      <button class="dropdown-trigger" onclick={toggleDropdown}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path
            d="M7 0a7 7 0 1 0 7 7A7 7 0 0 0 7 0zm3.5 8h-3v3a.5.5 0 0 1-1 0V8h-3a.5.5 0 0 1 0-1h3V4a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1z"
          />
        </svg>
        <span class="trigger-name">{current}</span>
        {#if currentInfo?.supportsTools}
          <span class="tag tag-tools">Tools</span>
        {/if}
        {#if currentInfo?.supportsVision}
          <span class="tag tag-vision">Vision</span>
        {/if}
        {#if currentInfo?.supportsThinking}
          <span class="tag tag-thinking">Thinking</span>
        {/if}
        <svg
          class="chevron"
          class:chevron-open={open}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path
            d="M3.15 4.35a.5.5 0 0 1 .7 0L6 6.5l2.15-2.15a.5.5 0 0 1 .7.7l-2.5 2.5a.5.5 0 0 1-.7 0l-2.5-2.5a.5.5 0 0 1 0-.7z"
          />
        </svg>
      </button>
      {#if open}
        <ul class="dropdown-list">
          {#each models as model (model.name)}
            <li>
              <button
                class="dropdown-item"
                class:dropdown-item-active={model.name === current}
                onclick={() => selectModel(model.name)}
              >
                <span class="item-name">{model.name}</span>
                <span class="item-tags">
                  {#if model.supportsTools}
                    <span class="tag tag-tools">Tools</span>
                  {/if}
                  {#if model.supportsVision}
                    <span class="tag tag-vision">Vision</span>
                  {/if}
                  {#if model.supportsThinking}
                    <span class="tag tag-thinking">Thinking</span>
                  {/if}
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style>
  .model-selector {
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-l);
    padding-bottom: var(--spacing-s);
    position: relative;
  }

  .model-loading {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-200);
    color: var(--neutral-foreground-3);
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .model-error {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-200);
    color: #d13438;
    background: none;
    border: 1px solid #d13438;
    border-radius: var(--radius-medium);
    padding: var(--spacing-xs) var(--spacing-s);
    cursor: pointer;
  }

  .model-error:hover {
    background: rgba(209, 52, 56, 0.08);
  }

  .dropdown-wrapper {
    position: relative;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--neutral-background-subtle);
    border: 1px solid var(--neutral-stroke-2);
    border-radius: var(--radius-medium);
    padding: var(--spacing-xs) var(--spacing-s);
    font-size: var(--font-size-200);
    color: var(--neutral-foreground-1);
    cursor: pointer;
    transition: border-color var(--duration-fast) var(--curve-easy-ease);
  }

  .dropdown-trigger:hover {
    border-color: var(--neutral-foreground-3);
  }

  .trigger-name {
    margin-right: 2px;
  }

  .chevron {
    transition: transform var(--duration-fast) var(--curve-easy-ease);
    color: var(--neutral-foreground-3);
  }

  .chevron-open {
    transform: rotate(180deg);
  }

  .dropdown-list {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 4px;
    min-width: 280px;
    max-height: 300px;
    overflow-y: auto;
    background: var(--neutral-background-1);
    border: 1px solid var(--neutral-stroke-2);
    border-radius: var(--radius-medium);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    list-style: none;
    padding: var(--spacing-xs);
    margin-top: 0;
    z-index: 100;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-s);
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-s);
    border: none;
    border-radius: var(--radius-small, 4px);
    background: none;
    color: var(--neutral-foreground-1);
    font-size: var(--font-size-200);
    cursor: pointer;
    text-align: left;
  }

  .dropdown-item:hover {
    background: var(--neutral-background-subtle-hover, rgba(0, 0, 0, 0.04));
  }

  .dropdown-item-active {
    background: var(--brand-primary-bg, rgba(0, 120, 212, 0.08));
    color: var(--brand-primary, #0078d4);
  }

  .item-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-tags {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .tag-tools {
    background: rgba(16, 185, 129, 0.15);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .tag-vision {
    background: rgba(59, 130, 246, 0.15);
    color: #2563eb;
    border: 1px solid rgba(59, 130, 246, 0.25);
  }

  .tag-thinking {
    background: rgba(139, 92, 246, 0.15);
    color: #7c3aed;
    border: 1px solid rgba(139, 92, 246, 0.25);
  }
</style>
