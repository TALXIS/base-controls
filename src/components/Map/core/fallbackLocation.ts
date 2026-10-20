import { IMapCoordinates } from "./coordinates";

/** A location the control resolved to center on, and how much it can be trusted to zoom in on. */
export interface IMapResolvedLocation extends IMapCoordinates {
    /**
     * Whether the position is precise enough to zoom in on. A device position is; a position guessed from
     * an IP address can be off by a city, so the map stays zoomed out for one.
     */
    isPrecise?: boolean;
}

/**
 * Resolves a location the map can center on while the dataset has no pins. Receives an `AbortSignal` the
 * control aborts once it stops caring, and should resolve `null` rather than throw.
 */
export type IMapFallbackLocationResolver = (signal: AbortSignal) => Promise<IMapResolvedLocation | null>;

export interface IMapFallbackLocationState {
    /** Whether the map already has something to fit. */
    hasLocations: boolean;
    /** Whether the host is still fetching records. */
    isDatasetLoading: boolean;
    /** Whether the control is still draining the remaining pages of the view. */
    isLoadingAllRecords: boolean;
    /** Whether a module is still placing records - geo-coding an address, say. */
    isResolving: boolean;
}

/**
 * Whether the control should resolve a fallback location at all. Pins produce "not yet", not "nothing", so
 * anything that could still produce one blocks the fallback - getting this wrong means a location
 * permission prompt shown over a dataset that was merely slow, which the user should never see.
 */
export const shouldResolveFallbackLocation = (state: IMapFallbackLocationState): boolean =>
    !state.hasLocations
    && !state.isDatasetLoading
    && !state.isLoadingAllRecords
    && !state.isResolving;
