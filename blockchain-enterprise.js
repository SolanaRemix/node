const fs = require('fs');
const crypto = require('crypto');

class EnterpriseBlockchain {
    constructor(chainPath = './blockchain') {
        this.chainPath = chainPath;
        this.chain = [];
        this.loadChain();
    }

    loadChain() {
        if (fs.existsSync(this.chainPath)) {
            const files = fs.readdirSync(this.chainPath).filter(f => f.endsWith('.json'));
            this.chain = files.map(f => JSON.parse(fs.readFileSync(`${this.chainPath}/${f}`)));
            this.chain.sort((a,b) => a.index - b.index);
        }
    }

    addBlock(data, type = 'SURGERY_EVENT') {
        const index = this.chain.length;
        const timestamp = new Date().toISOString();
        const previousHash = index === 0 ? '0'.repeat(64) : this.chain[index-1].hash;
        
        const block = {
            index,
            timestamp,
            type,
            data,
            previousHash,
            hash: this.calculateHash(index, timestamp, data, previousHash),
            enterprise: {
                version: '1.7.0-enterprise',
                environment: 'production',
                verified: true
            }
        };
        
        fs.writeFileSync(`${this.chainPath}/block-${index}.json`, JSON.stringify(block, null, 2));
        this.chain.push(block);
        return block;
    }

    calculateHash(index, timestamp, data, previousHash) {
        const payload = `${index}${timestamp}${JSON.stringify(data)}${previousHash}`;
        return crypto.createHash('sha256').update(payload).digest('hex');
    }

    verifyIntegrity() {
        for (let i = 1; i < this.chain.length; i++) {
            if (this.chain[i].previousHash !== this.chain[i-1].hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = EnterpriseBlockchain;
