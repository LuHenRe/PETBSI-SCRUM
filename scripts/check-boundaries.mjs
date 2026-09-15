#!/usr/bin/env node
// Guardrail de fronteiras: impede que domain/application dependam de React,
// Next.js, lucide-react ou do store legado do demo.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN_IMPORTS = [
  /from\s*["']react["']/,
  /from\s*["']next/,
  /from\s*["']lucide-react["']/,
  /from\s*["']@\/lib\/store["']/,
];

const FORBIDDEN_DOMAIN_TOKENS = [/\bwindow\b/, /\blocalStorage\b/];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function listViolations(baseDir, checks) {
  const violations = [];
  if (!fs.existsSync(baseDir)) return violations;
  for (const file of walk(baseDir)) {
    const rel = path.relative(ROOT, file);
    const source = fs.readFileSync(file, "utf8");
    for (const [label, regex] of checks) {
      if (regex.test(source)) {
        violations.push(`${rel} -> ${label}`);
      }
    }
  }
  return violations;
}

const violations = [
  ...listViolations(
    path.join(ROOT, "src", "domain"),
    FORBIDDEN_IMPORTS.map((r) => ["import proibido: React/Next/lucide-react/@/lib/store", r]).concat(
      FORBIDDEN_DOMAIN_TOKENS.map((r) => ["token proibido: window/localStorage", r])
    )
  ),
  ...listViolations(
    path.join(ROOT, "src", "application"),
    FORBIDDEN_IMPORTS.map((r) => ["import proibido: React/Next/lucide-react/@/lib/store", r])
  ),
];

if (violations.length > 0) {
  console.error("check:boundaries — VIOLAÇÕES ENCONTRADAS:");
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log("check:boundaries — OK: domain e application sem dependências proibidas.");