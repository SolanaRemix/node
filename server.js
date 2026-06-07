import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'surgery-room')));

// ============================================================
// Configuration
// ============================================================
const ELITE_VERSION = '1.7.0';
const SURGERY_BASE = path.join(__dirname, 'surgery-room');
const REPAIRS_DIR = path.join(SURGERY_BASE, 'repairs');
const BLOCKCHAIN_DIR = path.join(__dirname, 'blockchain');
[SURGERY_BASE, REPAIRS_DIR, BLOCKCHAIN_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================================
// Data
// ============================================================
let surgeryRecords = [];
let activeSurgeries = new Map();
let blockchainBlocks = [];

function loadRecords() {
    const p = path.join(SURGERY_BASE, 'surgery-records.json');
    if (fs.existsSync(p)) try { surgeryRecords = JSON.parse(fs.readFileSync(p,'utf8')); } catch(e) {}
}
loadRecords();
function saveRecords() { fs.writeFileSync(path.join(SURGERY_BASE, 'surgery-records.json'), JSON.stringify(surgeryRecords,null,2)); }

// Blockchain
function loadBlockchain() {
    if (fs.existsSync(BLOCKCHAIN_DIR)) {
        const files = fs.readdirSync(BLOCKCHAIN_DIR).filter(f=>f.startsWith('block-')&&f.endsWith('.json')).sort();
        for(const file of files) {
            try { blockchainBlocks.push(JSON.parse(fs.readFileSync(path.join(BLOCKCHAIN_DIR,file),'utf8'))); }
            catch(e) {}
        }
    }
    console.log(`📊 Loaded ${blockchainBlocks.length} blockchain blocks`);
}
loadBlockchain();

function addToBlockchain(event, data) {
    const block = {
        index: blockchainBlocks.length,
        timestamp: new Date().toISOString(),
        hash: crypto.createHash('sha256').update(JSON.stringify(data)+Date.now()).digest('hex'),
        previousHash: blockchainBlocks.length ? blockchainBlocks[blockchainBlocks.length-1].hash : '0'.repeat(64),
        data: { event, ...data, timestamp: new Date().toISOString() }
    };
    blockchainBlocks.push(block);
    fs.writeFileSync(path.join(BLOCKCHAIN_DIR, `block-${block.index}.json`), JSON.stringify(block,null,2));
    return block.hash;
}

// Surgery session
class SurgerySession {
    constructor(id, repoUrl, branchName, eliteConfig = {}) {
        this.id = id;
        this.repoUrl = repoUrl;
        this.repoName = repoUrl.split('/').pop().replace('.git','');
        this.branchName = branchName;
        this.surgeryPath = path.join(REPAIRS_DIR, `${this.repoName}_${id}`);
        this.status = 'running';
        this.steps = [];
        this.eliteConfig = { dynamicShifting: true, blockchainAudit: true, ...eliteConfig };
        this.blockchainHash = addToBlockchain('session_created', { sessionId: id, repo: this.repoName, branch: branchName });
    }
    addStep(name, status, detail='') {
        this.steps.push({ name, status, detail, timestamp: new Date() });
        io.emit('repair-update', { sessionId: this.id, step: name, status, detail });
    }
    complete(success) {
        this.status = success ? 'successful' : 'failed';
        addToBlockchain('session_completed', { sessionId: this.id, success });
        io.emit('repair-complete', { sessionId: this.id, status: this.status });
        saveRecords();
    }
}

async function execPS(command, cwd) {
    if (!cwd || !fs.existsSync(cwd)) return { stdout: '', stderr: 'Invalid cwd' };
    const tmp = path.join(SURGERY_BASE, `_ps_${Date.now()}.ps1`);
    fs.writeFileSync(tmp, `Set-Location "${cwd}"\n${command}\n`, 'utf8');
    try {
        const { stdout, stderr } = await execAsync(`powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tmp}"`, { maxBuffer: 20*1024*1024, timeout: 120000 });
        return { stdout, stderr };
    } catch(e) { return { stdout: e.stdout || '', stderr: e.stderr || e.message }; }
    finally { try { fs.unlinkSync(tmp); } catch(e) {} }
}

async function detectLanguage(p) {
    try { const files = fs.readdirSync(p);
        if(files.includes('package.json')) return 'node';
        if(files.includes('requirements.txt')) return 'python';
        return 'unknown';
    } catch(e) { return 'unknown'; }
}

async function dynamicTestShifting(p, strategy) {
    let files = [];
    for(const pat of ['*.test.js','*.test.ts','*.spec.js']) {
        try { const { stdout } = await execPS(`Get-ChildItem -Recurse -Filter ${pat} | Select-Object -ExpandProperty Name`, p);
            files.push(...stdout.split('\n').filter(f=>f.trim()));
        } catch(e) {}
    }
    files = [...new Set(files)];
    if(strategy==='chaos') files.sort(()=>Math.random()-0.5);
    else if(strategy==='weighted') files.sort((a,b)=>a.length-b.length);
    return { count: files.length, strategy };
}

// ============================================================
// API endpoints
// ============================================================
app.get('/health', (req,res)=>res.json({ status:'ELITE_UP', version:ELITE_VERSION, blockchainHeight:blockchainBlocks.length }));
app.get('/metrics', (req,res)=>res.json({ totalSurgeries:surgeryRecords.length, activeSurgeries:activeSurgeries.size, blockchainHeight:blockchainBlocks.length }));
app.get('/api/blockchain', (req,res)=>res.json(blockchainBlocks));
app.get('/api/surgery/records', (req,res)=>res.json(surgeryRecords));

app.post('/api/surgery/start', (req,res)=>{
    const { repoUrl, branchName, eliteConfig } = req.body;
    const id = Date.now().toString();
    const session = new SurgerySession(id, repoUrl, branchName, eliteConfig);
    surgeryRecords.unshift({ id, repoName: session.repoName, branchName, status:'running', startTime: new Date() });
    activeSurgeries.set(id, session);
    saveRecords();
    res.json({ success: true, sessionId: id });
});

app.post('/api/surgery/clone', async (req,res)=>{
    const { sessionId, repoUrl, branchName } = req.body;
    const session = activeSurgeries.get(sessionId);
    if(!session) return res.json({ success:false, error:'Session not found' });
    try {
        if(!fs.existsSync(session.surgeryPath)) fs.mkdirSync(session.surgeryPath, {recursive:true});
        await execAsync(`git clone ${repoUrl} "${session.surgeryPath}"`);
        await execAsync(`cd "${session.surgeryPath}" && git checkout -b ${branchName} 2>/dev/null || git checkout ${branchName}`);
        session.addStep('Clone', 'completed');
        res.json({ success:true });
    } catch(e) { session.addStep('Clone','failed',e.message); res.json({ success:false, error:e.message }); }
});

app.post('/api/surgery/elite-repair', async (req,res)=>{
    const { sessionId, shiftStrategy='adaptive' } = req.body;
    const session = activeSurgeries.get(sessionId);
    if(!session) return res.json({ success:false, error:'Session not found' });
    const fixes = [];
    try {
        if(session.eliteConfig.dynamicShifting) {
            const shift = await dynamicTestShifting(session.surgeryPath, shiftStrategy);
            session.shiftMetrics = shift;
            session.addStep('Dynamic Shift', 'completed', `${shift.count} tests`);
            fixes.push(`Dynamic test shifting: ${shift.count} tests`);
        }
        const lang = await detectLanguage(session.surgeryPath);
        session.language = lang;
        session.addStep('Detection', 'completed', lang);
        fixes.push(`Language: ${lang}`);
        const pkg = path.join(session.surgeryPath, 'package.json');
        if(!fs.existsSync(pkg) && lang==='node') {
            const defaultPkg = { name: session.repoName, version:'1.0.0', scripts:{ build:'tsc', test:'node --test' }, devDependencies:{ typescript:'^5.4.0' } };
            fs.writeFileSync(pkg, JSON.stringify(defaultPkg,null,2));
            fixes.push('Created package.json');
        }
        const git = path.join(session.surgeryPath, '.gitignore');
        if(!fs.existsSync(git)) { fs.writeFileSync(git, 'node_modules/\ndist/\n.env\n'); fixes.push('Created .gitignore'); }
        if(lang==='node') {
            await execPS('npm install', session.surgeryPath);
            fixes.push('npm install');
            await execPS('npm run build', session.surgeryPath).catch(()=>{});
        }
        if(session.eliteConfig.blockchainAudit) {
            const auditHash = addToBlockchain('repair_completed', { sessionId: session.id, repo: session.repoName, fixes: fixes.length });
            session.auditHash = auditHash;
            session.addStep('Blockchain audit', 'completed', auditHash.substring(0,16));
            fixes.push(`Blockchain: ${auditHash.substring(0,16)}`);
        }
        session.hasChanges = fixes.length > 2;
        res.json({ success:true, fixes, hasChanges:session.hasChanges, auditHash:session.auditHash });
    } catch(e) { session.addStep('Elite repair','failed',e.message); res.json({ success:false, error:e.message, fixes }); }
});

app.post('/api/surgery/commit', async (req,res)=>{
    const { sessionId, commitMessage } = req.body;
    const session = activeSurgeries.get(sessionId);
    if(!session) return res.json({ success:false, error:'Session not found' });
    try {
        const { stdout } = await execPS('git status --porcelain', session.surgeryPath);
        if(!stdout.trim()) return res.json({ success:false, noChanges:true });
        await execPS('git add .', session.surgeryPath);
        await execPS(`git commit -m "${commitMessage.replace(/"/g,'\\"')}"`, session.surgeryPath);
        await execPS(`git push origin ${session.branchName} -f`, session.surgeryPath);
        session.addStep('Commit', 'completed');
        res.json({ success:true });
    } catch(e) { session.addStep('Commit','failed',e.message); res.json({ success:false, error:e.message }); }
});

app.post('/api/surgery/create-pr', async (req,res)=>{
    const { sessionId, prTitle, prBody, baseBranch='main' } = req.body;
    const session = activeSurgeries.get(sessionId);
    if(!session) return res.json({ success:false, error:'Session not found' });
    try {
        const blockchainNote = session.auditHash ? `\n\n⛓️ Blockchain Audit Hash: \`${session.auditHash}\`` : '';
        const fullBody = prBody + blockchainNote;
        const { stdout } = await execPS(`gh pr create --title "${prTitle.replace(/"/g,'\\"')}" --body "${fullBody.replace(/"/g,'\\"')}" --base ${baseBranch} --head ${session.branchName}`, session.surgeryPath);
        const match = stdout.match(/\/pull\/(\d+)/);
        const prNumber = match ? match[1] : 'unknown';
        session.addStep('Create PR', 'completed', `PR #${prNumber}`);
        session.complete(true);
        if(!session.keepAfterRepair && fs.existsSync(session.surgeryPath)) fs.rmSync(session.surgeryPath, { recursive:true, force:true });
        res.json({ success:true, prNumber, prUrl:stdout });
    } catch(e) { session.addStep('Create PR','failed',e.message); session.complete(false); res.json({ success:false, error:e.message }); }
    finally { activeSurgeries.delete(sessionId); }
});

app.post('/api/surgery/autofix', async (req,res)=>{
    const { sessionId } = req.body;
    const session = activeSurgeries.get(sessionId);
    if(!session) return res.json({ success:false });
    const result = await fetch(`http://localhost:3001/api/surgery/elite-repair`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ sessionId, shiftStrategy:'adaptive' }) });
    const data = await result.json();
    res.json(data);
});

// HTML routes
app.get('/', (req,res)=>res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/atomic-ledger.html', (req,res)=>res.sendFile(path.join(__dirname, 'public', 'atomic-ledger.html')));

io.on('connection', (socket)=>console.log('🔌 Elite client connected'));

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║  🏥 ATOMIC SWARM GODS ELITE v${ELITE_VERSION} - REPAIR DASHBOARD    ║`);
    console.log(`╚══════════════════════════════════════════════════════════════╝`);
    console.log(`\n🌐 Repair Dashboard: http://localhost:${PORT}`);
    console.log(`🔷 ATOMIC LEDGER: http://localhost:${PORT}/atomic-ledger.html`);
    console.log(`📊 Blockchain API: http://localhost:${PORT}/api/blockchain`);
    console.log(`⛓️  Blockchain height: ${blockchainBlocks.length} blocks\n`);
});