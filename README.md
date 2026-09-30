# Biblioteca BIM — manutenção

## Arquivos a editar

- `src/catalogo.html`: estrutura da página e filtros. A página inicial e a rota catalogo.html são geradas da mesma fonte.
- `src/catalogo.css`: aparência e adaptação a telas.
- `src/catalogo-app.js`: interação, cartões, detalhes e organização local do usuário.
- `src/catalogo-domain.js`: regras puras de fornecedores, linhas e etiquetas.
- `data/catalog.json`: fonte única dos registros, relações comerciais e grupos de revisão.
- `public/miniaturas` e `public/marca`: imagens existentes.
- `scripts/build.cjs`: valida identificadores e gera páginas, manifesto, CSV e dados do navegador.

Execute `node scripts/build.cjs` após alterações. Não edite diretamente os arquivos gerados em dist. Execute `node --test tests/catalog-domain.test.cjs` para conferir as regras de filtros.

## Convenções BIM

`manufacturer` identifica o fornecedor; `line` identifica sua linha comercial; `product_code` preserva o código oficial. `product_relationship` registra a relação documentada e a fonte. Uma linha comercial não equivale automaticamente a uma família Revit ou a tipos dentro do mesmo RFA.

`validation` continua independente da classificação comercial. Ausência de verificação não comprova falha, aprovação ou homologação. Hash igual comprova arquivos idênticos; nomes parecidos não comprovam equivalência. Não invente acabamentos por código: registre diferenças específicas apenas quando documentadas pelo fornecedor.

As etiquetas de origem ficam em `catalog_tags`; etiquetas pessoais continuam no armazenamento local do navegador. Os registros com RFA usam downloads por identificador de produto, com os arquivos em armazenamento R2 e deduplicação por SHA-256. Download não implica aprovação BIM. O serviço de hospedagem usa o projeto já registrado em `.openai/hosting.json`.

`data/downloads.json` relaciona produto, arquivo, tamanho e hash. `src/download-worker.mjs` atende os downloads com o binding `BIM_FILES`. A credencial temporária de envio fica apenas na configuração secreta da hospedagem. O build gera `dist/client` e `dist/server`; a publicação usa esses diretórios e `dist/.openai`. Os arquivos antigos na raiz de `dist` não são usados no pacote Worker.

O recebimento de JSON por API ainda não está implementado. A estrutura de dados aqui separada é a base para o DTO/importador solicitado anteriormente; uma API exige validação de entrada e uma rotina de atualização própria.

## Transfer�ncia para GitHub

Build: `node scripts/build.cjs`. Testes: `node --test tests/*.test.cjs`.

Bancos locais, credenciais e sa�das dist/build n�o s�o versionados. Os snapshots SQLite da exporta��o DEV precisam ser provisionados separadamente se necess�rios. Os modelos Revit permanecem no armazenamento R2 (binding BIM_FILES); este reposit�rio cont�m a aplica��o, imagens e �ndices, n�o os bin�rios RFA. A conex�o com pre�os internos e IA ainda depende de configura��o de servidor.
