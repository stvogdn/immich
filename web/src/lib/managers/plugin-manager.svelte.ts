import { eventManager } from '$lib/managers/event-manager.svelte';
import { user } from '$lib/stores/user.store';
import { searchPluginMethods, type PluginMethodResponseDto } from '@immich/sdk';
import { t } from 'svelte-i18n';
import { SvelteMap } from 'svelte/reactivity';
import { get } from 'svelte/store';

class PluginManager {
  #loading: Promise<void> | undefined;
  #methodMap = new SvelteMap<string, PluginMethodResponseDto>();
  #methods = $state<PluginMethodResponseDto[]>([]);

  constructor() {
    eventManager.on({
      AuthLogout: () => this.clearCache(),
      AuthUserLoaded: () => this.initialize(),
    });

    // loaded event might have already happened
    if (get(user)) {
      void this.initialize();
    }
  }

  ready() {
    return this.initialize();
  }

  getMethodLabel(key: string) {
    const method = this.#methodMap.get(key);
    return method?.title ?? get(t)('unknown');
  }

  private clearCache() {
    this.#loading = undefined;
    this.#methodMap = new SvelteMap();
  }

  private initialize() {
    if (!this.#loading) {
      this.#loading = this.load();
    }

    return this.#loading;
  }

  private async load() {
    this.#methods = await searchPluginMethods({});
    for (const method of this.#methods) {
      this.#methodMap.set(method.key, method);
    }
  }
}

export const pluginManager = new PluginManager();
