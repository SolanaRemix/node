export class ServiceRegistry {
  #services = new Map();

  register(definition) {
    if (!definition?.name || typeof definition.start !== 'function' || typeof definition.stop !== 'function') {
      throw new TypeError('service definition must include name/start/stop');
    }
    this.#services.set(definition.name, definition);
    return definition;
  }

  get(name) {
    return this.#services.get(name);
  }

  list() {
    return [...this.#services.values()].map((service) => ({ name: service.name, status: service.status || 'idle' }));
  }

  async startAll(context) {
    for (const service of this.#services.values()) {
      service.status = 'starting';
      await service.start(context);
      service.status = 'running';
    }
  }

  async stopAll(context) {
    const services = [...this.#services.values()].reverse();
    for (const service of services) {
      service.status = 'stopping';
      await service.stop(context);
      service.status = 'stopped';
    }
  }
}
