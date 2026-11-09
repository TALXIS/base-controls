import { IRecord } from '@talxis/client-libraries';
import { getRecordCoordinate } from './attributes';
import { IMapPinAppearance, isEmptyPinAppearance } from './pinAppearance';
import { IMapLocation } from '../providers/provider';
import { IMapFallbackCoordinates, IMapPins } from '../modules/interfaces';

/** Attribute names the coordinates are read under. */
export interface IMapPinAttributes {
    latitude: string;
    longitude: string;
}

export interface IMapPinOptions {
    attributes: IMapPinAttributes;
    /** Coordinates the address fallback resolved, used for records that carry none of their own. */
    fallbackCoordinates?: IMapFallbackCoordinates;
    /** Works out how a record's pin should look. Returning nothing draws the shipped pin. */
    getAppearance?: (record: IRecord) => IMapPinAppearance | undefined;
}

export const EMPTY_MAP_PINS: IMapPins = { locations: [], routes: [], unplacedRecords: [] };

/** Reads one record's pin, or `undefined` when the record cannot be placed at all. */
const getLocation = (record: IRecord, options: IMapPinOptions): IMapLocation | undefined => {
    const { attributes, fallbackCoordinates, getAppearance } = options;
    const id = record.getRecordId();
    let latitude = getRecordCoordinate(record, attributes.latitude);
    let longitude = getRecordCoordinate(record, attributes.longitude);
    if (latitude === undefined || longitude === undefined) {
        const fallback = fallbackCoordinates?.[id];
        if (!fallback) {
            return undefined;
        }
        latitude = fallback.latitude;
        longitude = fallback.longitude;
    }
    const name = record.getNamedReference()?.name;
    const pin = getAppearance?.(record);
    return {
        id,
        recordId: id,
        latitude,
        longitude,
        label: typeof name === 'string' ? name : undefined,
        //an appearance that changes nothing is dropped, so it does not weigh on every location object
        ...(isEmptyPinAppearance(pin) ? {} : { pin })
    };
};

/**
 * Reads the pins off the loaded records: locations in dataset order, and the records left unplaced.
 * Routes start empty; the routes module fills them.
 */
export const getMapPins = (records: IRecord[], options: IMapPinOptions): IMapPins => {
    const locations: IMapLocation[] = [];
    const unplacedRecords: IRecord[] = [];

    records.forEach((record, index) => {
        try {
            const location = getLocation(record, options);
            if (location) {
                locations.push(location);
            } else {
                unplacedRecords.push(record);
            }
        } catch (error) {
            console.warn(`Map: failed to read the location of the record on index ${index}:`, error);
        }
    });

    return { locations, routes: [], unplacedRecords };
};
