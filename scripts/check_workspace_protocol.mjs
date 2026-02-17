import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getWorkspacePatterns(rootPkg) {
  if (Array.isArray(rootPkg.workspaces)) return rootPkg.workspaces;
  if (Array.isArray(rootPkg.workspaces?.packages)) return rootPkg.workspaces.packages;
  return [];
}

function resolveWorkspacePackageJsons(patterns) {
  const files = [];
  for (const pattern of patterns) {
    if (!pattern.endsWith('/*')) {
      throw new Error(`Unsupported workspace pattern: ${pattern}`);
    }
    const base = pattern.slice(0, -2);
    const absBase = path.join(ROOT, base);
    if (!fs.existsSync(absBase)) continue;

    for (const ent of fs.readdirSync(absBase, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const pkgJson = path.join(absBase, ent.name, 'package.json');
      if (fs.existsSync(pkgJson)) files.push(pkgJson);
    }
  }
  return files;
}

const rootPkg = readJson(path.join(ROOT, 'package.json'));
const workspacePkgJsons = resolveWorkspacePackageJsons(getWorkspacePatterns(rootPkg));
const manifests = workspacePkgJsons.map((pkgJsonPath) => ({ file: pkgJsonPath, json: readJson(pkgJsonPath) }));
const internalNames = new Set(manifests.map((m) => m.json.name).filter(Boolean));

const violations = [];
for (const manifest of manifests) {
  for (const field of DEP_FIELDS) {
    const deps = manifest.json[field] || {};
    for (const [name, spec] of Object.entries(deps)) {
      if (!internalNames.has(name)) continue;
      if (spec !== 'workspace:*') {
        violations.push({
          file: path.relative(ROOT, manifest.file),
          field,
          name,
          spec: String(spec)
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('[check:workspace-protocol] FAIL internal deps must be exactly workspace:*');
  for (const v of violations) {
    console.error(`- ${v.file} :: ${v.field}.${v.name} = ${v.spec}`);
  }
  process.exit(1);
}

console.log('[check:workspace-protocol] OK all internal deps use workspace:*');
