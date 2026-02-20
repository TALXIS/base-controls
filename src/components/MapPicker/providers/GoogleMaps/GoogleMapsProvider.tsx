import { APIProvider, Map, AdvancedMarker, Pin, Marker } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import { IMapProvider, IMapProviderProps } from '../IMapProvider';
import './GoogleMapsProvider.css';

export interface IGoogleMapsConfig {
    apiKey: string;
}

const GoogleMapsMap = (props: IMapProviderProps & { apiKey: string }) => {
    const center = useMemo(() => {
        if (props.locations.length === 0) return { lat: 0, lng: 0 };
        const lat = props.locations.reduce((s, l) => s + l.latitude, 0) / props.locations.length;
        const lng = props.locations.reduce((s, l) => s + l.longitude, 0) / props.locations.length;
        return { lat, lng };
    }, [props.locations]);

    return (
        <APIProvider apiKey={props.apiKey}>
            <div className='google-maps-container'>
                <Map defaultCenter={center} defaultZoom={13} disableDefaultUI style={{ width: '100%', height: '400px' }}>
                    {props.locations.map((location) => (
                        // To use AdvancedMarker, we need mapid
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
