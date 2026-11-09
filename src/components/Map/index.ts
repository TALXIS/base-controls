//the control and its contract
export * from './interfaces';
export * from './labels';
export * from './components';

//the provider seam: what a provider receives, and how one is defined
export * from './providers';

//the module seam: what a module receives at each stage, and the slots a map has for them
export * from './modules';

//the types the contract is written in, and the helpers a provider or a module needs to honour it
export type { IMapBounds, IMapCoordinates } from './core/coordinates';
export type { IMapDirections, IMapDirectionsOptions, IMapRoutePath } from './core/directions';
export type { IMapFallbackLocationResolver, IMapResolvedLocation } from './core/fallbackLocation';
export type { IMapGeocoder, IMapGeocodingOptions, IMapPlace } from './core/geocoding';
export { DEFAULT_GEOCODING_LIMIT, getAddressLabel } from './core/geocoding';
export type { IMapPinAppearance, IMapPinResolver, IMapPinRule, IMapWebResourceResolver } from './core/pinAppearance';
export type { IMapRuleCondition } from './core/rules';
export type { IMapViewport, IMapViewportOptions, IMapViewportRequest } from './core/viewport';
export { DEFAULT_MAP_VIEWPORT_OPTIONS, getSafeFitPadding, isFiniteMapViewport } from './core/viewport';

//the control itself, and the pieces a host or a module composes with
export * from './Map';
export * from './core/attributes';
export * from './core/language';
export * from './core/pins';
export * from './core/records';
export * from './core/webResource';
export * from './map-overlay';
export * from './map-pin-swatch';
export * from './map-status';
