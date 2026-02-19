#!/usr/bin/env node

/**
 * Release script for feature-flags-web
 *
 * Bumps the version in package.json, generates a changelog from
 * conventional commits, creates a git commit, and tags it.
 *
 * Usage:
 *   node scripts/release.js patch        # 0.0.0 -> 0.0.1
 *   node scripts/release.js minor        # 0.0.0 -> 0.1.0
 *   node scripts/release.js major        # 0.0.0 -> 1.0.0
 *   node scripts/release.js 1.2.0        # explicit version
 *   node scripts/release.js patch --push # also pushes commit + tag
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_PATH = resolve(__dirname, '..', 'package.json');

const args = process.argv.slice(2);
const bumpType = args.find(a => !a.startsWith('--'));
const shouldPush = args.includes('--push');

if (!bumpType) {
  console.error('Usage: node scripts/release.js <patch|minor|major|x.y.z> [--push]');
  process.exit(1);
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);

  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      if (/^\d+\.\d+\.\d+$/.test(type)) return type;
      console.error(`Invalid bump type: "${type}". Use patch, minor, major, or x.y.z`);
      process.exit(1);
  }
}

function run(cmd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

// Read current version
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
const currentVersion = pkg.version;
const newVersion = bumpVersion(currentVersion, bumpType);
const tag = `v${newVersion}`;

console.log(`\nfeature-flags-web ${currentVersion} -> ${newVersion}\n`);

// Check for uncommitted changes
try {
  execSync('git diff --quiet && git diff --cached --quiet', { stdio: 'pipe' });
} catch {
  console.error('Error: Working directory has uncommitted changes. Commit or stash them first.');
  process.exit(1);
}

// Update version
pkg.version = newVersion;
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Updated ${PKG_PATH}`);

// Generate changelog
console.log('\nGenerating changelog...');
run('npx conventional-changelog -p angular -i CHANGELOG.md -s');
console.log('Updated CHANGELOG.md');

// Commit and tag
run('git add package.json CHANGELOG.md');
run(`git commit -m "chore(release): v${newVersion}"`);
run(`git tag ${tag}`);

console.log(`\nTagged ${tag}`);

if (shouldPush) {
  run('git push');
  run(`git push origin ${tag}`);
  console.log(`\nPushed ${tag} — pipeline will build and tag the Docker image.`);
} else {
  console.log(`\nRun the following to publish:`);
  console.log(`  git push && git push origin ${tag}`);
}
