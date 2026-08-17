import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { mergeStyleSets } from '@fluentui/react'
import { IMapProvider, IMapProviderProps } from '@talxis/base-controls/components/Map'

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const styles = mergeStyleSets({
    container: {
        width: '100%',
        height: '100%',
        minHeight: 200,
        flex: 1,
    },
})

const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const FitToLocations = ({ locations }: IMapProviderProps) => {
    const map = useMap()

    useEffect(() => {
        if (locations.length === 0) return
        if (locations.length === 1) {
            map.setView([locations[0].latitude, locations[0].longitude], 13)
            return
        }
        map.fitBounds(L.latLngBounds(locations.map((location) => [location.latitude, location.longitude])), { padding: [32, 32] })
    }, [map, locations])

    return null
}

const LeafletMap = (props: IMapProviderProps) => {
    const defaultCenter = useMemo<[number, number]>(() => {
        if (props.locations.length === 0) return [0, 0]
        return [props.locations[0].latitude, props.locations[0].longitude]
    }, [props.locations])

    return (
        <div className={styles.container}>
            <MapContainer center={defaultCenter} zoom={13} style={{ width: '100%', height: '100%' }}>
                <TileLayer attribution={attribution} url={tileLayerUrl} />
                <FitToLocations {...props} />
                {props.locations.map((location) => (
                    <Marker key={location.id} position={[location.latitude, location.longitude]}>
                        <Popup>{location.id}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export const createLeafletMapProvider = (): IMapProvider => LeafletMap
