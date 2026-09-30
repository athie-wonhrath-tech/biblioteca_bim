// Swap this adapter for the server API without changing the search interface.
export async function searchCatalog(request,{endpoint=null,signal}={}){
 if(request.version!==1||typeof request.query!=='string'||!request.query.trim()||request.query.length>1000)throw Error('Digite uma busca com até 1.000 caracteres.');
 if(endpoint){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal});if(!r.ok)throw Error('A busca está indisponível. Tente novamente.');const data=await r.json();if(data.version!==1||!Array.isArray(data.productIds))throw Error('Resposta de busca inválida.');return data;}
 const q=request.query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const word=/puf/.test(q)?'puf':/sofa/.test(q)?'sofá':/cadeira/.test(q)?'cadeira':request.query.trim();
 return {version:1,mode:'preview',searchTerm:word,productIds:[],filters:{supplier:/acervo interno|acervo da empresa/.test(q)?'Acervo interno':/cavaletti/.test(q)?'Cavaletti':/herman/.test(q)?'Herman Miller':null},unverifiedConstraints:/\d/.test(q)?['Medidas ainda não verificadas nesta demonstração. Os resultados não confirmam o atendimento à medida solicitada.']:[]};
}
