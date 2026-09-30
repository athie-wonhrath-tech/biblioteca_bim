import {searchCatalog} from './search-service.js';
const $=id=>document.getElementById(id);
$('assistantAsk').onclick=async()=>{try{const result=await searchCatalog({version:1,query:$('assistantQuery').value,inputMode:'text',locale:'pt-BR'});$('search').value=result.searchTerm;if(result.filters.supplier){$('manufacturer').value=result.filters.supplier;$('manufacturer').dispatchEvent(new Event('change'));}$('search').dispatchEvent(new Event('input'));$('assistantMessage').textContent=result.unverifiedConstraints.join(' ');}catch(e){$('assistantMessage').textContent=e.message;}};
$('assistantMic').onclick=()=>{$('assistantMessage').textContent='A busca por voz ainda não está conectada. Use o campo de texto.';};

for(const id of ['reset','clearTop'])$(id).addEventListener('click',()=>{$('assistantQuery').value='';$('assistantMessage').textContent='';});
