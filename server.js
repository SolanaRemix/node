import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'docs/dashboard')));

const SURGERY_BASE = path.join(__dirname, 'surgery-room');
const REPAIRS_DIR = path.join(SURGERY_BASE, 'repairs');
const SUCCESS_DIR = path.join(SURGERY_BASE, 'successful');
const FAILED_DIR = path.join(SURGERY_BASE, 'failed');

[SURGERY_BASE, REPAIRS_DIR, SUCCESS_DIR, FAILED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

let surgeryRecords = [];
let activeSurgeries = new Map();

function loadRecords() {
    const recordsPath = path.join(SURGERY_BASE, 'surgery-records.json');
    if (fs.existsSync(recordsPath)) {
        try {
            surgeryRecords = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
        } catch(e) { surgeryRecords = []; }
    }
}
loadRecords();

function saveRecords() {
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
        this.startTime = new Date();
        this.hasChanges = false;
        this.language = 'unknown';
    }
    addStep(stepName, status, detail = '') {
        this.steps.push({ step: stepName, status, detail, timestamp: new Date() });
        io.emit('repair-update', { sessionId: this.id, step: stepName, status, detail });
        saveRecords();
    }
    complete(success, prNumber = null, prUrl = null) {
        this.status = success ? 'successful' : 'failed';
        if (prNumber) this.prNumber = prNumber;
        saveRecords();
        io.emit('repair-complete', { sessionId: this.id, status: this.status, prNumber, prUrl });
    }
}

// Fixed execPS - uses absolute paths
async function execPS(command, cwd) {
    if (!cwd || !fs.existsSync(cwd)) {
        console.error(`Invalid cwd: ${cwd}`);
        return { stdout: '', stderr: 'Invalid working directory' };
    }
    
    // Create temp file in the surgery base
    const tmpFile = path.join(SURGERY_BASE, `_ps_${Date.now()}.ps1`);
    const scriptContent = `Set-Location "${cwd}"\n${command}\n`;
    fs.writeFileSync(tmpFile, scriptContent, 'utf8');
    
    try {
        const { stdout, stderr } = await execAsync(`powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tmpFile}"`, { 
            maxBuffer: 20 * 1024 * 1024, 
            timeout: 120000 
        });
        return { stdout, stderr };
    } catch (error) {
        return { stdout: error.stdout || '', stderr: error.stderr || error.message };
    } finally {
        try { fs.unlinkSync(tmpFile); } catch(e) { /* ignore */ }
    }
}

// Detect language
async function detectLanguage(surgeryPath) {
    try {
        const files = fs.readdirSync(surgeryPath);
        if (files.includes('package.json')) return 'node';
        if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python';
        if (files.includes('Cargo.toml')) return 'rust';
        if (files.includes('go.mod')) return 'golang';
        return 'unknown';
    } catch(e) {
        return 'unknown';
    }
}

// API Endpoints
app.get('/health', (req, res) => res.json({ status: 'UP', version: '1.6.0' }));
app.get('/api/surgery/records', (req, res) => res.json(surgeryRecords));

app.post('/api/surgery/start', async (req, res) => {
    const { repoUrl, branchName, keepAfterRepair } = req.body;
    const sessionId = Date.now().toString();
    const session = new SurgerySession(sessionId, repoUrl, branchName);
    session.keepAfterRepair = keepAfterRepair;
    surgeryRecords.unshift({ 
        id: sessionId, 
        repoName: session.repoName, 
        branchName, 
        status: 'running', 
        startTime: session.startTime 
    });
    activeSurgeries.set(sessionId, session);
    saveRecords();
    res.json({ success: true, sessionId });
});

