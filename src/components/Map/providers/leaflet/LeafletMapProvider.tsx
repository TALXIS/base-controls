import L from 'leaflet';
import React, { MouseEvent, ReactNode, useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { IMapLocation, IMapProvider, IMapProviderProps } from '../provider';
import {
    getClusterPinSize,
    getClusterPinSvg,
    getPinAnchor,
    getPinImageMarkup,
    getPinMarkup,
    getPinSize,
    ROUTE_STROKE_WEIGHT,
    useMapPinSelection
} from '../pinStyle';
import { CARD_MAX_WIDTH } from '../layout';
import { useCardMaxHeight } from '../useCardMaxHeight';
import { isMapSurfaceClick } from '../mapClick';
import { DEFAULT_MAP_VIEWPORT_OPTIONS, getSafeFitPadding, isFiniteMapViewport, IMapViewport } from '../../core/viewport';
import { getLeafletMapProviderStyles } from './styles';
import 'leaflet/dist/leaflet.css';

export interface ILeafletMapConfig {
    /** Tile template the map renders. Defaults to the public OpenStreetMap tiles, which have a usage policy. */
    tileLayerUrl?: string;
    /** Attribution shown in the corner. Rendered as HTML, so it can carry the links a licence asks for. */
    attribution?: string;
    /** Lowest zoom level the tile service serves. Defaults to the Leaflet default. */
    minZoom?: number;
    /** Highest zoom the service serves. Leaflet stops at 18, so deeper services must say so or go blank. */
    maxZoom?: number;
    /** Whether a dark theme CSS inverts the tiles. Defaults to `true`; set `false` for a real dark style. */
    invertTilesInDarkTheme?: boolean;
    /** Chrome rendered over the map, for what a licence mandates and the attribution line cannot carry. */
    overlay?: ReactNode;
}

/** Builds the config from what the control handed the provider, for tiles that depend on it - a dark style, say. */
export type ILeafletMapConfigResolver = (props: IMapProviderProps) => ILeafletMapConfig;

//the usage policy asks for exactly this host - the a/b/c subdomains it used to serve can be withdrawn without notice
const DEFAULT_TILE_LAYER_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * The icon one pin is drawn with.
 *
 * Everything is a `DivIcon`, image included, so the provider needs no image assets of its own and a custom
 * appearance is drawn exactly the same way as the shipped one.
 */
const getPinIcon = (location: IMapLocation, defaultColor: string) => {
    const size = getPinSize(location.pin);
    const markup = getPinMarkup(location.pin, defaultColor);
    const anchor = getPinAnchor(location, size);
    return new L.DivIcon({
        className: '',
        iconSize: [size.width, size.height],
        iconAnchor: [anchor.x, anchor.y],
        //relative to the anchor point, so the popup opens just above the icon whichever way it is anchored
        popupAnchor: [0, -anchor.y],
        html: markup ?? getPinImageMarkup(location.pin!.url as string, size)
    });
};

/** A pin standing for a group, anchored at its centre because a circle has no tip to point with. */
const getClusterIcon = (count: number, color: string, textColor: string) => {
    const size = getClusterPinSize(count);
    return new L.DivIcon({
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2)],
        html: getClusterPinSvg(count, color, textColor)
    });
};

/**
 * Space a popup keeps from the map's top left corner when it is panned into view: the zoom control lives
 * there (two 30px buttons, 10px in from the edge) and is drawn above popups, so a card panned flush to the
 * corner would have its top left - a back button, a title - covered by it.
 */
const POPUP_AUTO_PAN_PADDING_TOP_LEFT: L.PointTuple = [56, 10];
const POPUP_AUTO_PAN_PADDING_BOTTOM_RIGHT: L.PointTuple = [10, 10];

/**
 * Keeps a click inside a card from reaching the map, where Leaflet would take it for a click on the map and
 * close the popup. Leaflet decides that by walking up from the clicked element to the popup - but React also
 * listens on the popup's content node, below the map's own listener, so a click that unmounts its own element
 * (a list row opening a card, a back button) has detached it by the time Leaflet looks.
 */
const stopCardClick = (event: MouseEvent) => event.stopPropagation();

/**
 * Leaflet lays a popup out and pans it into view once, as it opens. A card renders its content later and
 * a grouped pin swaps its list for a member's card in place, so the popup grows after that pan - and its
 * top, where the way back to the list sits, ends up outside the map. Re-laying the popup out on every
 * content resize keeps it in view.
 */
