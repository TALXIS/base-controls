import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import deepEqual from 'fast-deep-equal/es6';
import { IMapProvider } from "../providers";
import { IMapFallbackLocationResolver, IMapResolvedLocation, shouldResolveFallbackLocation } from "../core/fallbackLocation";
import { getMapViewport, getResolvedLocationViewport, IMapViewport, IMapViewportOptions, IMapViewportRequest } from "../core/viewport";
import { IMapCoordinates } from "../core/coordinates";

export interface IUseMapViewport {
    locations: IMapCoordinates[];
    /** Component currently drawing the map. A different one is a fresh map that needs the handoff below. */
    provider: IMapProvider;
    options?: IMapViewportOptions;
    onResolveFallbackLocation?: IMapFallbackLocationResolver;
    /** Whether the host is still fetching records, so an empty map is not yet an answer. */
    isDatasetLoading?: boolean;
    /** Whether the control is still draining the remaining pages of the view. */
    isLoadingAllRecords?: boolean;
    /** Whether addresses are still being geo-coded into coordinates. */
    isGeocoding?: boolean;
    /** Called with what the provider reports, deduplicated. */
    onChange: (viewport: IMapViewport) => void;
}

//lets a fast loading dataset win the race and skip the fallback location call entirely
const FALLBACK_LOCATION_DEBOUNCE_MS = 400;
//long enough for a device position to be asked for and declined, and an ip lookup tried after it
const FALLBACK_LOCATION_TIMEOUT_MS = 12000;

/**
 * Owns where the map looks: derives the viewport from the pins and keeps that decision stable across renders
 * and provider switches - a refresh returning the same records must not produce a new viewport, or providers
 * would pull the map back from wherever the user panned to.
 */
export const useMapViewport = (props: IUseMapViewport) => {
    const { locations, provider, options, onResolveFallbackLocation, onChange } = props;
    const { isDatasetLoading, isLoadingAllRecords, isGeocoding } = props;
    const [fallbackLocation, setFallbackLocation] = useState<IMapResolvedLocation>();
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    //a host has no reason to memoize this, so the effect below must not depend on its identity
    const onResolveFallbackLocationRef = useRef(onResolveFallbackLocation);
    onResolveFallbackLocationRef.current = onResolveFallbackLocation;
    const hasLocations = locations.length > 0;
    //an empty map is only an answer once nothing is still working on filling it - see the rule for why
    const canResolveFallback = shouldResolveFallbackLocation({
        hasLocations,
        isDatasetLoading: !!isDatasetLoading,
        isLoadingAllRecords: !!isLoadingAllRecords,
        isResolving: !!isGeocoding
    });

    useEffect(() => {
        if (!onResolveFallbackLocationRef.current || !canResolveFallback) {
            return;
        }
        const controller = new AbortController();
        const debounce = setTimeout(() => {
            const timeout = setTimeout(() => controller.abort(), FALLBACK_LOCATION_TIMEOUT_MS);
            onResolveFallbackLocationRef.current!(controller.signal)
                .then((location) => {
                    if (location && !controller.signal.aborted) {
                        setFallbackLocation(location);
                    }
                })
                .catch((error) => console.warn('Map: the fallback location resolver failed:', error))
                .finally(() => clearTimeout(timeout));
        }, FALLBACK_LOCATION_DEBOUNCE_MS);

        return () => {
            clearTimeout(debounce);
            controller.abort();
        };
        //only the rule above should restart this - an unmemoized resolver prop must not debounce forever
    }, [canResolveFallback]);

    const derivedViewport = useMemo(() => {
        if (!hasLocations && fallbackLocation) {
            return getResolvedLocationViewport(fallbackLocation, options);
        }
        return getMapViewport(locations, options);
    }, [locations, hasLocations, fallbackLocation, options]);

    const derivedViewportRef = useRef(derivedViewport);
    const appliedProviderRef = useRef(provider);
    const viewportRef = useRef(derivedViewport);
    const reportedViewportRef = useRef<IMapViewport>();
    //what the map is showing right now, as state - clustering and anything else viewport driven needs to
    //re-run on a pan, which a ref alone would not trigger
    const [visibleViewport, setVisibleViewport] = useState<IMapViewport>();

    //an explicit request - zooming into a cluster, say - held as a ref plus a counter, so applying it once
    //is distinguishable from applying the same viewport again
    const focusRef = useRef<IMapViewportRequest>();
    const [focusVersion, setFocusVersion] = useState(0);
    const appliedFocusRef = useRef(focusVersion);

    const providerChanged = appliedProviderRef.current !== provider;
    appliedProviderRef.current = provider;
    const derivedChanged = !deepEqual(derivedViewportRef.current, derivedViewport);
    derivedViewportRef.current = derivedViewport;
    const focusRequested = focusVersion !== appliedFocusRef.current;

    //new records outrank an explicit focus, which outranks a provider switch's handoff; reloading the same
    //records is none of them - the precedence is explicit here rather than left to the order updates run in
    if (derivedChanged) {
        viewportRef.current = derivedViewport;
        appliedFocusRef.current = focusVersion;
    } else if (focusRequested && focusRef.current) {
        appliedFocusRef.current = focusVersion;
        viewportRef.current = focusRef.current;
    } else if (providerChanged && reportedViewportRef.current) {
        //a new provider is a fresh map, so hand it the view the user was on rather than the pins - bounds are
        //left out on purpose, fitting them keeps the padding free and zooms out a notch per switch
        const { bounds, ...handoff } = reportedViewportRef.current;
        viewportRef.current = handoff;
    }

    const onViewportChange = useCallback((changedViewport: IMapViewport) => {
        if (deepEqual(reportedViewportRef.current, changedViewport)) {
            return;
        }
        reportedViewportRef.current = changedViewport;
        setVisibleViewport(changedViewport);
        onChangeRef.current(changedViewport);
    }, []);

    /** Points the map somewhere of the control's choosing, until the pins change and take over again. */
    const onFocusViewport = useCallback((focused: IMapViewportRequest) => {
        focusRef.current = focused;
        setFocusVersion((version) => version + 1);
    }, []);

    return {
        viewport: viewportRef.current,
        //before the map has reported anything, what it was asked to show is the best guess at what it shows
        visibleViewport: visibleViewport ?? viewportRef.current,
        onViewportChange,
        onFocusViewport
    };
};
