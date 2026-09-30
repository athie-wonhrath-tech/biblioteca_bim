import files from './downloads.mjs';
const byHash=new Map(Object.values(files).map(x=>[x.sha256,x]));
const mediaByPath=new Map(Object.values(files).filter(x=>x.public_path).map(x=>[x.public_path,x]));
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  try {
   if(mediaByPath.has(path)){
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
    const file=mediaByPath.get(path),object=request.method==='HEAD'?await env.BIM_FILES.head('rfa/'+file.sha256):await env.BIM_FILES.get('rfa/'+file.sha256);
    if(!object)return new Response('Imagem em preparacao',{status:503,headers:{'retry-after':'60'}});
    return new Response(request.method==='HEAD'?null:object.body,{headers:{'content-type':file.mime,'content-length':String(object.size),'cache-control':'public, max-age=3600','x-content-sha256':file.sha256,'x-content-type-options':'nosniff'}});
   }
   if(path.startsWith('/internal/upload/')){
    if(!env.BIM_UPLOAD_TOKEN||request.headers.get('authorization')!=='Bearer '+env.BIM_UPLOAD_TOKEN)return new Response('Unauthorized',{status:401});
    const hash=path.slice('/internal/upload/'.length),file=byHash.get(hash);
    if(!file)return new Response('Unknown file',{status:404});
    if(request.method==='HEAD'){const object=await env.BIM_FILES.head('rfa/'+hash);return new Response(null,{status:object?200:404,headers:object?{'content-length':String(object.size),'x-content-sha256':hash}:{}});}
    if(request.method!=='PUT')return new Response('Method not allowed',{status:405});
    if(Number(request.headers.get('content-length'))!==file.bytes)return new Response('Invalid length',{status:400});
    await env.BIM_FILES.put('rfa/'+hash,request.body,{sha256:hash,httpMetadata:{contentType:'application/octet-stream'},customMetadata:{sha256:hash}});
    return new Response(null,{status:201});
   }
   if(path.startsWith('/download/')){
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
    const file=files[decodeURIComponent(path.slice('/download/'.length))];if(!file)return new Response('Arquivo RFA nao disponivel para este registro.',{status:404});
    const object=request.method==='HEAD'?await env.BIM_FILES.head('rfa/'+file.sha256):await env.BIM_FILES.get('rfa/'+file.sha256);
    if(!object)return new Response('Arquivo em preparacao. Tente novamente mais tarde.',{status:503,headers:{'retry-after':'60'}});
    const headers={'content-type':'application/octet-stream','content-length':String(object.size),'content-disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.filename),'x-content-sha256':file.sha256,'cache-control':'public, max-age=3600','x-content-type-options':'nosniff'};
    return new Response(request.method==='HEAD'?null:object.body,{headers});
   }
   return env.ASSETS.fetch(request);
  }catch(error){console.error('Download service failure',error);return new Response('Servico temporariamente indisponivel.',{status:503});}
 }
};
