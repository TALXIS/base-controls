import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useMemo } from 'react';
import { IMapProvider, IMapProviderProps } from '../IMapProvider';
import { getGoogleMapsProviderStyles } from './styles';

export interface IGoogleMapsConfig {
    apiKey: string;
}

//Czechia, used only if there are no pins and the IP-based guess below also fails
const FALLBACK_CENTER = { lat: 49.8175, lng: 15.4730 };
const FALLBACK_ZOOM = 6;
//fitBounds on a single point collapses to the max zoom level, so it needs its own fixed zoom
const SINGLE_LOCATION_ZOOM = 15;
//IP-based geolocation is coarse, so the guessed view stays zoomed out enough to tolerate it being off by a city or two
const IP_GUESS_ZOOM = 8;
//lets a fast-loading dataset win the race and skip the network call entirely
const IP_GUESS_DEBOUNCE_MS = 400;
const IP_GUESS_TIMEOUT_MS = 2500;

const fetchIpGeoData = async (signal: AbortSignal) => {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal });
        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
};

const guessLocationFromIp = async (signal: AbortSignal) => {
    const data = await fetchIpGeoData(signal);
    if (!data) {
        return null;
    }
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
};

const getBoundsLiteral = (locations: IMapProviderProps['locations']): google.maps.LatLngBoundsLiteral => {
    let north = locations[0].latitude;
    let south = locations[0].latitude;
    let east = locations[0].longitude;
    let west = locations[0].longitude;
    for (const location of locations) {
        north = Math.max(north, location.latitude);
        south = Math.min(south, location.latitude);
        east = Math.max(east, location.longitude);
        west = Math.min(west, location.longitude);
    }
    return { north, south, east, west };
};

const FitBoundsOnLocationsChange = (props: { locations: IMapProviderProps['locations'] }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) {
            return;
        }
        if (props.locations.length === 0) {
            const controller = new AbortController();
            const debounce = setTimeout(() => {
                const timeout = setTimeout(() => controller.abort(), IP_GUESS_TIMEOUT_MS);
                guessLocationFromIp(controller.signal).then((location) => {
                    clearTimeout(timeout);
                    if (!location) {
                        return;
                    }
                    map.setCenter(location);
                    map.setZoom(IP_GUESS_ZOOM);
                });
            }, IP_GUESS_DEBOUNCE_MS);

            return () => {
                clearTimeout(debounce);
                controller.abort();
            };
        } try {
            if (props.locations.length === 1) {
                map.setCenter({ lat: props.locations[0].latitude, lng: props.locations[0].longitude });
                map.setZoom(SINGLE_LOCATION_ZOOM);
                return;
            }
            map.fitBounds(getBoundsLiteral(props.locations), 48);
        } catch (error) {
            console.warn('Map: failed to fit the viewport to the current pins:', error);
        }
    }, [map, props.locations]);

    return null;
};

const GoogleMapsMap = (props: IMapProviderProps & { apiKey: string }) => {
    const styles = useMemo(() => getGoogleMapsProviderStyles(), []);

    return (
        <APIProvider apiKey={props.apiKey}>
            <div className={styles.container}>
                <Map defaultCenter={FALLBACK_CENTER} defaultZoom={FALLBACK_ZOOM} disableDefaultUI style={{ width: '100%', height: '100%' }}>
                    <FitBoundsOnLocationsChange locations={props.locations} />
                    {props.locations.map((location) => (
                        <Marker key={location.id} position={{ lat: location.latitude, lng: location.longitude }} />
                    ))}
                </Map>
            </div>
        </APIProvider>
    );
};

export const createGoogleMapsProvider = (config: IGoogleMapsConfig): IMapProvider => {
    return (props: IMapProviderProps) => <GoogleMapsMap {...props} apiKey={config.apiKey} />;
};
