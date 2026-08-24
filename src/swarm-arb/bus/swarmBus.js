import { EventEmitter } from 'node:events';

export class SwarmBus {
  #emitter = new EventEmitter();

  publish(message) {
    this.#emitter.emit(message.type, message);
  }

  subscribe(messageType, handler) {
    this.#emitter.on(messageType, handler);
    return () => this.#emitter.off(messageType, handler);
  }
}
