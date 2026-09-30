export type PriceSource = 'market' | 'company';
export interface PriceQuery { manufacturer:string; productCode:string; configuration:Record<string,string>; currency:'BRL'; quantity:number; destinationPostalCode?:string; }
export interface PriceOffer { id:string; source:PriceSource; supplier:string; amount:number; currency:'BRL'; unit:string; quantity:number; configuration:Record<string,string>; match:'exact'|'partial'; availability:'available'|'unavailable'|'unknown'; shipping:number|null; paymentTerms:string; checkedAt:string; expiresAt?:string; sourceUrl?:string; visibility:'public'|'internal'; }
export interface PriceProvider { source:PriceSource; search(query:PriceQuery):Promise<PriceOffer[]>; }
export interface PriceResult { status:'verified'|'reference_only'|'quote_required'|'not_connected'; offers:PriceOffer[]; lowestVerifiedOfferId:string|null; }
// Company providers run server-side. Never send database credentials to the browser.
