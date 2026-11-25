import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'});
const forbidden=/(^|\/)(node_modules|\.next|out|dist|\.local|test-results|playwright-report)(\/|$)|(^|\/)\.env(?!\.example$)(\.|$)/;
const tracked=git('ls-files','-z').split('\0').filter(Boolean);
assert.deepEqual(tracked.filter(path=>forbidden.test(path)),[]);
for(const path of ['.env','.local/postgres/PG_VERSION','frontend/node_modules','backend/node_modules','frontend/.next','frontend/out','frontend/test-results']) {
  git('check-ignore','--no-index',path);console.log(`IGNORÉ : ${path}`);
}
const candidates=[...new Set(git('ls-files','--cached','--others','--exclude-standard','-z').split('\0').filter(Boolean))];
const leaks=[];
const secretPattern=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-proj-[A-Za-z0-9_-]{30,}|(?:AKIA|ASIA)[A-Z0-9]{16}/;
for(const path of candidates) {
  try {
    if(!(await stat(path)).isFile())continue;
    const data=await readFile(path,'utf8');
    if(secretPattern.test(data))leaks.push(path);
  } catch(error) {if(error.code!=='ENOENT')throw error;}
}
assert.deepEqual(leaks,[]);
// Contrôler aussi les versions supprimées : elles restent accessibles après un push.
const objects=git('rev-list','--objects','HEAD').trim().split('\n');
let blobs=0;
for(const entry of objects) {
  const [oid,...parts]=entry.split(' ');
  const path=parts.join(' ');
  if(git('cat-file','-t',oid).trim()!=='blob')continue;
  blobs++;
  assert.equal(forbidden.test(path),false,`Artefact interdit dans l’historique : ${path}`);
  assert.equal(secretPattern.test(git('cat-file','blob',oid)),false,`Signature sensible dans l’historique : ${oid} (${path})`);
}
console.log(`Historique HEAD contrôlé : ${blobs} blobs, aucune signature sensible détectée.`);
git('diff','--check');
git('diff','--cached','--check');
const remotes=git('remote','-v').trim();
console.log(`Remotes existants : ${remotes || 'aucun'}`);
console.log('VALIDÉ : aucun artefact interdit suivi ; exclusions actives ; aucune signature de clé privée ou de jeton détectée ; diff --check réussi.');
console.log('Contrôle de motifs et exclusions, pas une garantie universelle de détection de secrets. Aucune publication effectuée.');
