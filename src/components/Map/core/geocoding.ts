import { IAddress } from '@talxis/client-libraries';
import { IMapCoordinates } from './coordinates';

/** Candidates a geocoder returns when the caller does not ask for a different number. */
export const DEFAULT_GEOCODING_LIMIT = 5;

/** A place a geocoding service resolved: where it is, and the address components behind it. */
export interface IMapPlace {
    coordinates: IMapCoordinates;
    /** Address components, in the shape `@talxis/client-libraries` already uses for an address. */
    address: IAddress;
    /** One line description, for a suggestion list. */
    label: string;
}

export interface IMapGeocodingOptions {
    /** BCP 47 tag the service should answer in. */
    language?: string;
    /** Most candidates to return. A service may return fewer, never more. */
    limit?: number;
    signal?: AbortSignal;
}

/**
 * Turns addresses into coordinates and back.
 *
 * Every vendor that has a geocoding service implements this, so the control never learns which one is
 * answering - and a vendor without one simply does not build a geocoder.
 */
export interface IMapGeocoder {
    /**
     * Whether the service may be asked as someone types. Defaults to `true`; a service whose terms forbid a
     * call a keystroke says `false`, and the search box then only asks it once a query is submitted.
     */
    allowsTypeAhead?: boolean;
    /**
     * Addresses the service will answer for one set of records, where its terms cap that lower than the
     * control's own default. A service that charges for what it answers leaves this unset; a free public one
     * whose policy calls a long run heavy use says how much of a run it is willing to take.
     */
    maxBulkRequests?: number;
    /**
     * Lookups the service is willing to answer at once. Defaults to `1` - strictly one at a time - because
     * that is what a public service's policy asks for and what a service that says nothing is assumed to
     * want. A service whose terms allow a run in parallel says how wide it may be.
     */
    maxConcurrentRequests?: number;
    /** Places matching an address, best first. An address the service does not know resolves to none. */
    geocode(query: string, options?: IMapGeocodingOptions): Promise<IMapPlace[]>;
    /** The place covering a point, or `null` when the service knows of none. */
    reverseGeocode(coordinates: IMapCoordinates, options?: IMapGeocodingOptions): Promise<IMapPlace | null>;
}

export interface IGeocodingRequestLimit {
    /** What the host asked for, which is the last word on it. */
    maxRequests?: number;
    /** The control's own ceiling, for a service that names none. */
    defaultLimit: number;
    /** What the service says one run may spend, where its terms cap that lower. */
    serviceLimit?: number;
    /** Whether a resolved coordinate is written back, so an address costs a lookup once ever. */
    canPersist: boolean;
}

/**
 * How many addresses one set of records may spend.
 *
 * A service's own bulk limit only binds where the coordinates are thrown away at the end of the session: a
 * run that writes what it resolved asks about each address once ever, which is the case its policy is asking
 * for. A host that named a number outranks both.
 */
export const getGeocodingRequestLimit = (options: IGeocodingRequestLimit): number => {
    if (options.maxRequests !== undefined && options.maxRequests !== null) {
        return Math.max(0, options.maxRequests);
    }
    if (!options.canPersist && options.serviceLimit !== undefined) {
        return Math.max(0, options.serviceLimit);
    }
    return options.defaultLimit;
};

/** Composes a one line description out of address components, for a service that returns none of its own. */
export const getAddressLabel = (address: IAddress): string => {
    const street = [address.street, address.streetNumber].filter(Boolean).join(' ');
    const locality = [address.postalCode, address.locality].filter(Boolean).join(' ');
    return [street, locality, address.country].filter(Boolean).join(', ');
};
