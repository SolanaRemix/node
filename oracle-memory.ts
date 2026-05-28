/**
 * Oracle Memory — learns from past repairs and suggests fixes.
 * Persisted to oracle-memory.json; pruned to MAX_RECORDS.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RepairRecord {
  id:         string;
  repo:       string;
  language:   string;
  issue:      string;
  fix:        string;
  success:    boolean;
  timestamp:  string;
  confidence: number;   // 0–1, updated by reinforcement
  usedCount:  number;
}

export interface MemoryStats {
  totalRecords:  number;
  byLanguage:    Record<string, number>;
  topPatterns:   RepairRecord[];
  successRate:   number;
  lastPruned:    string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_RECORDS    = 10_000;
const MEMORY_FILE    = path.resolve(__dirname, '../../oracle-memory.json');
const CONFIDENCE_HIT = 0.05;   // reward for each successful use
const CONFIDENCE_MIN = 0.0;
const CONFIDENCE_MAX = 1.0;
const SIMILARITY_THRESHOLD = 0.4;

// ─── Class ───────────────────────────────────────────────────────────────────

export class OracleMemory {
  private records: RepairRecord[] = [];
  private memoryPath: string;

  constructor(memoryPath = MEMORY_FILE) {
    this.memoryPath = memoryPath;
    this.load();
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  private load(): void {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const raw = fs.readFileSync(this.memoryPath, 'utf8');
        this.records = JSON.parse(raw) as RepairRecord[];
      }
    } catch {
      this.records = [];
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.records, null, 2), 'utf8');
    } catch (err) {
      process.stderr.write(`[OracleMemory] save error: ${String(err)}\n`);
    }
  }

  // ── Core API ───────────────────────────────────────────────────────────────

  /**
   * Record a repair attempt. Call with success=true when the PR lands clean.
   */
  learn(repo: string, language: string, issue: string, fix: string, success = true): RepairRecord {
    const record: RepairRecord = {
      id:         `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      repo,
      language,
      issue,
      fix,
      success,
      timestamp:  new Date().toISOString(),
      confidence: success ? 0.6 : 0.2,
      usedCount:  0,
    };
    this.records.unshift(record);
    this.prune();
    this.save();
    return record;
  }

  /**
   * Return all records for a given repo, most recent first.
   */
  recall(repo: string): RepairRecord[] {
    return this.records.filter(r => r.repo === repo);
  }

  /**
   * Return ranked suggestions for a repo/language based on similarity scoring.
   */
  suggest(repo: string, language: string, issueHint = ''): string[] {
    const candidates = this.records
      .filter(r => r.success && r.language === language)
      .map(r => ({
        record: r,
        score:  this.score(r, repo, issueHint),
      }))
      .filter(c => c.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Increment usedCount for each returned record
    candidates.forEach(c => {
      c.record.usedCount++;
      c.record.confidence = Math.min(
        CONFIDENCE_MAX,
        c.record.confidence + CONFIDENCE_HIT
      );
    });
    if (candidates.length) this.save();

    return candidates.map(c => `${c.record.fix}  (conf: ${(c.record.confidence * 100).toFixed(0)}%)`);
  }

  /**
   * Reinforce confidence when a suggested fix is confirmed to work.
   */
  reinforce(id: string): void {
    const record = this.records.find(r => r.id === id);
    if (!record) return;
    record.confidence = Math.min(CONFIDENCE_MAX, record.confidence + CONFIDENCE_HIT * 2);
    record.usedCount++;
    record.success = true;
    this.save();
  }

  /**
   * Penalise confidence when a fix fails.
   */
  penalise(id: string): void {
    const record = this.records.find(r => r.id === id);
    if (!record) return;
    record.confidence = Math.max(CONFIDENCE_MIN, record.confidence - CONFIDENCE_HIT * 3);
    this.save();
  }

  // ── Memory management ──────────────────────────────────────────────────────

  /**
   * Keep only the MAX_RECORDS highest-confidence records.
   */
  prune(): number {
    if (this.records.length <= MAX_RECORDS) return 0;
    this.records.sort((a, b) => b.confidence - a.confidence);
    const removed = this.records.length - MAX_RECORDS;
    this.records = this.records.slice(0, MAX_RECORDS);
    return removed;
  }

  stats(): MemoryStats {
    const byLanguage: Record<string, number> = {};
    let successCount = 0;
    for (const r of this.records) {
      byLanguage[r.language] = (byLanguage[r.language] ?? 0) + 1;
      if (r.success) successCount++;
    }
    const topPatterns = [...this.records]
      .sort((a, b) => b.usedCount - a.usedCount || b.confidence - a.confidence)
      .slice(0, 10);

    return {
      totalRecords: this.records.length,
      byLanguage,
      topPatterns,
      successRate:  this.records.length ? successCount / this.records.length : 0,
      lastPruned:   null,
    };
  }

  exportJSON(): string {
    return JSON.stringify(this.records, null, 2);
  }

  exportCSV(): string {
    const header = 'id,repo,language,issue,fix,success,timestamp,confidence,usedCount';
    const rows = this.records.map(r =>
      [r.id, r.repo, r.language, `"${r.issue.replace(/"/g, '""')}"`,
       `"${r.fix.replace(/"/g, '""')}"`, r.success, r.timestamp,
       r.confidence.toFixed(3), r.usedCount].join(',')
    );
    return [header, ...rows].join('\n');
  }

  importJSON(json: string): number {
    const incoming = JSON.parse(json) as RepairRecord[];
    const existingIds = new Set(this.records.map(r => r.id));
    const newRecords = incoming.filter(r => !existingIds.has(r.id));
    this.records.unshift(...newRecords);
    this.prune();
    this.save();
    return newRecords.length;
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private score(record: RepairRecord, repo: string, issueHint: string): number {
    let s = record.confidence;
    if (record.repo === repo) s += 0.2;
    if (issueHint) {
      const words = issueHint.toLowerCase().split(/\W+/).filter(Boolean);
      const issueWords = record.issue.toLowerCase().split(/\W+/).filter(Boolean);
      const overlap = words.filter(w => issueWords.includes(w)).length;
      s += (overlap / Math.max(words.length, 1)) * 0.3;
    }
    // Decay older records slightly
    const ageDays = (Date.now() - Date.parse(record.timestamp)) / 86_400_000;
    s -= Math.min(0.2, ageDays / 365);
    return s;
  }
}

// Singleton export
export const oracleMemory = new OracleMemory();