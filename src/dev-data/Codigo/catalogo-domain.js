(function(root){
  'use strict';
  const domain={
    linesForSupplier(items,supplier){
      return [...new Set(items.filter(x=>!supplier||(x.manufacturer||'Acervo interno')===supplier).map(x=>x.line).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    },
    tagsForItem(item,editorial){
      return [...new Set([...(item.catalog_tags||[]),...(editorial?.tags||[])])];
    }
  };
  if(typeof module==='object'&&module.exports)module.exports=domain;
  else root.BIMCatalogDomain=domain;
})(typeof globalThis==='object'?globalThis:this);
