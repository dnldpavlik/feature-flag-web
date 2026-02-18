/**
 * Postinstall patch for @watt/ui
 *
 * Removes test helpers (componentHelpers, domHelpers) and the
 * @testing-library/angular import that were accidentally included
 * in the @watt/ui production bundle.
 *
 * Without this patch, the production build pulls in @testing-library/dom
 * and its CommonJS transitive dependencies (pretty-format, aria-query,
 * lz-string), causing build warnings and bundle bloat.
 *
 * TODO: Remove this script once @watt/ui publishes a fix.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@watt',
  'ui',
  'fesm2022',
  'watt-ui.mjs',
);

if (!fs.existsSync(bundlePath)) {
  console.log('[@watt/ui patch] Bundle not found, skipping.');
  process.exit(0);
}

let content = fs.readFileSync(bundlePath, 'utf8');
const original = content;

// 1. Remove the @testing-library/angular import
content = content.replace(
  /import \{ render \} from '@testing-library\/angular';\n?/,
  '',
);

// 2. Remove componentHelpers object
content = content.replace(
  /\/\*\*\s*\n\s*\* Shared test helpers for rendering @watt\/ui components\.[\s\S]*?const componentHelpers = \{[\s\S]*?\};\n?/,
  '',
);

// 3. Remove domHelpers object
content = content.replace(
  /\/\*\*\s*\n\s*\* DOM query and accessibility helpers for testing @watt\/ui components\.[\s\S]*?const domHelpers = \{[\s\S]*?\};\n?/,
  '',
);

// 4. Remove componentHelpers and domHelpers from export statement
content = content.replace(
  /componentHelpers, /g,
  '',
);
content = content.replace(
  /domHelpers, /g,
  '',
);

if (content === original) {
  console.log('[@watt/ui patch] Already patched or pattern not found.');
} else {
  fs.writeFileSync(bundlePath, content, 'utf8');
  console.log(
    '[@watt/ui patch] Removed test helpers and @testing-library/angular import from production bundle.',
  );
}
