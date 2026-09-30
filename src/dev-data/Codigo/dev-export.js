export async function exportComplete({organization,catalog,status,signal}){
 if(!window.showDirectoryPicker)throw Error('Para baixar em pastas, abra este catálogo no Chrome ou Edge.');
 const chosen=await window.showDirectoryPicker({mode:'readwrite'});
 const root=await chosen.getDirectoryHandle('Biblioteca-BIM-DEV',{create:true});
 async function handle(p){const parts=p.split('/');if(parts.some(x=>!x||x==='.'||x==='..'||/[\\:]/.test(x)))throw Error('Caminho inválido no índice');let d=root;for(const n of parts.slice(0,-1))d=await d.getDirectoryHandle(n,{create:true});return d.getFileHandle(parts.at(-1),{create:true});}
 async function write(p,data){const f=await handle(p),w=await f.createWritable();try{await w.write(data);await w.close();}catch(e){await w.abort();throw e;}}
 const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');
 const r=await fetch('dev-export-manifest.json',{cache:'no-store',signal});if(!r.ok)throw Error('Índice indisponível');const index=await r.json();
 if(index.schema!=='aw-bim-complete-export'||!Array.isArray(index.files))throw Error('Índice inválido');
 await write('Manifestos/indice-arquivos.json',JSON.stringify(index,null,2));
 await write('Organizacao/backup-navegador.json',JSON.stringify(organization,null,2));
 await write('Catalogo/inventario-atual.json',JSON.stringify(catalog,null,2));
 let cursor=0,done=0,reused=0;const errors=[];
 async function worker(){while(cursor<index.files.length&&!signal.aborted){const item=index.files[cursor++];try{
  const url=new URL(item.url,location.origin);if(url.origin!==location.origin)throw Error('Origem externa não permitida no índice');
  const target=await handle(item.path),old=await target.getFile();
  if(old.size===item.bytes&&await hash(await old.arrayBuffer())===item.sha256){reused++;}
  else{let buffer;for(let n=0;n<3;n++){try{const response=await fetch(url,{signal});if(!response.ok)throw Error('HTTP '+response.status);buffer=await response.arrayBuffer();if(buffer.byteLength!==item.bytes||await hash(buffer)!==item.sha256)throw Error('Integridade divergente');break;}catch(e){if(signal.aborted||n===2)throw e;}}
   const stream=await target.createWritable();try{await stream.write(buffer);await stream.close();}catch(e){await stream.abort();throw e;}
  }
 }catch(e){errors.push({path:item.path,error:e.message});}finally{done++;status(`${done} de ${index.files.length} arquivos conferidos · ${errors.length} falhas · ${reused} reutilizados`);}}}
 await Promise.all([worker(),worker()]);
 const report={finishedAt:new Date().toISOString(),completed:!signal.aborted&&errors.length===0&&done===index.files.length,processed:done,total:index.files.length,reused,errors,cancelled:signal.aborted,unavailableRecords:index.unavailableRecords.length};
 await write('Manifestos/resultado-download.json',JSON.stringify(report,null,2));
 status(report.completed?'Entrega concluída e hashes verificados. Consulte o índice para os registros sem arquivo independente.':'Entrega parcial. Abra novamente e escolha a mesma pasta para retomar. Consulte resultado-download.json.');return report;
}
