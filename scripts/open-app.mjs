// Windows double-click launcher. Keep the same origin as the development app:
// changing the hostname, port or base path would separate the local travel data.
import { spawn, spawnSync } from 'node:child_process';
import { closeSync, existsSync, openSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const base = '/Viagem_Grecia_2026/';
const url = `http://127.0.0.1:5173${base}`;
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');

async function appIsReady() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1200), redirect: 'error' });
    return response.ok && /<title>Atenas 2026/.test(await response.text());
  } catch {
    return false;
  }
}

function run(command) {
  const env = { ...process.env, VITE_BASE_PATH: base };
  // Respect the Windows trust store when this Node version supports it.
  if (process.allowedNodeEnvironmentFlags.has('--use-system-ca')) {
    env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --use-system-ca`.trim();
  }
  const result = spawnSync('cmd.exe', ['/d', '/c', command], {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
    env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Falha ao executar: ${command}`);
}

function newestChange(path) {
  if (!existsSync(path)) return 0;
  const info = statSync(path);
  return info.isDirectory()
    ? Math.max(0, ...readdirSync(path).map((name) => newestChange(join(path, name))))
    : info.mtimeMs;
}

async function main() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (process.platform !== 'win32') throw new Error('Use este iniciador no Windows.');
  if (major < 22 || (major === 22 && minor < 12)) {
    throw new Error('Atualize o Node.js para a versao 22.12 ou superior.');
  }
  if (!existsSync(vite)) {
    console.log('Preparando o aplicativo pela primeira vez. E necessario acesso a internet...');
    run('npm ci');
  }
  const index = join(root, 'dist', 'index.html');
  const changed = [
    'src',
    'public',
    'index.html',
    'vite.config.ts',
    'package.json',
    'package-lock.json',
  ].some((path) => newestChange(join(root, path)) > newestChange(index));
  if (!existsSync(index) || changed) {
    console.log('Atualizando os arquivos do aplicativo...');
    run('npm run build');
  }
  if (!(await appIsReady())) {
    const logPath = join(tmpdir(), 'atenas-2026-launcher.log');
    const log = openSync(logPath, 'w');
    const server = spawn(
      process.execPath,
      [vite, 'preview', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
      {
        cwd: root,
        env: { ...process.env, VITE_BASE_PATH: base },
        detached: true,
        windowsHide: true,
        stdio: ['ignore', log, log],
      },
    );
    closeSync(log);
    let launchError;
    server.on('error', (error) => {
      launchError = error;
    });
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      if (launchError) throw launchError;
      if (await appIsReady()) {
        ready = true;
        break;
      }
      if (server.exitCode !== null) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) {
      server.kill();
      throw new Error(
        `Nao foi possivel iniciar o aplicativo. Confira se a porta 5173 esta livre.\n${readFileSync(logPath, 'utf8').trim().slice(-2000)}\nRegistro: ${logPath}`,
      );
    }
    server.unref();
    console.log(`Servidor local iniciado (PID ${server.pid}).`);
  } else {
    console.log('O aplicativo ja esta aberto. Reutilizando o servidor local.');
  }
  console.log(`Atenas 2026: ${url}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
