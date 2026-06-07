import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { addToBlockchain } from './blockchain.js';

const execAsync = promisify(exec);
const SURGERY_BASE = path.resolve('./surgery-room');
const REPAIRS_DIR = path.join(SURGERY_BASE, 'repairs');

export class SurgerySession {
    constructor(id, repoUrl, branchName, io, eliteConfig = {}) {
        this.id = id;
        this.repoUrl = repoUrl;
        this.repoName = repoUrl.split('/').pop().replace('.git', '');
        this.branchName = branchName;
        this.surgeryPath = path.join(REPAIRS_DIR, `${this.repoName}_${id}`);
        this.status = 'preparing';
        this.steps = [];
        this.io = io;
        this.eliteConfig = { dynamicShifting: true, blockchainAudit: true, selfHealing: true, ...eliteConfig };
        this.blockchainHash = addToBlockchain('session_created', { sessionId: id, repo: this.repoName, branch: branchName });
    }
    
    addStep(stepName, status, detail = '') {
        this.steps.push({ step: stepName, status, detail, timestamp: new Date() });
        this.io.emit('repair-update', { sessionId: this.id, step: stepName, status, detail });
    }
    
    complete(success, prNumber = null) {
        this.status = success ? 'successful' : 'failed';
        if (prNumber) this.prNumber = prNumber;
        addToBlockchain('session_completed', { sessionId: this.id, success, prNumber });
        this.io.emit('repair-complete', { sessionId: this.id, status: this.status, prNumber });
    }
}

export async function execPS(command, cwd) {
    if (!cwd || !fs.existsSync(cwd)) return { stdout: '', stderr: 'Invalid cwd' };
    const tmpFile = path.join(SURGERY_BASE, `_ps_${Date.now()}.ps1`);
    fs.writeFileSync(tmpFile, `Set-Location "${cwd}"\n${command}\n`, 'utf8');
    try {
        const { stdout, stderr } = await execAsync(`powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tmpFile}"`, { maxBuffer: 20*1024*1024, timeout: 120000 });
        return { stdout, stderr };
    } catch(error) {
        return { stdout: error.stdout || '', stderr: error.stderr || error.message };
    } finally { try { fs.unlinkSync(tmpFile); } catch(e) {} }
}