import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { IDataProviderEventListeners, IRecord } from "@talxis/client-libraries";
import { useControl } from "@hooks";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { getClassNames } from "@utils";
import { IMap } from "./interfaces";
import { getDistinctAttributePaths } from "./core/attributes";
import { getMapLanguageTag } from "./core/language";
import { getMapPinAppearance, parseMapPinRules } from "./core/pinAppearance";
import { EMPTY_MAP_PINS, getMapPins } from "./core/pins";
import { getMapWebResourceUrl } from "./core/webResource";
import { useDatasetLoading } from "./core/useDatasetLoading";
import { useMapAttributes } from "./core/useMapAttributes";
import {
    getMapModuleEntries,
    getMapModulesKey,
    IMapModuleEntry,
    pickMapStatus,
    useMapModuleDrawnLocations,
    useMapModuleOverlays,
    useMapModulePins,
    useMapModuleProviderProps,
    useMapModuleRecords,
    useMapModuleStates,
    useMapModuleStatuses,
    useMapModuleStore,
    useMapOverlayItems
} from "./core/useMapModules";
import { useMapProviders } from "./core/useMapProviders";
import { useMapRecords } from "./core/useMapRecords";
import { useMapViewport } from "./core/useMapViewport";
import { IMapClickModifiers, IMapLocation, IMapProviderProps } from "./providers/provider";
import {
    IMapFallbackCoordinates,
    IMapModuleContext,
    IMapOverlayPosition,
    IMapPinsContext,
    IMapStatusMessage,
    IMapViewContext,
    MAP_OVERLAY_ORDER,
    MAP_STATUS_PRIORITY
} from "./modules/interfaces";
import { mapLabels } from "./labels";
import { getMapStyles } from "./styles";
import { MapComponents } from "./components";
import { MapOverlay } from "./map-overlay";

const EMPTY_RECORDS: IRecord[] = [];

/** Corners the chrome is anchored to, in the order they are rendered. */
const OVERLAY_POSITIONS: IMapOverlayPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/**
 * Draws the records of a dataset as pins on a map.
 *
 * The core reads coordinates, decides how pins look and where the map looks, and hands both to a provider.
 * Everything else is a module passed in through `modules`; the core runs each module's stages in a fixed
 * order between its own steps - see `modules/interfaces.ts`.
 */
export const Map = (props: IMap) => {
    const entries = useMemo(() => getMapModuleEntries(props.modules), [props.modules]);
    //the stages are hooks, so a changed set of modules is a fresh mount rather than a changed call order
    return <MapBody key={getMapModulesKey(entries)} {...props} entries={entries} />;
};

interface IMapBodyProps extends IMap {
    entries: IMapModuleEntry[];
}

