// Builds the site and assembles everything a Node.js host needs into release/pahadi-dhaba-cafe(.zip).
// Usage: npm run release
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = path.join(root, 'release', 'pahadi-dhaba-cafe');
const zip = path.join(root, 'release', 'pahadi-dhaba-cafe.zip');
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });

console.log('Building the React site…');
run('npm run build', path.join(root, 'client'));

fs.rmSync(path.join(root, 'release'), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const copy = (from, to = from) => fs.cpSync(path.join(root, from), path.join(out, to), { recursive: true });
copy('server/src');
copy('client/dist');
copy('server/.env.example', '.env.example');

const serverPkg = JSON.parse(fs.readFileSync(path.join(root, 'server/package.json'), 'utf8'));
fs.writeFileSync(
  path.join(out, 'package.json'),
  JSON.stringify(
    {
      name: 'pahadi-dhaba-cafe',
      version: serverPkg.version,
      private: true,
      type: 'module',
      main: 'app.cjs',
      engines: { node: '>=18.18' },
      scripts: { start: 'node app.cjs' },
      dependencies: serverPkg.dependencies,
    },
    null,
    2,
  ) + '\n',
);

// CommonJS entry point: cPanel's Node.js hosting (Phusion Passenger) starts apps with require().
fs.writeFileSync(
  path.join(out, 'app.cjs'),
  `// Startup file for hosting panels (cPanel "Setup Node.js App"): point "Application startup file" here.
// Settings come from the panel's environment variables, or from a .env file next to this one.
const fs = require('node:fs');
const path = require('node:path');

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\\r?\\n/)) {
    const match = line.match(/^\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.*?)\\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^(['"])(.*)\\1$/, '$2');
  }
}
process.env.NODE_ENV ||= 'production';

import('./server/src/index.js').catch((err) => {
  console.error(err);
  process.exit(1);
});
`,
);

fs.writeFileSync(
  path.join(out, 'UPLOAD-INSTRUCTIONS.txt'),
  `PAHADI DHABA & CAFE - files for a Node.js host

Upload EVERYTHING in this folder (keep the folder structure):
  app.cjs                 startup file
  package.json            lists what to install (Express)
  server/src/             the server: API, bookings, admin, uploads
  client/dist/            the finished website (HTML, CSS, JS, images)
  .env.example            template for settings

Do NOT upload node_modules (the host installs it with "Run NPM Install").

Settings (environment variables in the hosting panel, or a file named .env here):
  ADMIN_TOKEN=a-long-password-at-least-12-characters
  TRUST_PROXY=1

Bookings, admin edits and uploaded photos are saved in server/storage/ (created automatically).
Back it up, and never delete or overwrite it when uploading a new version.

Full steps: see DEPLOY.md in the project.
`,
);

console.log('Creating zip…');
run(`tar -a -c -f "${zip}" -C "${path.dirname(out)}" pahadi-dhaba-cafe`, root);
console.log(`\nReady:\n  ${out}\n  ${zip}`);
