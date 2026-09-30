const fs=require('fs'),assert=require('node:assert/strict'),{test}=require('node:test'),crypto=require('crypto');
test('complete export verifies hashes and resumes without another download',async()=>{
 const bytes=Buffer.from('test-rfa'),sha=crypto.createHash('sha256').update(bytes).digest('hex'),files=new Map();let calls=0;
 function dir(prefix=''){return {
  async getDirectoryHandle(n){return dir(prefix+n+'/');},
  async getFileHandle(n){const key=prefix+n;return {
   async getFile(){const b=files.get(key)||Buffer.alloc(0);return {size:b.length,arrayBuffer:async()=>b};},
   async createWritable(){let b;return {async write(v){b=Buffer.from(v);},async close(){files.set(key,b);},async abort(){}};}
  };}
 };}
 global.window={showDirectoryPicker:async()=>dir()};global.location={origin:'https://example.test'};
 global.fetch=async url=>{if(String(url)==='dev-export-manifest.json')return {ok:true,json:async()=>({schema:'aw-bim-complete-export',files:[{path:'Modelos/a.rfa',url:'/download/a',bytes:bytes.length,sha256:sha}],unavailableRecords:[]})};calls++;return {ok:true,arrayBuffer:async()=>bytes};};
 const {exportComplete}=await import('data:text/javascript;base64,'+fs.readFileSync(require('path').join(__dirname,'../src/dev-export.js')).toString('base64'));
 const args={organization:{},catalog:{},status:()=>{},signal:new AbortController().signal};
 assert((await exportComplete(args)).completed);const result=await exportComplete(args);assert(result.completed);assert.equal(result.reused,1);assert.equal(calls,1);
 files.set('Biblioteca-BIM-DEV/Modelos/a.rfa',Buffer.from('bad-data'));assert((await exportComplete(args)).completed);assert.equal(calls,2);
});
