// Server-only adapter. Inject environment secrets; never bundle into browser code.
export function createCompanyProvider({endpoint,token,fetchImpl=fetch}={}) {
 return {source:'company',async search(query){
  if(!endpoint)return {status:'not_connected',offers:[],lowestVerifiedOfferId:null};
  const target=new URL(endpoint);if(target.protocol!=='https:')throw Error('Company price endpoint must use HTTPS');
  if(!token)throw Error('Company credentials are not configured');
  const response=await fetchImpl(target,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({version:1,...query}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Company price service unavailable');
  const body=await response.json();if(body.version!==1||!Array.isArray(body.offers))throw Error('Invalid company price response');
  const offers=body.offers.map(o=>{if(typeof o.id!=='string'||typeof o.amount!=='number'||!Number.isFinite(o.amount)||o.amount<0||o.currency!=='BRL'||!o.configuration||typeof o.configuration!=='object'||!Number.isFinite(Date.parse(o.checkedAt)))throw Error('Invalid company offer');return {...o,source:'company',visibility:'internal'};});
  return {status:'reference_only',offers,lowestVerifiedOfferId:null};
 }};
}
