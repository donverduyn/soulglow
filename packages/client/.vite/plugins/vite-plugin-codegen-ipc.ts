// file: scripts/vite-plugin-ipc-notifier.ts
import { spawn } from 'node:child_process';
import path from 'node:path';
import type { Plugin } from 'vite';

export interface IpcNotifierOptions {
  name: string;
  onStartMessage?: string;
  onStopMessage?: string;
  silent?: boolean;
  socketPath?: string;
}

export function createIpcNotifierPlugin(options: IpcNotifierOptions): Plugin {
  const {
    name,
    socketPath = process.platform === 'win32'
      ? `\\\\.\\pipe\\${options.name}`
      : `/tmp/${options.name}.sock`,
    onStartMessage = 'start',
    onStopMessage = 'resume',
    silent = true,
  } = options;

  function sendIpcMessageExternally(message: string) {
    const scriptPath = path.resolve('scripts/ipc-send.ts');
    if (!silent)
      console.log(`[vite/codegen] spawning detached IPC sender: ${message}`);

    const child = spawn('npx', ['tsx', scriptPath, socketPath, message], {
      detached: false,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (!silent)
        console.log(
          `[vite/codegen] IPC sender exited with code ${String(code)}`
        );
    });
  }

  async function gracefulShutdown(signal: string) {
    if (!silent)
      console.log(
        `[vite/${name}] received ${signal}, sending stop message "${onStopMessage}" externally`
      );
    sendIpcMessageExternally(onStopMessage);
    await new Promise((r) => setTimeout(r, 100));
    process.exit(0);
  }

  process.once('SIGINT', () => void gracefulShutdown('SIGINT'));
  process.once('SIGTERM', () => void gracefulShutdown('SIGTERM'));

  return {
    closeBundle() {
      sendIpcMessageExternally(onStopMessage);
    },

    configureServer(server) {
      if (!silent)
        console.log(`[vite/${name}] sending start message "${onStartMessage}"`);
      sendIpcMessageExternally(onStartMessage);

      server.httpServer?.on('close', () => {
        if (!silent)
          console.log(
            `[vite/${name}] HTTP server closed, sending stop message`
          );
        sendIpcMessageExternally(onStopMessage);
      });
    },

    name: `${name}-ipc-notifier`,
  };
}
