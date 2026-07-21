import { pathToFileURL } from 'node:url';
import { validatePluginManifest } from './plugin-manifest.js';

export class PluginLoader {
  #plugins = new Map();

  register(manifest) {
    const normalized = validatePluginManifest(manifest);
    this.#plugins.set(normalized.name, { manifest: normalized, module: null });
    return normalized;
  }

  list() {
    return [...this.#plugins.values()].map((p) => p.manifest);
  }

  async load(name, absolutePath) {
    const plugin = this.#plugins.get(name);
    if (!plugin) throw new Error(`plugin not registered: ${name}`);
    const loaded = await import(pathToFileURL(absolutePath).href);
    plugin.module = loaded?.default || loaded;
    return plugin.module;
  }
}