const KeepPopupInView = (props: { popupRef: React.RefObject<L.Popup>; children: ReactNode }) => {
    const { popupRef, children } = props;
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const element = contentRef.current;
        if (!element || typeof ResizeObserver === 'undefined') {
            return;
        }
        let lastHeight = element.getBoundingClientRect().height;
        const observer = new ResizeObserver(() => {
            const height = element.getBoundingClientRect().height;
            if (height === lastHeight) {
                return;
            }
            lastHeight = height;
            const popup = popupRef.current;
            if (popup && popup.isOpen()) {
                popup.update();
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [popupRef]);
    //a click inside the card is never a map click - see stopCardClick
    return <div ref={contentRef} onClick={stopCardClick}>{children}</div>;
};

const toLeafletBounds = (bounds: Required<IMapViewport>['bounds']) =>
    L.latLngBounds([bounds.south, bounds.west], [bounds.north, bounds.east]);

/**
 * Keeps Leaflet's cached container size in step with the element.
 *
 * Leaflet measures its container once, at creation, and only re-measures on a window resize - so a map
 * mounted before its host lays out the element (a hidden tab, an unsized container) caches a zero size and
 * every coordinate it computes turns `NaN` for good. Returns whether the map currently has a usable size, so
 * the caller can hold off applying a viewport until it does.
 */
const useMeasuredMap = (map: L.Map): boolean => {
    const hasUsableSize = () => {
        const size = map.getSize();
        return size.x > 0 && size.y > 0;
    };
    const [hasSize, setHasSize] = useState(hasUsableSize);

    useEffect(() => {
        const measure = () => {
            map.invalidateSize({ animate: false });
            setHasSize(hasUsableSize());
        };
        const observer = new ResizeObserver(measure);
        observer.observe(map.getContainer());
        measure();
        return () => observer.disconnect();
        //hasUsableSize closes over map alone, and re-running on every render would thrash the observer
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    return hasSize;
};

const ApplyViewport = (props: Pick<IMapProviderProps, 'viewport'>) => {
    const map = useMap();
    const hasSize = useMeasuredMap(map);

    useEffect(() => {
        const { bounds, center, zoom, padding } = props.viewport;
        //fitting bounds inside a map of no width divides by zero, which poisons the map with NaN for good
        if (!hasSize || !isFiniteMapViewport(props.viewport)) {
            return;
        }
        try {
            if (bounds) {
                //clamped to the container, so a box mid-layout cannot drive Leaflet's zoom math to NaN
                const size = map.getSize();
                const safePadding = getSafeFitPadding(size.x, size.y, padding ?? DEFAULT_MAP_VIEWPORT_OPTIONS.padding);
                map.fitBounds(toLeafletBounds(bounds), { padding: [safePadding, safePadding] });
            } else {
                map.setView([center.latitude, center.longitude], zoom);
            }
        } catch (error) {
            console.warn('LeafletMapProvider: failed to apply the requested viewport:', error);
        }
        //a fit measured while the browser was still laying the container out can still leave the zoom NaN,
        //and Leaflet never recovers on its own - fall back to the plain centre and zoom
        if (!Number.isFinite(map.getZoom())) {
            map.setView([center.latitude, center.longitude], zoom);
        }
    }, [map, props.viewport, hasSize]);

    return null;
};

const ReportViewport = (props: Pick<IMapProviderProps, 'viewport' | 'onViewportChange'>) => {
    const report = (map: L.Map) => {
        let reported: IMapViewport;
        try {
            const center = map.getCenter();
            const bounds = map.getBounds();
            reported = {
                center: { latitude: center.lat, longitude: center.lng },
                zoom: map.getZoom(),
                bounds: {
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest()
                }
            };
        } catch (error) {
            //a map the browser has not laid out throws instead of answering, and has nothing to report anyway
            return;
        }
        //the same map can also answer with NaN, which must not reach the output or the next provider
        if (isFiniteMapViewport(reported)) {
            props.onViewportChange(reported);
        }
    };

    useMapEvents({
        moveend: (event) => report(event.target),
        zoomend: (event) => report(event.target)
    });

    return null;
};

const ReportMapClick = (props: { onMapClick: (coordinates: { latitude: number; longitude: number }) => void }) => {
    useMapEvents({
        click: (event) => {
            if (!isMapSurfaceClick(event.originalEvent?.target)) {
                return;
            }
            props.onMapClick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
        }
    });

    return null;
};

/**
 * The Leaflet renderer behind every tile based provider here, so a provider for a raster tile service is only
 * a tile url and whatever chrome its licence asks for.
 */
export const LeafletMap = (props: IMapProviderProps & ILeafletMapConfig) => {
    const {
        locations,
        routes,
        viewport,
        selectedLocationIds,
        theme,
        openCards,
        isPinDraggable,
        onLocationClick,
        onViewportChange,
        onCloseCard,
        onLocationDragEnd,
        onMapClick
    } = props;
    const tileLayerUrl = props.tileLayerUrl ?? DEFAULT_TILE_LAYER_URL;
    const attribution = props.attribution ?? DEFAULT_ATTRIBUTION;
    const invertTiles = !!theme.isInverted && (props.invertTilesInDarkTheme ?? true);
    const styles = useMemo(() => getLeafletMapProviderStyles(invertTiles), [invertTiles]);
    //icons are cached per appearance and per group size, so panning does not rebuild one per pin per frame
    const iconCache = useMemo(() => new Map<string, L.DivIcon>(), [theme.palette.themePrimary, theme.palette.white]);
    const getIcon = (location: IMapLocation) => {
        const key = location.cluster
            ? `cluster|${location.cluster.count}`
            : `pin|${location.pin?.color ?? ''}|${location.pin?.url ?? ''}|${location.pin?.svg ?? ''}|${location.pin?.width ?? ''}x${location.pin?.height ?? ''}`;
        const cached = iconCache.get(key);
        if (cached) {
            return cached;
        }
        const built = location.cluster
            ? getClusterIcon(location.cluster.count, theme.palette.themePrimary, theme.palette.white)
            : getPinIcon(location, theme.palette.themePrimary);
        iconCache.set(key, built);
        return built;
    };
    const selection = useMapPinSelection(selectedLocationIds);
    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<L.Popup>(null);
    const cardMaxHeight = useCardMaxHeight(containerRef);
    //leaflet opens one popup at a time, so the first card the control asked for is the one anchored
    const openCard = openCards[0];
    //a stable identity per coordinate: react-leaflet re-adds the popup whenever `position` changes identity
    const openCardLatitude = openCard?.coordinates.latitude;
    const openCardLongitude = openCard?.coordinates.longitude;
    const openCardPosition = useMemo<[number, number] | undefined>(
        () => (openCardLatitude === undefined || openCardLongitude === undefined ? undefined : [openCardLatitude, openCardLongitude]),
        [openCardLatitude, openCardLongitude]
    );
    //keyed per location, so a selection or viewport re-render does not hand react-leaflet a new identity to rebind on
    const markerEventHandlers = useMemo(() => {
        const handlers = new Map<string, L.LeafletEventHandlerFnMap>();
        locations.forEach((location) => handlers.set(location.id, {
            click: (event) => {
                const mouse = (event as L.LeafletMouseEvent).originalEvent;
                onLocationClick(location, { ctrlKey: mouse?.ctrlKey, metaKey: mouse?.metaKey, shiftKey: mouse?.shiftKey });
            },
            dragend: (event) => {
                const { lat, lng } = (event.target as L.Marker).getLatLng();
                onLocationDragEnd?.(location, { latitude: lat, longitude: lng });
            }
        }));
        return handlers;
    }, [locations, onLocationClick, onLocationDragEnd]);

    return (
        <div ref={containerRef} className={styles.container}>
            <MapContainer
                center={[viewport.center.latitude, viewport.center.longitude]}
                zoom={viewport.zoom}
                className={styles.map}>
                <TileLayer
                    //react-leaflet 3 only forwards opacity and z-index to an existing layer, so a new url needs a fresh one
                    key={`${tileLayerUrl}|${attribution}`}
                    attribution={attribution}
                    url={tileLayerUrl}
                    minZoom={props.minZoom}
                    maxZoom={props.maxZoom} />
                <ApplyViewport viewport={viewport} />
                <ReportViewport viewport={viewport} onViewportChange={onViewportChange} />
                {onMapClick && <ReportMapClick onMapClick={onMapClick} />}
                {openCard &&
                    <Popup
                        ref={popupRef}
                        //a popup with no parent marker opens as it mounts, and closes whichever was open
                        key={openCard.locationId}
                        position={openCardPosition!}
                        maxWidth={CARD_MAX_WIDTH}
                        //one scrollbar, owned by Leaflet's scrolled-popup handling - cards inside must not scroll themselves;
                        //capped by the map's own height so the popup always fits it (useCardMaxHeight)
                        maxHeight={cardMaxHeight}
                        //panned clear of the zoom control, which is drawn above popups and would cover a card's top left corner
                        autoPanPaddingTopLeft={POPUP_AUTO_PAN_PADDING_TOP_LEFT}
                        autoPanPaddingBottomRight={POPUP_AUTO_PAN_PADDING_BOTTOM_RIGHT}
                        onClose={onCloseCard && (() => onCloseCard(openCard.locationId))}>
                        <KeepPopupInView popupRef={popupRef}>{openCard.content}</KeepPopupInView>
                    </Popup>}
                {routes.map((route) => (
                    <Polyline
                        //a snapped path is a different line, so react-leaflet needs a new identity to redraw
                        key={`${route.id}|${route.path ? 'snapped' : 'straight'}`}
                        positions={(route.path ?? route.locations).map((point) => [point.latitude, point.longitude])}
                        color={route.color ?? theme.palette.themePrimary}
                        weight={ROUTE_STROKE_WEIGHT} />
                ))}
                {/* the label lives on the marker's tooltip; the card the control opens is the popup below */}
                {locations.map((location) => (
                    <Marker
                        key={location.id}
                        position={[location.latitude, location.longitude]}
                        icon={getIcon(location)}
                        title={location.pin?.title ?? location.label}
                        draggable={isPinDraggable?.(location) ?? false}
                        opacity={selection.getOpacity(location)}
                        eventHandlers={markerEventHandlers.get(location.id)} />
                ))}
            </MapContainer>
            {props.overlay}
        </div>
    );
};

/**
 * Provider backed by Leaflet and, by default, the public OpenStreetMap tiles. Pass a resolver instead of a
 * config for a service whose tiles depend on what the control hands the provider.
 */
export const createLeafletMapProvider = (config?: ILeafletMapConfig | ILeafletMapConfigResolver): IMapProvider => {
    return (props: IMapProviderProps) =>
        <LeafletMap {...props} {...(typeof config === 'function' ? config(props) : config)} />;
};
