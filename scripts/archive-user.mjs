/**
 * Move one Firestore document from `users` to `users_archive`.
 * Local only — not imported by Next.js or Cloud Functions, so it is not part of either build.
 *
 * Usage:
 *   npm run archive-user -- <userId>
 *   npm run archive-user -- <userId> --project prod
 *
 * Default project is integration (`joystie-poc`).
 * Auth: `gcloud auth login`, or set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PROJECTS = {
  intgr: 'joystie-poc',
  prod: 'joystie-poc-prod',
  'joystie-poc': 'joystie-poc',
  'joystie-poc-prod': 'joystie-poc-prod',
};

const USAGE = `Usage: npm run archive-user -- <userId> [--project intgr|prod]

Moves users/<userId> to users_archive/<userId> and deletes the original.
Default project is intgr (joystie-poc).`;

function parseArgs(argv) {
  const positional = [];
  let project = 'intgr';
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--project') {
      project = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--project=')) {
      project = arg.slice('--project='.length);
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    positional.push(arg);
  }
  return { help: false, project, userId: positional[0], extra: positional.slice(1) };
}

async function accessToken() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    const authEntry = join(root, 'functions', 'node_modules', 'google-auth-library');
    if (!existsSync(authEntry)) {
      throw new Error('google-auth-library is missing. Run npm install inside functions/ first.');
    }
    const { GoogleAuth } = require(authEntry);
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/datastore'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    if (!token.token) throw new Error('Service account returned an empty access token.');
    return token.token;
  }

  try {
    const token = printGcloudAccessToken();
    if (!token) throw new Error('gcloud returned an empty access token.');
    return token;
  } catch (error) {
    if (error instanceof Error && error.message === 'gcloud returned an empty access token.') throw error;
    const detail = error?.stderr ? String(error.stderr).trim() : '';
    throw new Error(
      detail
        ? `Could not get a Google access token: ${detail}`
        : 'Could not get a Google access token. Run `gcloud auth login`, or set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON with Firestore access.',
    );
  }
}

function printGcloudAccessToken() {
  const options = { encoding: 'utf8', windowsHide: true };
  // Node refuses to spawn .cmd directly (EINVAL). gcloud on Windows is gcloud.cmd.
  if (process.platform === 'win32') {
    return execFileSync(
      process.env.ComSpec || 'cmd.exe',
      ['/d', '/s', '/c', 'gcloud auth print-access-token'],
      options,
    ).trim();
  }
  return execFileSync('gcloud', ['auth', 'print-access-token'], options).trim();
}

function docName(projectId, collection, userId) {
  return `projects/${projectId}/databases/(default)/documents/${collection}/${userId}`;
}

async function firestore(projectId, token, method, resourcePath, body) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/${resourcePath}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-goog-user-project': projectId,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = json?.error?.message || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return json;
}

async function readDoc(projectId, token, collection, userId) {
  try {
    return await firestore(
      projectId,
      token,
      'GET',
      `documents/${collection}/${encodeURIComponent(userId)}`,
    );
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.userId) {
    console.log(USAGE);
    process.exit(args.help ? 0 : 1);
  }
  if (!args.project || args.extra.length > 0) {
    console.error('Pass a single user id.');
    console.error(USAGE);
    process.exit(1);
  }

  const projectId = PROJECTS[args.project];
  if (!projectId) {
    console.error(`Unknown project "${args.project}". Use intgr or prod.`);
    process.exit(1);
  }

  const token = await accessToken();
  const [userDoc, archiveDoc, listed] = await Promise.all([
    readDoc(projectId, token, 'users', args.userId),
    readDoc(projectId, token, 'users_archive', args.userId),
    firestore(
      projectId,
      token,
      'POST',
      `documents/users/${encodeURIComponent(args.userId)}:listCollectionIds`,
      {},
    ),
  ]);

  if (!userDoc) {
    console.error(`No users/${args.userId} in ${projectId}.`);
    process.exit(1);
  }
  if (archiveDoc) {
    console.error(
      `users_archive/${args.userId} already exists in ${projectId}. Left users/${args.userId} in place.`,
    );
    process.exit(1);
  }

  const subcollections = listed?.collectionIds || [];
  if (subcollections.length > 0) {
    console.error(
      `users/${args.userId} has subcollections (${subcollections.join(', ')}). This command only moves the user document.`,
    );
    process.exit(1);
  }

  const archivedAt = new Date().toISOString();
  await firestore(projectId, token, 'POST', 'documents:commit', {
    writes: [
      {
        update: {
          name: docName(projectId, 'users_archive', args.userId),
          fields: {
            ...userDoc.fields,
            archivedAt: { stringValue: archivedAt },
          },
        },
        currentDocument: { exists: false },
      },
      {
        delete: docName(projectId, 'users', args.userId),
        currentDocument: { exists: true },
      },
    ],
  });

  const email = userDoc.fields?.email?.stringValue || '(no email)';
  console.log(
    `Moved users/${args.userId} (${email}) to users_archive/${args.userId} in ${projectId}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
