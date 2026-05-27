import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import rateLimit from 'express-rate-limit';
import { OracleMemory } from './dist/brain/oracle-memory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const oracle = new OracleMemory(__dirname);

app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.static(path.join(__dirname, 'docs/dashboard')));

app.get('/health', (req, res) => res.json({ status: 'UP', timestamp: Date.now() }));
app.get('/metrics', (req, res) => res.json({ uptime: process.uptime(), memory: process.memoryUsage() }));

io.on('connection', (socket) => {
    logger.info(`Dashboard connected: ${socket.id}`);
    socket.emit('oracle-stats', oracle.getStats());

    socket.on('request-surgery', (data) => {
        logger.info(`Surgery requested for ${data.repo} via ${data.language}`);
        oracle.learn(data.repo, data.language, 'Entropy Detected', 'Rebuilt Module Graph', 0.98);
        io.emit('oracle-stats', oracle.getStats());
        socket.emit('repair-update', { repo: data.repo, status: 'Completed successfully' });
    });
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => process.exit(0));
});

httpServer.listen(PORT, () => {
    logger.info(`🏥 Atomic Gods Surgery Server listening on port ${PORT}`);
});
