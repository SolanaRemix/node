import * as fs from 'fs';
import * as path from 'path';

export interface MemoryEntry {
    id: string;
    repo: string;
    language: string;
    issue: string;
    fix: string;
    confidence: number;
    timestamp: number;
}

export class OracleMemory {
    private memoryPath: string;
    private memory: MemoryEntry[] = [];

    constructor(baseDir: string = '.') {
        this.memoryPath = path.join(baseDir, 'oracle-memory.json');
        this.load();
    }

    private load(): void {
        if (fs.existsSync(this.memoryPath)) {
            try { this.memory = JSON.parse(fs.readFileSync(this.memoryPath, 'utf8')); }
            catch { this.memory = []; }
        }
    }

    public learn(repo: string, language: string, issue: string, fix: string, confidence: number = 0.95): void {
        this.memory.push({
            id: Math.random().toString(36).substring(2, 9),
            repo, language, issue, fix, confidence, timestamp: Date.now()
        });
        if (this.memory.length > 10000) this.memory.shift();
        fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    }

    public getStats() {
        const langs = Array.from(new Set(this.memory.map(m => m.language)));
        return {
            patternCount: this.memory.length,
            languages: langs,
            topSuggestion: this.memory.length ? this.memory[this.memory.length - 1].fix : "Awaiting Heuristics"
        };
    }
}
