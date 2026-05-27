// server.js - Complete Surgery Room with Working Auto-Fix
import { exec } from 'child_process';
import { promisify } from 'util';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('docs/dashboard'));

const SURGERY_BASE = 'D:/dev/surgery-room';
const REPAIRS_DIR = path.join(SURGERY_BASE, 'repairs');
const SUCCESS_DIR = path.join(SURGERY_BASE, 'successful');
const FAILED_DIR = path.join(SURGERY_BASE, 'failed');

[SURGERY_BASE, REPAIRS_DIR, SUCCESS_DIR, FAILED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

let surgeryRecords = [];
let activeSurgeries = new Map();

function loadSurgeryRecords() {
    const recordsPath = path.join(SURGERY_BASE, 'surgery-records.json');
    if (fs.existsSync(recordsPath)) {
        surgeryRecords = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
    }
}
loadSurgeryRecords();

function saveSurgeryRecords() {
    fs.writeFileSync(path.join(SURGERY_BASE, 'surgery-records.json'), JSON.stringify(surgeryRecords, null, 2));
}

class SurgerySession {
    constructor(id, repoUrl, branchName) {
        this.id = id;
        this.repoUrl = repoUrl;
        this.repoName = repoUrl.split('/').pop().replace('.git', '');
        this.branchName = branchName;
        this.surgeryPath = path.join(REPAIRS_DIR, `${this.repoName}_${id}`);
        this.status = 'preparing';
        this.steps = [];
        this.prNumber = null;
        this.prUrl = null;
        this.startTime = new Date();
        this.endTime = null;
        this.hasChanges = false;
    }
    
    addStep(stepName, status, output = '') {
        this.steps.push({ step: stepName, status: status, output: output.substring(0, 500), timestamp: new Date() });
        saveSurgeryRecords();
    }
    
    complete(success, prNumber = null, prUrl = null) {
        this.status = success ? 'successful' : 'failed';
        this.endTime = new Date();
        if (prNumber) this.prNumber = prNumber;
        if (prUrl) this.prUrl = prUrl;
        const targetDir = success ? SUCCESS_DIR : FAILED_DIR;
        const newPath = path.join(targetDir, `${this.repoName}_${this.id}_${success ? 'SUCCESS' : 'FAILED'}`);
        try { fs.renameSync(this.surgeryPath, newPath); } catch(e) {}
        saveSurgeryRecords();
    }
    
    async cleanup() {
        try {
            await execAsync(`Remove-Item -Recurse -Force "${this.surgeryPath}" -ErrorAction SilentlyContinue`, { shell: 'powershell.exe' });
            return true;
        } catch(e) { return false; }
    }
}

async function execPS(command, cwd) {
    const psCommand = `Set-Location "${cwd}"; ${command}`;
    const { stdout, stderr } = await execAsync(psCommand, { shell: 'powershell.exe', maxBuffer: 20 * 1024 * 1024, timeout: 120000 });
    return { stdout, stderr };
}

// API: Start Surgery
app.post('/api/surgery/start', async (req, res) => {
    const { repoUrl, branchName, keepAfterRepair } = req.body;
    const sessionId = Date.now().toString();
    const session = new SurgerySession(sessionId, repoUrl, branchName);
    session.keepAfterRepair = keepAfterRepair;
    surgeryRecords.unshift({ id: sessionId, repoName: session.repoName, branchName, status: 'running', startTime: session.startTime, prNumber: null, keepAfterRepair });
    activeSurgeries.set(sessionId, session);
    saveSurgeryRecords();
    res.json({ success: true, sessionId });
});

// API: Clone Repository
app.post('/api/surgery/clone', async (req, res) => {
    const { sessionId, repoUrl, branchName } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    try {
        await execAsync(`git clone ${repoUrl} "${session.surgeryPath}"`, { shell: 'powershell.exe' });
        try {
            await execAsync(`cd "${session.surgeryPath}"; git checkout -b ${branchName}`, { shell: 'powershell.exe' });
        } catch { /* branch exists */ }
        session.addStep('clone', 'completed', `Cloned to ${session.surgeryPath}`);
        res.json({ success: true, surgeryPath: session.surgeryPath });
    } catch (error) {
        session.addStep('clone', 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});

// API: Execute Step
app.post('/api/surgery/step', async (req, res) => {
    const { sessionId, step, command } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    try {
        const { stdout, stderr } = await execPS(command, session.surgeryPath);
        session.addStep(step, 'completed', stdout);
        res.json({ success: true, output: stdout });
    } catch (error) {
        session.addStep(step, 'failed', error.message);
        res.json({ success: false, output: error.stdout, error: error.message });
    }
});

// API: Auto-Fix
app.post('/api/surgery/autofix', async (req, res) => {
    const { sessionId } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    const fixes = [];
    try {
        await execPS('npm install --save-dev typescript @types/node', session.surgeryPath);
        fixes.push('✅ Installed dependencies');
        
        session.addStep('Auto-Fix', 'completed', fixes.join('\n'));
        session.hasChanges = true;
        res.json({ success: true, fixes });
    } catch (error) {
        session.addStep('Auto-Fix', 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});

// API: Commit Changes
app.post('/api/surgery/commit', async (req, res) => {
    const { sessionId, commitMessage } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    try {
        const { stdout: statusOutput } = await execPS('git status --porcelain', session.surgeryPath);
        if (!statusOutput.trim()) return res.json({ success: false, error: 'No changes to commit', noChanges: true });
        await execPS('git add .', session.surgeryPath);
        await execPS(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, session.surgeryPath);
        await execPS(`git push origin ${session.branchName} -f`, session.surgeryPath);
        session.addStep('Commit & Push', 'completed', statusOutput);
        res.json({ success: true, changes: statusOutput });
    } catch (error) {
        session.addStep('Commit & Push', 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});

// API: Create PR
app.post('/api/surgery/create-pr', async (req, res) => {
    const { sessionId, prTitle, prBody, baseBranch } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    try {
        const { stdout } = await execPS(`gh pr create --title "${prTitle.replace(/"/g, '\\"')}" --body "${prBody.replace(/"/g, '\\"')}" --base ${baseBranch || 'main'} --head ${session.branchName}`, session.surgeryPath);
        const prMatch = stdout.match(/\/pull\/(\d+)/);
        const prNumber = prMatch ? prMatch[1] : 'unknown';
        session.complete(true, prNumber, stdout.trim());
        if (!session.keepAfterRepair) await session.cleanup();
        res.json({ success: true, prNumber, prUrl: stdout.trim() });
    } catch (error) {
        session.complete(false);
        res.json({ success: false, error: error.message });
    } finally { activeSurgeries.delete(sessionId); }
});

// API: Get Records
app.get('/api/surgery/records', (req, res) => { res.json(surgeryRecords); });

// API: Cleanup
app.post('/api/surgery/cleanup', async (req, res) => {
    const { sessionId } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (session) { const deleted = await session.cleanup(); activeSurgeries.delete(sessionId); res.json({ success: deleted }); }
    else { res.json({ success: false }); }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🏥 Atomic Gods Surgery Room API running on http://localhost:${PORT}`);
    console.log(`📁 Surgery Base: ${SURGERY_BASE}`);
});

// PATCHED: Fixed autofix endpoint with actual file creation
app.post('/api/surgery/autofix', async (req, res) => {
    const { sessionId } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    const fixes = [];
    const surgeryPath = session.surgeryPath;
    
    try {
        // Create package.json if missing
        const pkgPath = path.join(surgeryPath, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            const defaultPkg = {
                name: session.repoName,
                version: "1.0.0",
                scripts: { build: "tsc", test: "jest" },
                devDependencies: { typescript: "^5.0.0", "@types/node": "^20.0.0" }
            };
            fs.writeFileSync(pkgPath, JSON.stringify(defaultPkg, null, 2));
            fixes.push("Created package.json");
        }
        
        // Create tsconfig.json if missing
        const tscPath = path.join(surgeryPath, 'tsconfig.json');
        if (!fs.existsSync(tscPath)) {
            const defaultTsc = {
                compilerOptions: {
                    target: "ES2022",
                    module: "commonjs",
                    lib: ["ES2022", "DOM"],
                    types: ["node"],
                    strict: true,
                    outDir: "./dist",
                    rootDir: "./src",
                    esModuleInterop: true,
                    skipLibCheck: true
                },
                include: ["src/**/*"],
                exclude: ["node_modules", "dist"]
            };
            fs.writeFileSync(tscPath, JSON.stringify(defaultTsc, null, 2));
            fixes.push("Created tsconfig.json");
        }
        
        // Install dependencies
        await execPS('npm install --save-dev typescript @types/node', surgeryPath);
        fixes.push("Installed dependencies");
        
        session.hasChanges = fixes.length > 0;
        session.addStep('Auto-Fix', 'completed', fixes.join('\n'));
        res.json({ success: true, fixes, hasChanges: session.hasChanges });
    } catch (error) {
        session.addStep('Auto-Fix', 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});
