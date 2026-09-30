const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist/client');
const catalog=JSON.parse(fs.readFileSync(root+'/data/catalog.json'));
const downloads=JSON.parse(fs.readFileSync(root+'/data/downloads.json'));
fs.cpSync(root+'/src/dev-data',out+'/dev-data',{recursive:true});
fs.copyFileSync(root+'/src/dev-export.js',out+'/dev-export.js');
const files=[], seen=new Map();
const clean=s=>String(s||'Sem classificação').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/,'').slice(0,110);
for(const [id,d] of Object.entries(downloads)){
 if(/\.(zip|rar|7z)$/i.test(d.filename))continue;
 const item=catalog.items.find(x=>x.key===id)||{};
 item.manufacturer ||= id.startsWith('HM_')?'Herman Miller':id.startsWith('SC_')?'Steelcase':'Acervo interno';
 if(seen.has(d.sha256)){seen.get(d.sha256).catalogIds.push(id);continue;}
 const file={path:[d.mime?.startsWith('image/')?'Imagens':'Modelos',clean(item.manufacturer||'Acervo interno'),d.sha256.slice(0,16),clean(d.filename)].join('/'),url:'/download/'+encodeURIComponent(id),sha256:d.sha256,bytes:d.bytes,catalogIds:[id]};
 files.push(file);seen.set(d.sha256,file);
}
function staticFile(rel,destination){const filename=path.join(out,rel);if(!fs.existsSync(filename))throw Error('Missing export asset: '+rel);const bytes=fs.readFileSync(filename);files.push({path:destination||rel,url:'/'+rel.split('/').map(encodeURIComponent).join('/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
for(const rel of new Set(catalog.items.map(x=>x.thumbnail).filter(Boolean))){
 const remote=Object.values(downloads).find(x=>x.public_path==='/'+rel);
 if(remote)continue;
 staticFile(rel,'Imagens/'+rel.replace(/^miniaturas\//,''));
}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else staticFile(path.relative(out,p).replaceAll('\\','/'));}}
walk(out+'/dev-data');
for(const f of ['manifesto.json','manifesto.csv'])staticFile(f,'Manifestos/'+f);
// Revit type catalogs must be adjacent to their matching family.
for(const txt of [...files].filter(f=>/\.txt$/i.test(f.path)&&f.path.startsWith('Modelos/'))){
 const stem=path.basename(txt.path,'.txt').toLowerCase();const matches=files.filter(f=>/\.rfa$/i.test(f.path)&&path.basename(f.path).slice(0,-4).toLowerCase()===stem);
 if(matches.length){files.splice(files.indexOf(txt),1);for(const model of matches)files.push({...txt,path:model.path.slice(0,-4)+'.txt'});}
}
const pending=catalog.items.filter(x=>!x.download_url).map(x=>({key:x.key,name:x.display_name,reason:'Registro sem download Revit independente no catálogo'}));
const manifest={schema:'aw-bim-complete-export',version:1,generatedAt:new Date().toISOString(),files,totalBytes:files.reduce((a,f)=>a+f.bytes,0),unavailableRecords:pending};
fs.writeFileSync(out+'/dev-export-manifest.json',JSON.stringify(manifest));
console.log(JSON.stringify({files:files.length,bytes:manifest.totalBytes,unavailableRecords:pending.length}));
