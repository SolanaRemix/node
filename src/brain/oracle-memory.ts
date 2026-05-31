export class OracleMemory {
  private memory: Map<string, any[]> = new Map();
  
  learn(repo: string, issue: string, fix: string, language: string): void {
    if (!this.memory.has(repo)) this.memory.set(repo, []);
    this.memory.get(repo)!.push({ issue, fix, language, timestamp: new Date() });
    console.log(`🧠 Oracle Memory: Learned from ${repo}`);
  }
  
  recall(repo: string): any[] {
    return this.memory.get(repo) || [];
  }
  
  suggest(repo: string, language: string): string[] {
    const records = this.memory.get(repo) || [];
    const languageRecords = records.filter(r => r.language === language);
    return languageRecords.slice(0, 3).map(r => r.fix);
  }
  
  getStats(): object {
    let total = 0;
    for (const records of this.memory.values()) total += records.length;
    return { totalRepairs: total, totalRepositories: this.memory.size };
  }
}

export const oracle = new OracleMemory();
