import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOCKCHAIN_DIR = path.resolve('./blockchain');

let blockchainBlocks = [];

export function loadBlockchain() {
    if (fs.existsSync(BLOCKCHAIN_DIR)) {
        const files = fs.readdirSync(BLOCKCHAIN_DIR).filter(f => f.startsWith('block-') && f.endsWith('.json')).sort();
        for (const file of files) {
            try {
                const block = JSON.parse(fs.readFileSync(path.join(BLOCKCHAIN_DIR, file), 'utf8'));
                blockchainBlocks.push(block);
                console.log(`✅ Loaded: ${file}`);
            } catch(e) {}
        }
    }
    console.log(`📊 Loaded ${blockchainBlocks.length} blocks`);
    return blockchainBlocks;
}

export function generateBlockHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data) + Date.now()).digest('hex');
}

export function addToBlockchain(event, data) {
    const block = {
        index: blockchainBlocks.length,
        timestamp: new Date().toISOString(),
        hash: generateBlockHash(data),
        previousHash: blockchainBlocks.length > 0 ? blockchainBlocks[blockchainBlocks.length - 1].hash : '0'.repeat(64),
        data: { event, ...data, timestamp: new Date().toISOString() }
    };
    blockchainBlocks.push(block);
    fs.writeFileSync(path.join(BLOCKCHAIN_DIR, `block-${block.index}.json`), JSON.stringify(block, null, 2));
    return block.hash;
}

export function getBlockchain() {
    return blockchainBlocks;
}

export function getBlockchainHeight() {
    return blockchainBlocks.length;
}