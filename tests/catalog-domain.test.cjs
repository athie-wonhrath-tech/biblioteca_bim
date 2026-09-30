const {test}=require('node:test');
const assert=require('node:assert/strict');
const domain=require('../src/catalogo-domain.js');
test('lines belong to selected supplier and are unique',()=>{
 const items=[{manufacturer:'A',line:'Moov'},{manufacturer:'A',line:'Moov'},{manufacturer:'B',line:'Solo'},{manufacturer:'B'}];
 assert.deepEqual(domain.linesForSupplier(items,'A'),['Moov']);
 assert.deepEqual(domain.linesForSupplier(items,'B'),['Solo']);
 assert.deepEqual(domain.linesForSupplier(items,'Missing'),[]);
 assert.deepEqual(domain.linesForSupplier(items,''),['Moov','Solo']);
});
test('origin tags and personal tags survive without duplicates',()=>{
 assert.deepEqual(domain.tagsForItem({catalog_tags:['Cavaletti','Moov']},{tags:['Moov','Favorita']}),['Cavaletti','Moov','Favorita']);
});
