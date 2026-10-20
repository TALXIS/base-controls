import { IMapDirections } from '../core/directions';
import { IMapGeocoder } from '../core/geocoding';
import { IMapProviderOption } from './provider';

/**
 * Picks a service off the configured providers, preferring the one drawing the map.
 *
 * Geo-coding, reverse geo-coding and directions are separate capabilities from rendering, and not every
 * provider offers all of them, so one without a service borrows from another configured provider rather than
 * turning the feature off - a missing service is more surprising than a slightly different address.
 */
const getMapService = <TService>(
    options: IMapProviderOption[],
    selectedId: string | undefined,
    getService: (option: IMapProviderOption) => TService | undefined
): TService | undefined => {
    const selected = options.find((option) => option.id === selectedId);
    if (selected) {
        const service = getService(selected);
        if (service) {
            return service;
        }
    }
    return options.map(getService).find((service): service is TService => !!service);
};

/** Picks the geocoding service the control should use. */
export const getMapGeocoder = (options: IMapProviderOption[], selectedId?: string): IMapGeocoder | undefined =>
    getMapService(options, selectedId, (option) => option.geocoder);

/** Picks the directions service the control should use. */
export const getMapDirections = (options: IMapProviderOption[], selectedId?: string): IMapDirections | undefined =>
    getMapService(options, selectedId, (option) => option.directions);
