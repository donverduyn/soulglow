import { execSync } from 'node:child_process';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[ensure-service] Missing required env var: ${key}`);
    process.exit(1);
  }
  return value;
}

function getRunningServices(): string[] {
  try {
    const output = execSync(
      'docker compose ps --services --filter "status=running"',
      {
        encoding: 'utf-8',
      }
    );
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (err) {
    console.error(
      '[ensure-service] Failed to check running services:',
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }
}

function runCommand(command: string): void {
  try {
    execSync(command, { shell: 'bash', stdio: 'inherit' });
  } catch (err) {
    console.error(
      '[ensure-service] Command execution failed:',
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }
}

function main(): void {
  const service = getEnv('ENSURE_SERVICE');
  const command = getEnv('ENSURE_COMMAND');

  const runningServices = getRunningServices();

  if (runningServices.includes(service)) {
    console.log(
      `[ensure-service] "${service}" is already running. Skipping command.`
    );
    return;
  }

  console.log(
    `[ensure-service] "${service}" not running. Executing: ${command}`
  );
  runCommand(command);
}

main();
