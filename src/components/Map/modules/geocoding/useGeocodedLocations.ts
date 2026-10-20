import { useCallback, useEffect, useRef, useState } from 'react';
import { IRecord } from '@talxis/client-libraries';
import { getRecordValue } from '../../core/attributes';
import { getGeocodingRequestLimit, IMapGeocoder } from '../../core/geocoding';
import { IMapFallbackCoordinates } from '../interfaces';
import { IMapCoordinates } from '../../core/coordinates';

/**
 * Addresses resolved per set of records when a coordinate can be written back, so a first visit to a large
 * view spreads its backfill over several rather than holding a service for an hour.
 */
export const DEFAULT_MAX_GEOCODING_REQUESTS = 250;

/**
 * Saves that may fail before the run gives up. A service refusing one write refuses them all - a missing
 * privilege, a calculated attribute - and carrying on would spend a lookup per record for nothing.
 */
const PERSIST_FAILURE_LIMIT = 3;

export interface IUseGeocodedLocations {
    /** Records no coordinates could be read from. */
    records: IRecord[];
    /** Attribute holding the full address. Nothing here turns the fallback off entirely. */
    addressAttribute?: string;
    /** Attributes a resolved coordinate is written back to. Both are needed to write anything. */
    latitudeAttribute?: string;
    longitudeAttribute?: string;
    /**
     * Whether a resolved coordinate is saved to its record, which is what keeps an address from being
     * resolved twice. Off falls back to remembering coordinates for the lifetime of the control alone.
     */
    persistCoordinates?: boolean;
    /** Geocoder to resolve with, from whichever configured vendor has one. */
    geocoder?: IMapGeocoder;
    /** Language the addresses should be resolved in. */
    language?: string;
    /** Addresses to resolve before stopping. Overrides both the default and whatever the service asks for. */
    maxRequests?: number;
}

export interface IGeocodedLocationsState {
    /** Coordinates resolved so far, keyed by record id, ready to hand to `getMapPins`. */
    coordinates: IMapFallbackCoordinates;
    /** Whether addresses are still being resolved. */
    isResolving: boolean;
    /** How many are still waiting. */
    pendingCount: number;
    /** How many have been resolved since the queue last stood empty, so the map can count progress. */
    resolvedCount: number;
    /**
     * Records left without a pin because the cap stopped the queue short of them. A map drawing fewer pins
     * than the view holds has to be able to say so, or the missing ones read as records that do not exist.
     */
    unplacedCount: number;
    /**
     * Records whose address the service answered about but could not place. Nothing is wrong and nothing
     * will retry them, so the only useful thing left to do is say how many there are.
     */
    unplaceableCount: number;
    /**
     * Records the service could not be asked about at all - it refused the call, or the network did. Worth
     * saying separately from an address it simply does not know, because this one is somebody's to fix.
     */
    failedCount: number;
}

interface IGeocodingAttempt {
    query: string;
    /** `null` marks an address the service could not place, so it is never asked about again. */
    coordinates: IMapCoordinates | null;
}

const EMPTY_STATE: IGeocodedLocationsState = {
    coordinates: {},
    isResolving: false,
    pendingCount: 0,
    resolvedCount: 0,
    unplacedCount: 0,
    unplaceableCount: 0,
    failedCount: 0
};

/**
 * Places the records that carry an address but no coordinates.
 *
 * Addresses are asked about at the pace the service allows: one at a time unless it says it takes more, and
 * the gap between calls belongs to the service client, which is where a usage policy like Nominatim's one
 * call a second is enforced. A resolved coordinate is written straight back to its record. That write is the point: a record that carries coordinates is placed by
 * reading them, so an address is only ever sent to a geo-coding service once, by whoever opened the map
 * first. Without somewhere to write, coordinates are remembered for this control's lifetime only and the
 * service's own bulk limit caps how many of them are asked for.
 *
 * A record the service cannot place is remembered as unplaceable rather than retried - resolving a record
 * removes it from the input, and failing to resolve one would otherwise put it straight back.
 */
