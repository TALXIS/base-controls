import { useMemo } from 'react';
import { IRecord } from '@talxis/client-libraries';
import { IMapModule, IMapModuleState, IMapPins, IMapPinsContext, IMapStatusMessage, IMapViewContext, MAP_STATUS_PRIORITY } from '../interfaces';
import { useModuleLabels } from '../useModuleLabels';
import { geocodingLabels, IMapGeocodingTranslations } from './labels';
import { IGeocodedLocationsState, useGeocodedLocations } from './useGeocodedLocations';

/** Options for {@link createGeocodingModule}. */
export interface IMapGeocodingModuleOptions {
    /** Attribute holding a record's full address, as one line. Dot notation reaches across a lookup. */
    addressAttribute: string;
    /**
     * Addresses to resolve before stopping, per set of records. Overrides both the module's own default of
     * 250 and the lower number a public service asks for where its coordinates cannot be written back.
     */
    maxRequests?: number;
    /**
     * Whether a resolved coordinate is saved to its record, through the same latitude and longitude
     * attributes the map reads. On by default: it is what makes an address cost one lookup ever instead of
     * one per person who opens the map, which is what a public service's usage policy asks of a caller.
     *
     * Turn it off where the map may not write - the coordinate attributes are calculated, the reader has no
     * privilege on them, or the churn on `modifiedon` is not wanted - and coordinates are then remembered
     * for the lifetime of the control alone.
     */
    saveCoordinates?: boolean;
    /** Overrides for any subset of the module's strings. */
    labels?: IMapGeocodingTranslations;
}

/** How the module's messages rank against the core's: progress just under a page load, a refused service above a truncated one. */
const PRIORITY = {
    resolving: MAP_STATUS_PRIORITY.loading - 5,
    failed: MAP_STATUS_PRIORITY.truncated + 10,
    capped: MAP_STATUS_PRIORITY.truncated - 10,
    unplaceable: MAP_STATUS_PRIORITY.truncated - 20
};

const EMPTY_RECORDS: IRecord[] = [];

/**
 * Builds the geocoding module: a record that carries an address but no coordinates is placed by geo-coding
 * the address, through whichever configured provider has a geo-coding service, at the pace that service
 * allows. Each resolved coordinate is written back to the record, so the address is only ever sent to the
 * service once.
 *
 * Assign it to `modules.geocoding`:
 *
 * @example
 * ```ts
 * modules={{ geocoding: createGeocodingModule({ addressAttribute: 'cds_addressid.cds_fulladdress' }) }}
 * ```
 */
export const createGeocodingModule = (options: IMapGeocodingModuleOptions): IMapModule => {
    const { addressAttribute, maxRequests, saveCoordinates = true } = options;
    //what the pins stage resolved, for the status stage of the same render
    let geocoded: IGeocodedLocationsState | undefined;

    return {
        useModuleState: (): IMapModuleState => ({ attributePaths: [addressAttribute] }),

        usePins: (pins: IMapPins, context: IMapPinsContext): IMapPins => {
            const { records, placeRecords, isPreparingAttributes, coordinateAttributes, geocoder, language } = context;
            geocoded = useGeocodedLocations({
                //while linked columns are still registering, coordinates read as absent - geo-coding those
                //records would spend quota on pins that are about to place themselves
                records: isPreparingAttributes ? EMPTY_RECORDS : pins.unplacedRecords,
                addressAttribute,
                //a resolved coordinate is written back through the same attributes the map reads, so the
                //address is never sent to the service twice
                latitudeAttribute: coordinateAttributes.latitude,
                longitudeAttribute: coordinateAttributes.longitude,
                persistCoordinates: saveCoordinates,
                geocoder,
                language,
                maxRequests
            });
            const coordinates = geocoded.coordinates;
            const isResolving = geocoded.isResolving;
            //placed again with the resolved coordinates, so a geo-coded record keeps its dataset position
            return useMemo(() => {
                const placed = Object.keys(coordinates).length ? placeRecords(records, coordinates) : pins;
                return isResolving || pins.isResolving ? { ...placed, isResolving: true } : placed;
            }, [pins, records, placeRecords, coordinates, isResolving]);
        },

        useStatus: (context: IMapViewContext): IMapStatusMessage | undefined => {
            const labels = useModuleLabels(context, geocodingLabels, options.labels);
            if (!geocoded) {
                return undefined;
            }
            if (geocoded.isResolving) {
                return {
                    message: labels.geocodingAddresses({
                        done: `${geocoded.resolvedCount}`,
                        count: `${geocoded.resolvedCount + geocoded.pendingCount}`
                    }),
                    isBusy: true,
                    priority: PRIORITY.resolving
                };
            }
            //a service refusing the call is somebody's to fix, so it outranks every other thing worth saying
            if (geocoded.failedCount) {
                return { message: labels.geocodingFailed({ count: `${geocoded.failedCount}` }), isWarning: true, priority: PRIORITY.failed };
            }
            //a map quietly drawing fewer pins than the view holds reads as records that are not there
            if (geocoded.unplacedCount) {
                return { message: labels.geocodingCapped({ count: `${geocoded.unplacedCount}` }), isWarning: true, priority: PRIORITY.capped };
            }
            //an address the service does not know is not an error, but it is still a missing pin
            if (geocoded.unplaceableCount) {
                return { message: labels.geocodingUnplaceable({ count: `${geocoded.unplaceableCount}` }), isWarning: true, priority: PRIORITY.unplaceable };
            }
            return undefined;
        }
    };
};
