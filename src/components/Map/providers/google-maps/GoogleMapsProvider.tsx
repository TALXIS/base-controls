import { APIProvider, ColorScheme, InfoWindow, Map as GoogleMap, MapCameraChangedEvent, Marker, Polyline, useApiIsLoaded, useMap } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createGoogleMapsDirectionsService } from './directions';
import { createGoogleMapsGeocoder } from './geocoder';
import { IMapLocation, IMapProvider, IMapProviderProps } from '../provider';
import { isMapSurfaceClick } from '../mapClick';
import { getClusterPinSize, getClusterPinSvg, getPinAnchor, getPinSize, getPinSvg, ROUTE_STROKE_WEIGHT, useMapPinSelection, toSvgDataUrl } from '../pinStyle';
import { CARD_MAX_WIDTH } from '../layout';
import { useCardMaxHeight } from '../useCardMaxHeight';
import { GoogleMapsCard } from './GoogleMapsCard';
import { IMapProviderDefinition } from "../provider";
import { IMapViewportRequest } from '../../core/viewport';
import { getGoogleMapsProviderStyles } from './styles';

/**
 * Hides the points of interest Google draws of its own accord, so the only pins on the map are the records.
 * This is the one provider here whose tiles can express it - the raster tile services cannot.
 */
const POI_OFF_STYLES: google.maps.MapTypeStyle[] = [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
];

export interface IGoogleMapsConfig {
    apiKey: string;
}

const ApplyViewport = (props: { viewport: IMapViewportRequest }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) {
            return;
        }
        const { bounds, center, zoom, padding } = props.viewport;
        try {
            //coordinates come off the dataset unvalidated, so a malformed one must not throw out of the effect
            if (bounds) {
                map.fitBounds(bounds, padding);
                return;
            }
            map.setCenter({ lat: center.latitude, lng: center.longitude });
            map.setZoom(zoom);
        } catch (error) {
            console.warn('GoogleMapsProvider: failed to apply the requested viewport:', error);
        }
    }, [map, props.viewport]);

    return null;
};

interface IMapPinsProps extends Pick<IMapProviderProps, 'locations' | 'theme' | 'isPinDraggable' | 'onLocationClick' | 'onLocationDragEnd'> {
    selection: ReturnType<typeof useMapPinSelection>;
}

/**
 * The record pins.
 *
 * Held back until the Maps JS API is there: an icon is built out of `google.maps.Size` and
 * `google.maps.Point`, neither of which exists before the api script has loaded - and a marker has nothing to
 * attach to until then either.
 */
const MapPins = (props: IMapPinsProps) => {
    const { locations, selection, theme, isPinDraggable, onLocationClick, onLocationDragEnd } = props;
    const isApiLoaded = useApiIsLoaded();

    if (!isApiLoaded) {
        return null;
    }

    return (
        <>
            {locations.map((location) => (
                <Marker
                    key={location.id}
                    position={{ lat: location.latitude, lng: location.longitude }}
                    title={location.cluster ? `${location.cluster.count}` : location.pin?.title ?? location.label}
                    icon={getPinIcon(location, theme.palette.themePrimary, theme.palette.white)}
                    draggable={isPinDraggable?.(location) ?? false}
                    opacity={selection.getOpacity(location)}
                    zIndex={location.cluster ? 1000 + location.cluster.count : selection.isSelected(location) ? 1 : undefined}
                    onClick={(event) => {
                        const mouse = event.domEvent as MouseEvent | undefined;
                        onLocationClick(location, { ctrlKey: mouse?.ctrlKey, metaKey: mouse?.metaKey, shiftKey: mouse?.shiftKey });
                    }}
                    onDragEnd={onLocationDragEnd && ((event) => {
                        const position = event.latLng;
                        if (position) {
                            onLocationDragEnd(location, { latitude: position.lat(), longitude: position.lng() });
                        }
                    })} />
            ))}
        </>
    );
};

