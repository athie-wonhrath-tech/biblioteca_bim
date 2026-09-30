/** Provider-independent boundary. Credentials belong exclusively on the server. */
export interface SearchRequest {
 version: 1;
 query: string;
 inputMode: 'text' | 'voice'; // voice arrives as a transcript after explicit microphone consent
 locale: 'pt-BR';
 filters?: { supplierId?: string; categoryId?: string; collectionId?: string };
}
export interface SearchResponse {
 version: 1;
 mode: 'live';
 productIds: string[]; // must exist in catalog; never accept invented provider IDs
 appliedFilters: { field: string; operator: 'eq'|'gt'|'gte'|'lt'|'lte'; value: string|number; unit?: 'mm' }[];
 unknownDataProductIds: string[]; // never mix unknown dimensions with confirmed matches
 warnings: string[];
}
export interface SearchProvider { interpret(request: SearchRequest): Promise<SearchResponse['appliedFilters']>; }
// Planned route: POST /api/catalog/search. Validate request; rate-limit; call provider;
// validate allowed fields/operators; execute filters against verified catalog data;
// return actual IDs only. No arbitrary SQL, code, URLs, or tools from the model.
// Secrets stay in server environment. No provider connected or billing enabled here.
