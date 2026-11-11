import { existsSync } from 'node:fs';

const script = new URL('../../.githooks/install.mjs', import.meta.url);

if (existsSync(script)) {
  await import(script.href);
}
