export class SwarmLogger {
  constructor(scope = 'swarm-arb') {
    this.scope = scope;
  }

  info(event, fields = {}) {
    console.log(JSON.stringify({ level: 'info', scope: this.scope, event, fields, at: Date.now() }));
  }

  warn(event, fields = {}) {
    console.warn(JSON.stringify({ level: 'warn', scope: this.scope, event, fields, at: Date.now() }));
  }

  error(event, fields = {}) {
    console.error(JSON.stringify({ level: 'error', scope: this.scope, event, fields, at: Date.now() }));
  }
}
