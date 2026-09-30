const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist/client');
fs.mkdirSync(path.join(out, 'revisao_duplicatas'), {recursive:true});
fs.cpSync(path.join(root, 'public'), out, {recursive:true});
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
const keys = new Set();
for (const item of data.items) {
  if (!item.key || keys.has(item.key)) throw Error('Missing or duplicate catalog key: ' + item.key);
  keys.add(item.key);
}
for (const group of data.groups) {
  if (!group.members.every(key => keys.has(key))) throw Error('Unknown group member: ' + group.id);
}
for (const filename of ['catalogo.html', 'catalogo-app.js', 'catalogo-domain.js', 'catalogo.css', 'catalogo-search.js', 'search-service.js']) {
  fs.copyFileSync(path.join(root, 'src', filename), path.join(out, filename));
}
fs.copyFileSync(path.join(out, 'catalogo.html'), path.join(out, 'index.html'));
fs.writeFileSync(path.join(out, 'manifesto.json'), JSON.stringify(data, null, 2));
fs.writeFileSync(path.join(out, 'catalogo_dados.js'), 'window.BIM_CATALOG=' + JSON.stringify(data).replaceAll('</', '<\\/') + ';');
fs.writeFileSync(path.join(out, 'revisao_duplicatas/grupos_para_decisao.json'), JSON.stringify(data.groups, null, 2));
const columns = ['key','kind','technical_name','display_name','category','manufacturer','line','product_code','state','groups'];
const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
fs.writeFileSync(path.join(out,'manifesto.csv'), '\ufeff' + [columns, ...data.items.map(item => columns.map(key => Array.isArray(item[key]) ? item[key].join(';') : item[key]))].map(row => row.map(quote).join(',')).join('\r\n'));
console.log(`Catalog built: ${data.items.length} records, ${data.groups.length} review groups.`);

const server=path.join(root,"dist/server");fs.mkdirSync(server,{recursive:true});fs.copyFileSync(path.join(root,"src/download-worker.mjs"),path.join(server,"index.js"));fs.writeFileSync(path.join(server,"downloads.mjs"),"export default "+fs.readFileSync(path.join(root,"data/downloads.json"),"utf8")+";");fs.mkdirSync(path.join(root,"dist/.openai"),{recursive:true});fs.copyFileSync(path.join(root,".openai/hosting.json"),path.join(root,"dist/.openai/hosting.json"));

fs.mkdirSync(path.join(out,'assets'),{recursive:true});fs.copyFileSync(path.join(root,'src/assets/robo-transparente.png'),path.join(out,'assets/robo-transparente.png'));

fs.copyFileSync(path.join(root,"src/assets/header-digital.svg"),path.join(out,"assets/header-digital.svg"));

require('./build-dev.cjs');
