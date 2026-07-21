import { EventEmitter } from 'node:events';

export class EventBus {
  #emitter = new EventEmitter();

  subscribe(topic, listener) {
    this.#emitter.on(topic, listener);
    return () => this.#emitter.off(topic, listener);
  }

  publish(topic, payload) {
    this.#emitter.emit(topic, payload);
  }

  once(topic, listener) {
    this.#emitter.once(topic, listener);
  }
}
