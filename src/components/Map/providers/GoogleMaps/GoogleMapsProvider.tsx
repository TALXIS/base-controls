import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import { IMapProvider, IMapProviderProps } from '../IMapProvider';
import { getGoogleMapsProviderStyles } from './styles';

export interface IGoogleMapsConfig {
    apiKey: string;
}

const GoogleMapsMap = (props: IMapProviderProps & { apiKey: string }) => {
    const styles = useMemo(() => getGoogleMapsProviderStyles(), []);

    const center = useMemo(() => {
        if (props.locations.length === 0) return { lat: 0, lng: 0 };
        const lat = props.locations.reduce((s, l) => s + l.latitude, 0) / props.locations.length;
        const lng = props.locations.reduce((s, l) => s + l.longitude, 0) / props.locations.length;
        return { lat, lng };
    }, [props.locations]);

    return (
        <APIProvider apiKey={props.apiKey}>
            <div className={styles.container}>
                <Map center={center} defaultZoom={13} disableDefaultUI style={{ width: '100%', height: '100%' }}>
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