export const useGeocodedLocations = (props: IUseGeocodedLocations): IGeocodedLocationsState => {
    const {
        records,
        addressAttribute,
        latitudeAttribute,
        longitudeAttribute,
        persistCoordinates,
        geocoder,
        language,
        maxRequests
    } = props;
    const [state, setState] = useState<IGeocodedLocationsState>(EMPTY_STATE);
    const attemptedRef = useRef(new Map<string, IGeocodingAttempt>());
    /**
     * Records waiting their turn, by record id, which a `Map` keeps in the order they were added.
     *
     * Keyed rather than listed for two reasons: a re-render cannot queue the same record twice, and a host
     * that hands over a fresh dataset - or a refresh that rebuilds the records - replaces the object waiting
     * in the queue instead of stranding it, so what gets written is the record the map is actually drawing.
     */
    const queueRef = useRef(new Map<string, IRecord>());
    //workers on the queue right now, which is what keeps a second call from doubling them up
    const workerCountRef = useRef(0);
    const resolvedRef = useRef(0);
    const unplacedRef = useRef(0);
    const unplaceableRef = useRef(0);
    const failedRef = useRef(0);
    const persistFailuresRef = useRef(0);
    //latched for the rest of a burst once the writes prove impossible, so it stops resolving into nothing
    const persistBrokenRef = useRef(false);
    //bumped when the queue is thrown away, so a call already in flight knows to stop
    const generationRef = useRef(0);
    const abortRef = useRef<AbortController>();
    //the drain outlives a re-render, so it reads the service and language it should use now rather than the
    //ones that were current when it started
    const geocoderRef = useRef(geocoder);
    const languageRef = useRef(language);

    const isEnabled = !!addressAttribute && !!geocoder;

    useEffect(() => {
        geocoderRef.current = geocoder;
        languageRef.current = language;
    }, [geocoder, language]);

    /**
     * Forgets every attempt when the service changes.
     *
     * A different service is a different answer, so an address the last one could not place is worth asking
     * the new one about. It costs nothing for the records that were placed and saved - those carry their
     * coordinates now and never come back here.
     */
    useEffect(() => {
        generationRef.current++;
        abortRef.current?.abort();
        abortRef.current = undefined;
        attemptedRef.current = new Map();
        queueRef.current = new Map();
        resolvedRef.current = 0;
        unplacedRef.current = 0;
        unplaceableRef.current = 0;
        failedRef.current = 0;
        setState(EMPTY_STATE);
    }, [geocoder]);

    const getQuery = useCallback((record: IRecord) => {
        const address = getRecordValue(record, addressAttribute as string);
        return address === null || address === undefined ? '' : `${address}`;
    }, [addressAttribute]);

    const publish = useCallback((): IMapFallbackCoordinates => {
        const coordinates: IMapFallbackCoordinates = {};
        attemptedRef.current.forEach((attempt, recordId) => {
            if (attempt.coordinates) {
                coordinates[recordId] = attempt.coordinates;
            }
        });
        return coordinates;
    }, []);

    const report = useCallback(() => {
        setState({
            coordinates: publish(),
            isResolving: queueRef.current.size > 0,
            pendingCount: queueRef.current.size,
            resolvedCount: resolvedRef.current,
            unplacedCount: unplacedRef.current,
            unplaceableCount: unplaceableRef.current,
            failedCount: failedRef.current
        });
    }, [publish]);

    /** Whether this record's coordinate attributes are ours to write. */
    const canPersistTo = useCallback((record: IRecord): boolean => {
        if (persistCoordinates === false || persistBrokenRef.current || !latitudeAttribute || !longitudeAttribute) {
            return false;
        }
        try {
            return record.getColumnInfo(latitudeAttribute).security.editable
                && record.getColumnInfo(longitudeAttribute).security.editable;
        } catch (error) {
            //an attribute the view does not carry has no column info, which is an answer rather than a failure
            return false;
        }
    }, [persistCoordinates, latitudeAttribute, longitudeAttribute]);

    /**
     * Writes a resolved coordinate to its record.
     *
     * @returns Whether it was saved, so a service that refuses the write can stop the run rather than have
     * every remaining address resolved and thrown away.
     */
    const persist = useCallback(async (record: IRecord, coordinates: IMapCoordinates): Promise<boolean> => {
        try {
            record.setValue(latitudeAttribute as string, coordinates.latitude);
            record.setValue(longitudeAttribute as string, coordinates.longitude);
            const result = await record.save();
            if (result && result.success === false) {
                console.warn('Map: could not save the geo-coded coordinates of a record:', result);
                return false;
            }
            return true;
        } catch (error) {
            console.warn('Map: could not save the geo-coded coordinates of a record:', error);
            return false;
        }
    }, [latitudeAttribute, longitudeAttribute]);

    /** Takes addresses off the queue until it is empty, saving each coordinate as it arrives. */
    const work = useCallback(async (generation: number) => {
        while (queueRef.current.size) {
            if (generationRef.current !== generation) {
                return;
            }
            //taken off up front, because a sibling worker must not be handed the same record
            const recordId = queueRef.current.keys().next().value as string;
            const record = queueRef.current.get(recordId) as IRecord;
            queueRef.current.delete(recordId);
            const query = getQuery(record);
            let coordinates: IMapCoordinates | null = null;
            let hasFailed = false;
            try {
                if (query.trim()) {
                    const places = await (geocoderRef.current as IMapGeocoder).geocode(query, {
                        language: languageRef.current,
                        limit: 1,
                        signal: abortRef.current?.signal
                    });
                    coordinates = places[0]?.coordinates ?? null;
                }
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') {
                    return;
                }
                //one address the service cannot answer for must not stop the rest of them
                hasFailed = true;
                console.warn('Map: could not resolve the address of a record:', error);
            }
            if (generationRef.current !== generation) {
                //never recorded as attempted, so the next run picks this record up again
                return;
            }
            attemptedRef.current.set(recordId, { query, coordinates });

            if (hasFailed) {
                failedRef.current++;
            } else if (!coordinates && query.trim()) {
                unplaceableRef.current++;
            }
            if (coordinates) {
                resolvedRef.current++;
                if (canPersistTo(record)) {
                    if (await persist(record, coordinates)) {
                        persistFailuresRef.current = 0;
                    } else if (++persistFailuresRef.current >= PERSIST_FAILURE_LIMIT) {
                        //every remaining address would be resolved only to be dropped, which the policy calls waste
                        console.warn(`Map: giving up on geo-coding after ${PERSIST_FAILURE_LIMIT} coordinates could not be saved.`);
                        persistBrokenRef.current = true;
                        unplacedRef.current += queueRef.current.size;
                        queueRef.current = new Map();
                    }
                }
            }
            if (generationRef.current === generation) {
                report();
            }
        }
    }, [getQuery, canPersistTo, persist, report]);

    /**
     * Puts as many workers on the queue as the service allows, which is one unless it says otherwise.
     *
     * Called again whenever the queue grows or the service changes, so switching from a service that answers
     * one at a time to one that takes several widens the run rather than waiting for it to finish.
     */
    const drain = useCallback((generation: number) => {
        const allowed = Math.max(1, geocoderRef.current?.maxConcurrentRequests ?? 1);
        const wanted = Math.min(allowed, queueRef.current.size);
        while (workerCountRef.current < wanted) {
            workerCountRef.current++;
            void work(generation).finally(() => {
                workerCountRef.current--;
                //the last one out reports the finished run, whichever of them it turns out to be
                if (!workerCountRef.current && generationRef.current === generation) {
                    report();
                }
            });
        }
    }, [work, report]);

    //the records array is rebuilt on every load, so the effect keys off their content; the address is part of
    //it because an edited address is a new question about the same record
    const recordKey = isEnabled ? records.map((record) => `${record.getRecordId()}:${getQuery(record)}`).join('|') : '';

    useEffect(() => {
        if (!isEnabled) {
            generationRef.current++;
            abortRef.current?.abort();
            attemptedRef.current = new Map();
            queueRef.current = new Map();
            resolvedRef.current = 0;
            unplacedRef.current = 0;
            unplaceableRef.current = 0;
            failedRef.current = 0;
            setState(EMPTY_STATE);
            return;
        }
        const pending = records.filter((record) =>
            attemptedRef.current.get(record.getRecordId())?.query !== getQuery(record));
        //a record already waiting is not new work, but its object may be - so it is refreshed either way
        const queued = pending.filter((record) => queueRef.current.has(record.getRecordId()));
        queued.forEach((record) => queueRef.current.set(record.getRecordId(), record));
        const fresh = pending.filter((record) => !queueRef.current.has(record.getRecordId()));
        if (!fresh.length) {
            //a queue that emptied while a superseded run held the flags still has to clear them
            if (!queueRef.current.size) {
                setState((current) => (current.isResolving || current.pendingCount
                    ? { ...current, isResolving: false, pendingCount: 0 }
                    : current));
            }
            return;
        }
        //a burst starts from zero, so the map counts progress through this batch rather than all time, and
        //writing is worth another try - what refused it may have been this set of records rather than the next
        if (!queueRef.current.size) {
            resolvedRef.current = 0;
            unplacedRef.current = 0;
            unplaceableRef.current = 0;
            failedRef.current = 0;
            persistFailuresRef.current = 0;
            persistBrokenRef.current = false;
        }
        const limit = getGeocodingRequestLimit({
            maxRequests,
            defaultLimit: DEFAULT_MAX_GEOCODING_REQUESTS,
            serviceLimit: geocoder?.maxBulkRequests,
            //probed on one record, because a view's coordinate attributes are writable for all of them or none
            canPersist: canPersistTo(pending[0])
        });
        const room = Math.max(0, limit - queueRef.current.size);
        const taken = fresh.slice(0, room);
        unplacedRef.current += fresh.length - taken.length;
        taken.forEach((record) => queueRef.current.set(record.getRecordId(), record));
        if (!abortRef.current || abortRef.current.signal.aborted) {
            abortRef.current = new AbortController();
        }
        report();
        drain(generationRef.current);
        //recordKey stands in for records, which is rebuilt on every load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordKey, isEnabled, geocoder, language, maxRequests, canPersistTo, drain, report, getQuery]);

    //an unmount must not leave a call running against a service that counts them
    useEffect(() => () => {
        generationRef.current++;
        abortRef.current?.abort();
    }, []);

    return state;
};
