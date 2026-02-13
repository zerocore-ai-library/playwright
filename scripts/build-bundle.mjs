import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) return resolve();
      reject(
        new Error(
          `Command failed: ${cmd} ${args.join(' ')} (code=${code ?? 'null'}, signal=${
            signal ?? 'null'
          })`
        )
      );
    });
  });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureUpstreamSubmoduleReady({ toolDir, upstreamDir }) {
  const required = [
    path.join(upstreamDir, 'package.json'),
    path.join(upstreamDir, 'package-lock.json'),
    path.join(upstreamDir, 'packages', 'playwright-mcp', 'cli.js'),
    path.join(upstreamDir, 'packages', 'playwright-mcp', 'package.json'),
  ];
  const missing = [];

  for (const filePath of required) {
    if (!(await pathExists(filePath))) missing.push(path.basename(filePath));
  }

  if (missing.length === 0) return;

  console.log(
    `\nNOTE: Upstream submodule checkout looks incomplete (missing: ${missing.join(', ')}).\n` +
      'Attempting to init/update the submodule...'
  );

  try {
    await run('git', ['submodule', 'sync', '--recursive'], { cwd: toolDir });
    await run('git', ['submodule', 'update', '--init', '--recursive', 'upstream'], { cwd: toolDir });
  } catch (err) {
    throw new Error(
      'Failed to init/update upstream submodule.\n' +
        `- Expected files: ${required.map((p) => path.relative(toolDir, p)).join(', ')}\n` +
        '- Try: git submodule update --init --recursive upstream\n' +
        `- Original error: ${err?.message ?? String(err)}`
    );
  }

  for (const filePath of required) {
    if (!(await pathExists(filePath))) {
      throw new Error(
        `Upstream submodule is still missing ${path.relative(toolDir, filePath)} after init/update.\n` +
          'Try: git submodule update --init --recursive upstream'
      );
    }
  }
}

async function main() {
  const toolDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const upstreamDir = path.join(toolDir, 'upstream');

  if (!(await pathExists(upstreamDir))) {
    throw new Error(`Missing upstream submodule at ${upstreamDir} (did you init submodules?)`);
  }
  await ensureUpstreamSubmoduleReady({ toolDir, upstreamDir });

  const srcDir = path.join(upstreamDir, 'packages', 'playwright-mcp');
  const dstDir = path.join(toolDir, 'server', 'playwright-mcp');

  // 1) Vendor upstream runtime package files.
  await fs.mkdir(dstDir, { recursive: true });
  await fs.copyFile(path.join(srcDir, 'cli.js'), path.join(dstDir, 'cli.js'));
  await fs.copyFile(path.join(srcDir, 'index.js'), path.join(dstDir, 'index.js'));
  await fs.copyFile(path.join(srcDir, 'package.json'), path.join(dstDir, 'package.json'));

  // 2) Install runtime dependencies for the bundled server (unless skipped).
  if (process.env.MCPB_SKIP_RUNTIME_DEPS === '1') {
    console.log('\nNOTE: Skipping runtime dependency install (MCPB_SKIP_RUNTIME_DEPS=1).');
    console.log('OK: playwright upstream runtime files prepared.');
    console.log(`- Vendored package: ${path.relative(toolDir, dstDir)}`);
    return;
  }

  const env = {
    ...process.env,
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD ?? '1',
  };

  await run('npm', ['ci', '--omit=dev', '--no-audit', '--no-fund'], { cwd: toolDir, env });

  console.log('\nOK: playwright MCPB bundle prepared.');
  console.log(`- Vendored package: ${path.relative(toolDir, dstDir)}`);
  console.log(`- Runtime deps: ${path.relative(toolDir, path.join(toolDir, 'node_modules'))}`);
}

main().catch((err) => {
  console.error(`\nERROR: ${err?.message ?? String(err)}`);
  process.exit(1);
});