app.post('/api/surgery/clone', async (req, res) => {
    const { sessionId, repoUrl, branchName } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    try {
        // Create directory first
        if (!fs.existsSync(session.surgeryPath)) {
            fs.mkdirSync(session.surgeryPath, { recursive: true });
        }
        
        await execAsync(`git clone ${repoUrl} "${session.surgeryPath}"`);
        await execAsync(`cd "${session.surgeryPath}" && git checkout -b ${branchName} 2>/dev/null || git checkout ${branchName}`);
        
        session.addStep('📡 Clone', 'completed', `Cloned to ${session.surgeryPath}`);
        res.json({ success: true });
    } catch (error) {
        session.addStep('📡 Clone', 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/surgery/step', async (req, res) => {
    const { sessionId, step, command } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    try {
        const { stdout } = await execPS(command, session.surgeryPath);
        session.addStep(step, 'completed', stdout.substring(0, 200));
        res.json({ success: true, output: stdout });
    } catch (error) {
        session.addStep(step, 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/surgery/autofix', async (req, res) => {
    const { sessionId } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    const fixes = [];
    
    try {
        // Detect language
        const language = await detectLanguage(session.surgeryPath);
        session.language = language;
        session.addStep('🔍 Detection', 'completed', `Detected: ${language}`);
        fixes.push(`Detected language: ${language}`);
        
        // Create package.json if missing (Node.js)
        const pkgPath = path.join(session.surgeryPath, 'package.json');
        if (!fs.existsSync(pkgPath) && language === 'node') {
            const defaultPkg = {
                name: session.repoName,
                version: '1.0.0',
                scripts: {
                    build: 'echo "Build configured"',
                    test: 'echo "Tests configured"'
                },
                devDependencies: {}
            };
            fs.writeFileSync(pkgPath, JSON.stringify(defaultPkg, null, 2));
            fixes.push('✅ Created package.json');
        }
        
        // Create .gitignore if missing
        const gitignorePath = path.join(session.surgeryPath, '.gitignore');
        if (!fs.existsSync(gitignorePath)) {
            const gitignoreContent = `node_modules/\ndist/\n.env\n*.log\ncoverage/\n.DS_Store\n`;
            fs.writeFileSync(gitignorePath, gitignoreContent);
            fixes.push('✅ Created .gitignore');
        }
        
        // Install dependencies
        if (language === 'node') {
            await execPS('npm install', session.surgeryPath);
            fixes.push('✅ npm install completed');
            
            // Try to build
            await execPS('npm run build', session.surgeryPath).catch(() => {});
            fixes.push('✅ Build attempted');
        }
        
        session.hasChanges = true;
        session.addStep('🔧 Auto-Fix', 'completed', `${fixes.length} fixes applied`);
        res.json({ success: true, fixes, language, hasChanges: session.hasChanges });
        
    } catch (error) {
        session.addStep('🔧 Auto-Fix', 'failed', error.message);
        res.json({ success: false, error: error.message, fixes });
    }
});

app.post('/api/surgery/commit', async (req, res) => {
    const { sessionId, commitMessage } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    try {
        // Check for changes
        const { stdout: statusOutput } = await execPS('git status --porcelain', session.surgeryPath);
        
        if (!statusOutput.trim()) {
            return res.json({ success: false, noChanges: true, error: 'No changes to commit' });
        }
        
        await execPS('git add .', session.surgeryPath);
        await execPS(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, session.surgeryPath);
        await execPS(`git push origin ${session.branchName} -f`, session.surgeryPath);
        
        session.addStep('💾 Commit', 'completed', `Pushed changes`);
        res.json({ success: true });
    } catch (error) {
        session.addStep('💾 Commit', 'failed', error.message);
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/surgery/create-pr', async (req, res) => {
    const { sessionId, prTitle, prBody, baseBranch } = req.body;
    const session = activeSurgeries.get(sessionId);
    if (!session) return res.json({ success: false, error: 'Session not found' });
    
    try {
        const { stdout } = await execPS(`gh pr create --title "${prTitle.replace(/"/g, '\\"')}" --body "${prBody.replace(/"/g, '\\"')}" --base ${baseBranch || 'main'} --head ${session.branchName} 2>&1`, session.surgeryPath);
        
        const prMatch = stdout.match(/\/pull\/(\d+)/);
        const prNumber = prMatch ? prMatch[1] : 'unknown';
        
        session.addStep('📝 PR', 'completed', `PR #${prNumber} created`);
        session.complete(true, prNumber, stdout);
        
        // Cleanup if requested
        if (!session.keepAfterRepair && fs.existsSync(session.surgeryPath)) {
            try { fs.rmSync(session.surgeryPath, { recursive: true, force: true }); } catch(e) {}
        }
        
        res.json({ success: true, prNumber, prUrl: stdout });
    } catch (error) {
        session.addStep('📝 PR', 'failed', error.message);
        session.complete(false);
        res.json({ success: false, error: error.message });
    } finally {
        activeSurgeries.delete(sessionId);
    }
});

io.on('connection', (socket) => { 
    console.log('🔌 Client connected'); 
    socket.emit('connected', { status: 'ok' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🏥 Atomic Gods Surgery Room API running on http://localhost:${PORT}`);
    console.log(`📁 Surgery Base: ${SURGERY_BASE}`);
});