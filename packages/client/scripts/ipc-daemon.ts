// file: scripts/ipc-daemon.ts
import type { ChildProcess } from 'node:child_process';
import { spawn, exec } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const name = process.env.IPC_DAEMON_NAME || 'codegen';
const command = process.env.IPC_DAEMON_COMMAND || '';
const socketPath =
  process.platform === 'win32'
    ? `\\\\.\\pipe\\${name}`
    : path.join('/tmp', `${name}.sock`);

if (!command) {
  console.error('[ipc-daemon] IPC_DAEMON_COMMAND is required');
  process.exit(1);
}

const args = process.env.IPC_DAEMON_ARGS?.split(' ') ?? [];

let child: ChildProcess | null = null;

function start() {
  if (child) {
    console.warn(`[${name}] Already running, not starting again`);
    return;
  }
  console.log(`[${name}] Starting: ${command} ${args.join(' ')}`);
  child = spawn(command, args, { stdio: 'inherit' });

  child.on('exit', (code, signal) => {
    console.log(`[${name}] Process exited (${String(signal ?? code)})`);
    child = null;
  });
}

function stop() {
  if (!child) return;
  const pid = child.pid;
  console.log(`[${name}] Stopping process tree at PID ${String(pid)}...`);

  exec(`tree-kill ${String(pid)}`, (err) => {
    if (err) {
      console.error(`[${name}] Failed to kill process tree: ${err.message}`);
    } else {
      console.log(`[${name}] Process tree killed`);
    }
  });

  child = null;
}

// Remove stale socket
if (fs.existsSync(socketPath)) {
  try {
    fs.unlinkSync(socketPath);
    console.log(`[${name}] Cleaned up stale socket`);
  } catch (err) {
    console.error(`[${name}] Failed to unlink socket: ${String(err)}`);
  }
}

const server = net.createServer((conn) => {
  conn.setEncoding('utf8');

  conn.on('data', (chunk: string) => {
    console.log(`[daemon] raw chunk:`, JSON.stringify(chunk));
    for (const msg of chunk.split('\n')) {
      const trimmed = msg.trim();
      if (!trimmed) continue;

      console.log(`[daemon] received message: ${trimmed}`);

      if (trimmed === 'pause') stop();
      else if (trimmed === 'resume') start();
      else console.log(`[daemon] unknown message: ${trimmed}`);
    }
  });

  conn.on('end', () => console.log('[daemon] connection ended'));
  conn.on('error', (err) =>
    console.error('[daemon] connection error:', err.message)
  );

  console.log('[daemon] new connection');
});

server.listen(socketPath, () => {
  console.log(`[${name}] IPC daemon listening at ${socketPath}`);
  start();
});

process.on('SIGINT', () => {
  stop();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  stop();
  server.close(() => process.exit(0));
});
