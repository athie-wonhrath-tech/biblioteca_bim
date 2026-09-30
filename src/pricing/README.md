# Fontes de preço

Mercado e empresa são provedores separados com contrato comum. A pesquisa semanal atual é conduzida pelo acompanhamento desta tarefa, não por um agendador independente no servidor.

A integração corporativa requer fonte (API, banco, CSV ou JSON), autenticação no servidor e mapeamento de fabricante, código, configuração, unidade, quantidade, moeda e validade. Nunca usar preços internos no site público sem autorização de divulgação. Falta de conexão não deve ser apresentada como ausência de preços.

Exibir valor clicável com pop-up compacto: origem, fornecedor, configuração, data, condições e link quando público. R$ 459 da 1001 azul é referência parcial e não menor oferta confirmada. Selecionar menor oferta apenas entre correspondências exatas, disponíveis e em bases comerciais comparáveis; frete desconhecido deve ser indicado.

## Ponto de conexão pronto

company-provider.mjs recebe endpoint e token pelo servidor. company-connection.example.json documenta os nomes das variáveis; não contém segredo. O desenvolvedor deve conectar a rota autenticada interna a esse adaptador e mapear a resposta para contracts.ts. Não há rota pública habilitada nem consulta a banco real. Para SQL direto ou outro formato será necessário um conector que exponha esse contrato.
