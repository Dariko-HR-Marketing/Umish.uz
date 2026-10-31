// Loyihani tekshirish (bog'liqliklarsiz): node scripts/check.mjs
// 1) JS sintaksisi  2) index.html dagi mahalliy fayl havolalari  3) JSON-LD  4) sitemap/manifest
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
let errors = 0;
const fail = m => { console.error('XATO:', m); errors++; };
const ok = m => console.log('ok   ', m);

// 1) JS sintaksisi (cad-3d.js — ES modul)
const jsDir = join(root, 'js');
for (const f of readdirSync(jsDir).filter(f => f.endsWith('.js'))) {
  const full = join(jsDir, f);
  const isModule = /^\s*import\s/m.test(readFileSync(full, 'utf8'));
  try {
    execFileSync(process.execPath, isModule ? ['--input-type=module', '--check'] : ['--check', full],
      { input: isModule ? readFileSync(full) : undefined, stdio: ['pipe', 'pipe', 'pipe'] });
    ok(`js/${f}`);
  } catch (e) { fail(`js/${f}: ${String(e.stderr || e.message).split('\n').slice(0, 3).join(' ')}`); }
}

// 2) index.html mahalliy havolalari
const html = readFileSync(join(root, 'index.html'), 'utf8');
const refs = new Set();
for (const m of html.matchAll(/\b(?:src|href|data-full)="([^"#?]+)"/g)) refs.add(m[1]);
for (const m of html.matchAll(/\bsrcset="([^"]+)"/g)) m[1].split(',').forEach(s => refs.add(s.trim().split(/\s+/)[0]));
for (const m of html.matchAll(/openLightbox\('([^']+)'/g)) refs.add(m[1]);
let n = 0;
for (const r of refs) {
  if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(r) || r === '/' || r.startsWith('#')) continue;
  n++;
  if (!existsSync(join(root, r))) fail(`index.html: fayl topilmadi: ${r}`);
}
ok(`${n} ta mahalliy havola tekshirildi`);

// 3) JSON-LD
for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try { JSON.parse(m[1]); ok('JSON-LD to\'g\'ri'); } catch (e) { fail('JSON-LD buzilgan: ' + e.message); }
}

// 4) sitemap va manifest (agar bor bo'lsa)
const sm = join(root, 'sitemap.xml');
if (existsSync(sm)) {
  const x = readFileSync(sm, 'utf8');
  (x.includes('<urlset') && x.includes('</urlset>') && /<loc>https?:\/\//.test(x)) ? ok('sitemap.xml') : fail('sitemap.xml tuzilmasi noto\'g\'ri');
}
const mf = join(root, 'site.webmanifest');
if (existsSync(mf)) { try { JSON.parse(readFileSync(mf, 'utf8')); ok('site.webmanifest'); } catch (e) { fail('site.webmanifest: ' + e.message); } }

// Takroriy id
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
dup.length ? fail('takroriy id: ' + [...new Set(dup)].join(', ')) : ok(`${ids.length} ta id, takror yo'q`);

console.log(errors ? `\n${errors} ta xato` : '\nHammasi joyida');
process.exit(errors ? 1 : 0);
