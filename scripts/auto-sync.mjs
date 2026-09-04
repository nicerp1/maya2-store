import { execFile } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredParts = new Set(['.git', 'node_modules', 'coverage']);
let timer;
let syncing = false;

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: root, windowsHide: true }, (error, stdout, stderr) => {
      if (error) return reject(Object.assign(error, { stderr }));
      resolve(stdout.trim());
    });
  });
}

async function sync() {
  if (syncing) return;
  syncing = true;
  try {
    if (!(await run('git', ['status', '--porcelain']))) return;
    await run('git', ['add', '-A']);
    const stamp = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Tehran' }).format(new Date()).replace(' ', 'T');
    await run('git', ['commit', '-m', `Auto-sync: ${stamp}`]);
    await run('git', ['push', 'origin', 'main']);
    console.log(`[sync] GitHub و Vercel به‌روزرسانی شدند: ${stamp}`);
  } catch (error) {
    console.error('[sync] ناموفق:', error.stderr || error.message);
  } finally {
    syncing = false;
  }
}

watch(root, { recursive: true }, (_event, filename) => {
  if (filename?.split(path.sep).some((part) => ignoredParts.has(part))) return;
  clearTimeout(timer);
  timer = setTimeout(sync, 1600);
});

console.log('همگام‌سازی خودکار فعال است. برای توقف: Ctrl+C');
sync();