const GoogleMapsMap = (props: IMapProviderProps & IGoogleMapsConfig) => {
    const {
        apiKey,
        locations,
        routes,
        viewport,
        selectedLocationIds,
        theme,
        openCards,
        isPinDraggable,
        showPointsOfInterest,
        onLocationClick,
        onViewportChange,
        onCloseCard,
        onLocationDragEnd,
        onMapClick
    } = props;
    const styles = useMemo(() => getGoogleMapsProviderStyles(), []);
    const selection = useMapPinSelection(selectedLocationIds);

    const onCameraChanged = useCallback((event: MapCameraChangedEvent) => {
        onViewportChange({
            center: { latitude: event.detail.center.lat, longitude: event.detail.center.lng },
            zoom: event.detail.zoom,
            bounds: event.detail.bounds
        });
    }, [onViewportChange]);

    const containerRef = useRef<HTMLDivElement>(null);
    const cardMaxHeight = useCardMaxHeight(containerRef);

    return (
        <APIProvider apiKey={apiKey}>
            <div ref={containerRef} className={styles.container}>
                <GoogleMap
                    defaultCenter={{ lat: viewport.center.latitude, lng: viewport.center.longitude }}
                    defaultZoom={viewport.zoom}
                    colorScheme={theme.isInverted ? ColorScheme.DARK : ColorScheme.LIGHT}
                    disableDefaultUI
                    styles={showPointsOfInterest ? undefined : POI_OFF_STYLES}
                    onCameraChanged={onCameraChanged}
                    onClick={onMapClick && ((event) => {
                        const position = event.detail.latLng;
                        if (position && isMapSurfaceClick(event.domEvent?.target)) {
                            onMapClick({ latitude: position.lat, longitude: position.lng });
                        }
                    })}
                    className={styles.map}>
                    <ApplyViewport viewport={viewport} />
                    {openCards.map((card) => (
                        <InfoWindow
                            key={card.locationId}
                            position={{ lat: card.coordinates.latitude, lng: card.coordinates.longitude }}
                            maxWidth={CARD_MAX_WIDTH}
                            //Google steals focus into the window otherwise, which pulls the page around
                            shouldFocus={false}
                            onCloseClick={onCloseCard && (() => onCloseCard(card.locationId))}>
                            <GoogleMapsCard containerRef={containerRef} className={styles.card} maxHeight={cardMaxHeight}>
                                {card.content}
                            </GoogleMapsCard>
                        </InfoWindow>))}
                    {routes.map((route) => (
                        <Polyline
                            key={route.id}
                            path={(route.path ?? route.locations).map((point) => ({ lat: point.latitude, lng: point.longitude }))}
                            strokeColor={route.color ?? theme.palette.themePrimary}
                            strokeWeight={ROUTE_STROKE_WEIGHT} />
                    ))}
                    <MapPins
                        locations={locations}
                        selection={selection}
                        theme={theme}
                        isPinDraggable={isPinDraggable}
                        onLocationClick={onLocationClick}
                        onLocationDragEnd={onLocationDragEnd} />
                </GoogleMap>
            </div>
        </APIProvider>
    );
};


/**
 * The icon one pin is drawn with.
 *
 * A pin the control resolved nothing for still gets the shipped shape in the theme's colour, never Google's
 * own default marker - switching providers must not change what the same record looks like.
 */
const getPinIcon = (location: IMapLocation, color: string, textColor: string): google.maps.Icon => {
    if (location.cluster) {
        const size = getClusterPinSize(location.cluster.count);
        return {
            url: toSvgDataUrl(getClusterPinSvg(location.cluster.count, color, textColor)),
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size / 2)
        };
    }
    const size = getPinSize(location.pin);
    const anchor = getPinAnchor(location, size);
    return {
        url: location.pin?.url ?? toSvgDataUrl(location.pin?.svg ?? getPinSvg(location.pin?.color ?? color)),
        scaledSize: new google.maps.Size(size.width, size.height),
        anchor: new google.maps.Point(anchor.x, anchor.y)
    };
};

export const createGoogleMapsProvider = (config: IGoogleMapsConfig): IMapProvider => {
    return (props: IMapProviderProps) => <GoogleMapsMap {...props} apiKey={config.apiKey} />;
};

/**
 * Google Maps as a provider the control configures itself, from the `GoogleApiKey` parameter. Passing it is
 * the host's job because importing this module is what pulls the optional `@vis.gl/react-google-maps` peer
 * dependency into the build; pass it through the `providers` prop. Spread it to adjust: `{ ...googleMapsProvider, label: 'Maps' }`.
 */
export const googleMapsProvider: IMapProviderDefinition = {
    id: 'google',
    label: 'Google Maps',
    apiKeyParameterName: 'GoogleApiKey',
    createProvider: ({ apiKey = '' }) => createGoogleMapsProvider({ apiKey }),
    createGeocoder: createGoogleMapsGeocoder,
    createDirections: createGoogleMapsDirectionsService
};