const MapBody = (props: IMapBodyProps) => {
    const { entries } = props;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((providerProps) => providerProps);
    const {
        Dataset: dataset,
        LatitudeAttributeName,
        LongitudeAttributeName,
        AutoAddLinkedColumns,
        PinLoading,
        MaxRecords,
        PinRules,
        ShowPointsOfInterest
    } = props.parameters;
    const { className, labels, theme, onNotifyOutputChanged } = useControl('Map', props, mapLabels);
    const styles = useMemo(() => getMapStyles(), []);
    const components = useMemo(() => ({ ...MapComponents, ...props.components }), [props.components]);
    const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
    const language = getMapLanguageTag(props.context?.userSettings?.languageId);

    const { options, selectedId, provider: MapProvider, geocoder, directions, onPickProvider } = useMapProviders({
        parameters: props.parameters,
        providers: props.providers,
        onPick: (id) => onNotifyOutputChanged({ MapProvider: id })
    });

    //raw values as the dependency, so a host has to memoize nothing to keep the pins stable
    const latitudeAttribute = LatitudeAttributeName?.raw ?? undefined;
    const longitudeAttribute = LongitudeAttributeName?.raw ?? undefined;
    const coordinateAttributes = useMemo(
        () => ({ latitude: latitudeAttribute, longitude: longitudeAttribute }),
        [latitudeAttribute, longitudeAttribute]
    );

    const isDatasetLoading = useDatasetLoading(dataset);

    const { records: loadedRecords, isLoading: isLoadingAllPages, loadedCount, isTruncated } = useMapRecords({
        dataset,
        loading: PinLoading?.raw ?? 'page',
        maxRecords: MaxRecords?.raw ?? undefined
    });

    useEffect(() => {
        setSelectedRecordIds(dataset?.getSelectedRecordIds() ?? []);
    }, [dataset, loadedRecords]);

    useEventEmitter<IDataProviderEventListeners>(dataset, 'onRecordsSelected', (ids: string[]) => setSelectedRecordIds(ids ?? []));

    const store = useMapModuleStore();
    const moduleContext = useMemo<IMapModuleContext>(() => ({
        context: props.context,
        dataset,
        theme,
        labels,
        language,
        coordinateAttributes,
        geocoder,
        directions,
        isLoading: isDatasetLoading || isLoadingAllPages,
        selectedRecordIds,
        onNotifyOutputChanged,
        read: store.read
    }), [
        props.context,
        dataset,
        theme,
        labels,
        language,
        coordinateAttributes,
        geocoder,
        directions,
        isDatasetLoading,
        isLoadingAllPages,
        selectedRecordIds,
        onNotifyOutputChanged,
        store.read
    ]);

    const moduleStates = useMapModuleStates(entries, store, moduleContext);

    //every path the map reads, the core's and the modules', so a lookup any of them crosses gets its column
    const attributePaths = getDistinctAttributePaths([
        latitudeAttribute,
        longitudeAttribute,
        ...moduleStates.flatMap((state) => state.attributePaths ?? [])
    ]);
    const isPreparingAttributes = useMapAttributes({ dataset, paths: attributePaths, enabled: AutoAddLinkedColumns?.raw !== false });

    //code first, then whatever a module registered, then the rules a maker typed into the manifest
    const pinRules = useMemo(() => parseMapPinRules(PinRules?.raw), [PinRules?.raw]);
    const onResolvePin = props.onResolvePin;
    const moduleResolvers = moduleStates.map((state) => state.resolvePin).filter((resolver) => !!resolver);
    const moduleResolversKey = moduleResolvers.length;
    const resolvePinAppearance = useCallback((record: IRecord) => {
        const resolved = onResolvePin?.(record);
        if (resolved) {
            return resolved;
        }
        for (const resolver of moduleResolvers) {
            const fromModule = resolver!(record);
            if (fromModule) {
                return fromModule;
            }
        }
        return getMapPinAppearance(record, pinRules, getMapWebResourceUrl);
        //the resolver list is rebuilt every render; its members are what the stable dependencies below track
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onResolvePin, pinRules, moduleResolversKey, ...moduleResolvers]);

    const records = useMapModuleRecords(entries, loadedRecords, moduleContext);

    //the way the core places records, handed to the modules so a record they placed gets the same pin
    const placeRecords = useCallback((toPlace: IRecord[], fallbackCoordinates?: IMapFallbackCoordinates) => {
        if (!latitudeAttribute || !longitudeAttribute) {
            return EMPTY_MAP_PINS;
        }
        return getMapPins(toPlace, {
            attributes: { latitude: latitudeAttribute, longitude: longitudeAttribute },
            fallbackCoordinates,
            getAppearance: resolvePinAppearance
        });
    }, [latitudeAttribute, longitudeAttribute, resolvePinAppearance]);

    //while linked columns are still registering, coordinates read as absent - a module geo-coding those records
    //would spend quota on pins that are about to place themselves
    const placement = useMemo(() => placeRecords(isPreparingAttributes ? EMPTY_RECORDS : records), [placeRecords, records, isPreparingAttributes]);

    const pinsContext = useMemo<IMapPinsContext>(
        () => ({ ...moduleContext, records, placeRecords, isPreparingAttributes }),
        [moduleContext, records, placeRecords, isPreparingAttributes]
    );
    const pins = useMapModulePins(entries, placement, pinsContext);

    const resolveFallbackLocation = moduleStates.find((state) => state.resolveFallbackLocation)?.resolveFallbackLocation;

    const { viewport, visibleViewport, onViewportChange, onFocusViewport } = useMapViewport({
        locations: pins.locations,
        provider: MapProvider,
        options: props.viewportOptions,
        onResolveFallbackLocation: resolveFallbackLocation,
        isDatasetLoading,
        isLoadingAllRecords: isLoadingAllPages,
        isResolving: !!pins.isResolving,
        onChange: (changedViewport) => onNotifyOutputChanged({ Viewport: changedViewport })
    });

    const viewContext = useMemo<IMapViewContext>(
        () => ({ ...pinsContext, pins, viewport, visibleViewport, onFocusViewport }),
        [pinsContext, pins, viewport, visibleViewport, onFocusViewport]
    );

    const drawnLocations = useMapModuleDrawnLocations(entries, pins.locations, viewContext);

    //a plain click selects the one record; ctrl/cmd toggles it in the selection, so several pins can be
    //picked straight off the map. A grouped pin has no record to select, so the core zooms into it
    const onLocationClick = useCallback((location: IMapLocation, modifiers?: IMapClickModifiers) => {
        if (location.cluster) {
            onFocusViewport({
                center: { latitude: location.latitude, longitude: location.longitude },
                zoom: location.cluster.expansionZoom,
                padding: viewport.padding
            });
            return;
        }
        if (modifiers?.ctrlKey || modifiers?.metaKey) {
            const selected = dataset?.getSelectedRecordIds() ?? [];
            dataset?.setSelectedRecordIds(selected.includes(location.recordId!)
                ? selected.filter((id) => id !== location.recordId)
                : [...selected, location.recordId!]);
            return;
        }
        dataset?.setSelectedRecordIds(location.recordId ? [location.recordId] : []);
    }, [dataset, onFocusViewport, viewport.padding]);

    //the dataset selects records; a provider is handed the pins standing for them, grouped ones included
    const selectedLocationIds = useMemo(() => drawnLocations
        .filter((location) => (location.recordId
            ? selectedRecordIds.includes(location.recordId)
            : !!location.cluster?.recordIds.some((recordId) => selectedRecordIds.includes(recordId))))
        .map((location) => location.id), [drawnLocations, selectedRecordIds]);

    const coreProviderProps = useMemo<IMapProviderProps>(() => ({
        locations: drawnLocations,
        routes: pins.routes,
        viewport,
        selectedLocationIds,
        openCards: [],
        context: props.context,
        theme,
        labels,
        showPointsOfInterest: ShowPointsOfInterest?.raw === true,
        onLocationClick,
        onViewportChange
    }), [
        drawnLocations,
        pins.routes,
        viewport,
        selectedLocationIds,
        props.context,
        theme,
        labels,
        ShowPointsOfInterest?.raw,
        onLocationClick,
        onViewportChange
    ]);
    const providerProps = useMapModuleProviderProps(entries, coreProviderProps, viewContext);

    const coreStatus: IMapStatusMessage | undefined = isLoadingAllPages
        ? { message: labels.loadingPins({ count: `${loadedCount}` }), isBusy: true, priority: MAP_STATUS_PRIORITY.loading }
        : isTruncated
            ? { message: labels.pinsTruncated({ count: `${loadedCount}` }), isWarning: true, priority: MAP_STATUS_PRIORITY.truncated }
            : undefined;
    const moduleStatuses = useMapModuleStatuses(entries, viewContext);
    const status = pickMapStatus(coreStatus ? [coreStatus, ...moduleStatuses] : moduleStatuses);

    const moduleOverlays = useMapModuleOverlays(entries, viewContext);
    const overlays = useMapOverlayItems(useMemo(() => [
        ...moduleOverlays,
        { position: 'top-left' as const, order: MAP_OVERLAY_ORDER.status, element: components.onRenderStatus({ ...status, theme }) },
        ...(options.length > 1
            ? [{
                position: 'top-right' as const,
                order: MAP_OVERLAY_ORDER.providerPicker,
                element: components.onRenderProviderPicker({
                    options,
                    selectedId,
                    label: labels.mapProvider(),
                    theme,
                    onChange: onPickProvider
                })
            }]
            : [])
    ], [components, moduleOverlays, status, theme, options, selectedId, labels, onPickProvider]));

    return (
        <div className={getClassNames([className, styles.root])}>
            <MapProvider {...onOverrideComponentProps(providerProps)} />
            {/*
                each corner stacks its chrome downward, so opening a panel grows it on its own instead of
                widening a shared row and pushing its neighbours across the map
            */}
            {OVERLAY_POSITIONS.map((position) => (
                <MapOverlay key={position} position={position} theme={theme}>
                    {overlays[position]?.map((item, index) => <Fragment key={index}>{item.element}</Fragment>)}
                </MapOverlay>
            ))}
        </div>
    );
};
