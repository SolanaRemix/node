import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { validatePluginManifest } from './plugin-manifest.js';

export class PluginLoader {
  #plugins = new Map();
  #allowedRoots;

  constructor({ allowedRoots = [] } = {}) {
    this.#allowedRoots = allowedRoots.map((root) => path.resolve(root));
  }

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
    const resolvedPath = path.resolve(absolutePath);
    if (this.#allowedRoots.length > 0) {
      const isAllowed = this.#allowedRoots.some((root) => resolvedPath === root || resolvedPath.startsWith(`${root}${path.sep}`));
      if (!isAllowed) {
        throw new Error(`plugin path is not in allowed roots: ${resolvedPath}`);
      }
    }
    const loaded = await import(pathToFileURL(resolvedPath).href);
    plugin.module = loaded?.default || loaded;
    return plugin.module;
  }
}
